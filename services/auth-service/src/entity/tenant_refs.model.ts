import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tenant_refs')
export class TenantRefs {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'slug', type: 'varchar', length: 63, unique: true })
  slug!: string;

  @Column({ name: 'max_seats', type: 'number', default: 5 })
  maxSeats!: number;

  @Column({ name: 'can_auth', type: 'boolean', default: 'false' })
  canAuth!: boolean;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
