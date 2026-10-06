import { Module } from '@nestjs/common';
import { IdentityService } from './services';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Identities } from '#entity/identities.model';

@Module({
  imports: [TypeOrmModule.forFeature([Identities])],
  providers: [IdentityService],
  exports: [IdentityService],
})
export class IdentityModule {}
