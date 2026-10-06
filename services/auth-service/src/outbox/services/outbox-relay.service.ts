import { OutboxEvent } from '#entity/outbox-event.model';
import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { KAFKA_CLIENT } from 'src/kafka/constants';
import { IsNull, LessThan, Repository } from 'typeorm';
import { BATCH_SIZE, MAX_ATTEMPTS, POLL_INTERVAL_MS } from '../constants';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class OutboxRelayService implements OnModuleDestroy, OnModuleInit {
  private readonly logger = new Logger(OutboxRelayService.name);
  private timerId?: NodeJS.Timeout;
  private running = false;

  constructor(
    @Inject(KAFKA_CLIENT) private readonly kafkaClient: ClientKafka,
    @InjectRepository(OutboxEvent)
    private readonly outboxEventRepo: Repository<OutboxEvent>,
  ) {}

  onModuleInit() {
    this.timerId = setInterval(() => void this.drain(), POLL_INTERVAL_MS);
  }

  onModuleDestroy() {
    if (this.timerId) {
      clearInterval(this.timerId);
    }
  }

  private async drain() {
    if (this.running) return;
    this.running = true;

    try {
      const pending = await this.outboxEventRepo.find({
        where: { publishedAt: IsNull(), attempts: LessThan(MAX_ATTEMPTS) },
        order: {
          createdAt: 'ASC',
        },
        take: BATCH_SIZE,
      });

      for (const event of pending) {
        try {
          await firstValueFrom(
            this.kafkaClient.emit(event.eventType, {
              key: event.partitionKey,
              value: event.payload,
            }),
          );
          await this.outboxEventRepo.update(event.id, {
            publishedAt: new Date(),
          });
        } catch (error: unknown) {
          await this.outboxEventRepo.increment({ id: event.id }, 'attempts', 1);
          this.logger.error(`Publish failed for ${event.id}: ${error}`);
        }
      }
    } catch (error: unknown) {
      this.logger.error('Outbox relay error: ', error);
    } finally {
      this.running = false;
    }
  }
}
