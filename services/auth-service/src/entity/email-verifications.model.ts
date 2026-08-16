import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('email_verifications')
export class EmailVerifications {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index('idx_email_verification_identity')
  @Column({ type: 'uuid', name: 'identity_id' })
  identityId!: string;

  @Column({ type: 'char', length: 64, unique: true, name: 'token_hash' })
  tokenHash!: string;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt!: Date;

  @Column({ name: 'consumed_at', nullable: true, type: 'timestamptz' })
  consumedAt!: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
