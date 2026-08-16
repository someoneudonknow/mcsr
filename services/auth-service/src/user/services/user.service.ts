import { Tenants } from '#entity/identities.model';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Tenants) private readonly userRepo: Repository<Tenants>,
  ) {}

  async findById(id: string): Promise<Tenants | null> {
    return await this.userRepo.findOneBy({ id });
  }

  async findByOrganizationId(organizationId: string): Promise<Tenants | null> {
    return await this.userRepo.findOneBy({ organizationId });
  }

  async findByEmail(email: string): Promise<Tenants | null> {
    return await this.userRepo.findOneBy({ email });
  }

  async findByUsername(username: string): Promise<Tenants | null> {
    return await this.userRepo.findOneBy({ username });
  }

  async findByUsernameOrEmail({
    username,
    email,
  }: {
    username: string;
    email: string;
  }): Promise<Tenants | null> {
    return await this.userRepo.findOneBy([{ email }, { username }]);
  }

  async create(data: Partial<Tenants>): Promise<Tenants> {
    const user = this.userRepo.create(data);
    return await this.userRepo.save(user);
  }
}
