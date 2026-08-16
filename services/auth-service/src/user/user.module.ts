import { Module } from '@nestjs/common';
import { UserService } from './services';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Identities } from '#entity/identities.model';

@Module({
  imports: [TypeOrmModule.forFeature([Identities])],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
