import { Exclude } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsUrl } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  @IsNotEmpty()
  username!: string;

  @Column({ type: 'varchar', unique: true, nullable: false })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @Column({ type: 'varchar', nullable: true, default: '' })
  @IsUrl()
  avatar!: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @Column({ type: 'varchar', nullable: false })
  @Exclude()
  @IsNotEmpty()
  password!: string;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive!: boolean;
}
