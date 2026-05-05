import { User } from '#entity/user.model';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async findById(id: string): Promise<User | null> {
    return await this.userRepo.findOneBy({ id });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepo.findOneBy({ email });
  }

  async findByUsername(username: string): Promise<User | null> {
    return await this.userRepo.findOneBy({ username });
  }

  async findByUsernameOrEmail({
    username,
    email,
  }: {
    username: string;
    email: string;
  }): Promise<User | null> {
    return await this.userRepo.findOneBy([{ email }, { username }]);
  }

  async create(data: Partial<User>): Promise<User> {
    const user = this.userRepo.create(data);
    return await this.userRepo.save(user);
  }
}
