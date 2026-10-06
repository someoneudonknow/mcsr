export interface OrganizationActivatedEvent {
  tenantId: string;
  slug: string;
  maxSeats: number;
}

export interface OrganizationSuspendedEvent {
  tenantId: string;
}
