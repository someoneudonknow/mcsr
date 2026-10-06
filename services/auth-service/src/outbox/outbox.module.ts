import { Module } from '@nestjs/common';
import { OutboxRelayService } from './services';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OutboxEvent } from '#entity/outbox-event.model';

@Module({
  imports: [TypeOrmModule.forFeature([OutboxEvent])],
  providers: [OutboxRelayService],
})
export class OutboxModule {}
