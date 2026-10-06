import { Controller, Logger } from '@nestjs/common';
import { OrganizationSyncService } from '../services';
import {
  Ctx,
  EventPattern,
  KafkaContext,
  Payload,
} from '@nestjs/microservices';
import { OrganizationEvents } from '../constants';
import {
  OrganizationActivatedEvent,
  OrganizationSuspendedEvent,
} from '../interfaces';

@Controller()
export class OrganizationEventsController {
  private readonly logger = new Logger(OrganizationEventsController.name);

  constructor(
    private readonly organizationSyncService: OrganizationSyncService,
  ) {}

  @EventPattern(OrganizationEvents.ACTIVATED)
  async onActivated(
    @Payload() event: OrganizationActivatedEvent,
    @Ctx() context: KafkaContext,
  ) {
    this.logger.log(
      `${OrganizationEvents.ACTIVATED} tenant=${event.tenantId} ` +
        `partition=${context.getPartition()} offset=${context.getMessage().offset}`,
    );
    await this.organizationSyncService.applyActivated(event);
  }

  @EventPattern(OrganizationEvents.SUSPENDED)
  async onSuspended(
    @Payload() event: OrganizationSuspendedEvent,
    @Ctx() context: KafkaContext,
  ) {
    this.logger.log(
      `${OrganizationEvents.SUSPENDED} tenant=${event.tenantId} partition=${context.getPartition()} offset=${context.getMessage().offset}`,
    );
    await this.organizationSyncService.applySuspended(event);
  }
}
