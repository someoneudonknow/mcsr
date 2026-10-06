import { TenantRefs } from '#entity/tenant_refs.model';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationGrpcAdapter } from './adapters';
import { ClientsModule, Transport } from '@nestjs/microservices';
import {
  ORGANIZATION_GRPC,
  ORGANIZATION_GRPC_PACKAGE,
  ORGANIZATION_GRPC_PATH,
} from './constants/organization-grpc.constants';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { ORGANIZATION_PORT } from './organization.port';
import { OrganizationSyncService, TenantDirectoryService } from './services';
import { OrganizationEventsController } from './controllers';

@Module({
  imports: [
    TypeOrmModule.forFeature([TenantRefs]),
    ClientsModule.registerAsync([
      {
        name: ORGANIZATION_GRPC,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: ORGANIZATION_GRPC_PACKAGE,
            protoPath: join(process.cwd(), ORGANIZATION_GRPC_PATH),
            url: config.get<string>('grpc.organization.url'),
          },
        }),
      },
    ]),
  ],
  controllers: [OrganizationEventsController],
  providers: [
    {
      useClass: OrganizationGrpcAdapter,
      provide: ORGANIZATION_PORT,
    },
    TenantDirectoryService,
    OrganizationSyncService,
  ],
  exports: [ORGANIZATION_PORT, TenantDirectoryService],
})
export class OrganizationModule {}
