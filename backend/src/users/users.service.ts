import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findOneByEmail(email: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { email: email.toLowerCase().trim() },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (user) {
      user.id = Number(user.id);
    }
    return user;
  }

  async findOneById(id: number): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { id },
    });
    if (user) {
      user.id = Number(user.id);
    }
    return user;
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create({
      ...userData,
      email: userData.email?.toLowerCase().trim(),
    });
    const saved = await this.userRepository.save(user);
    saved.id = Number(saved.id);
    return saved;
  }
}
