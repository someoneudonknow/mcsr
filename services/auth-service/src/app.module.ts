import { AuthModule } from '#auth/auth.module';
import { CommonModule } from '#common/common.module';
import { SuccessResponseTransformInterceptor } from '#common/interceptors/success-response-transform.interceptor';
import { configuration } from '#config/configuration';
import { UserModule } from '#user/user.module';
import {
  ClassSerializerInterceptor,
  Module,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { RedisModule } from './redis/redis.module';
import { RedisModuleOptions } from './redis/redis.type';
import { AuthGuard } from '#common/guards';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env['NODE_ENV'] || 'dev'}`,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (config: ConfigService) => {
        return {
          ...config.get<TypeOrmModuleOptions>('db'),
        };
      },
      inject: [ConfigService],
    }),
    RedisModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        ...config.get<RedisModuleOptions>('redis'),
      }),
      inject: [ConfigService],
    }),
    CommonModule,
    AuthModule,
    UserModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: SuccessResponseTransformInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
