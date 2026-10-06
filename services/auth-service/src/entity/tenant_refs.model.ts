import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('tenant_refs')
export class TenantRefs {
  @PrimaryColumn({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'slug', type: 'varchar', length: 63, unique: true })
  slug!: string;

  @Column({ name: 'max_seats', type: 'int', default: 5 })
  maxSeats!: number;

  @Column({ name: 'can_auth', type: 'boolean', default: false })
  canAuth!: boolean;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
