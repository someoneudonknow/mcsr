import { Exclude } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsUUID } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum IdentityProgress {
  PENDING = 'pending',
  // PROVISIONING = 'provisioning',
  // FAILED = 'failed',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  // PENDING_DELETION = 'pending_deletion',
  // DELETED = 'deleted',
}

export enum IdentityRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
}

@Entity('identities')
@Index('idx_tenant_id_email', ['tenant_id', 'email'], { unique: true })
export class Identities {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'role', enum: IdentityRole, default: IdentityRole.MEMBER })
  role!: IdentityRole;

  @Column({ name: 'tenant_id', type: 'varchar', nullable: false })
  tenantId!: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: IdentityProgress,
    default: IdentityProgress.PENDING,
  })
  status!: IdentityProgress;

  @Column({ name: 'email', type: 'varchar', length: 255, nullable: false })
  email!: string;

  @Column({ name: 'email_verified_at', type: 'timestamptz', nullable: true })
  emailVerifiedAt?: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamptz',
  })
  deletedAt!: Date;

  @Column({ name: 'password_hash', type: 'varchar', nullable: false })
  @Exclude()
  passwordHash!: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;
}
