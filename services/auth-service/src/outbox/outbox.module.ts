import { Module } from '@nestjs/common';
import { OutboxRelayService } from './services';

@Module({
  providers: [OutboxRelayService],
})
export class OutboxModule {}
