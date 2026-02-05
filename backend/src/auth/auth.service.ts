import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async validateUser(firebaseUser: any): Promise<User> {
    try {
      const { uid } = firebaseUser;

      const user = await this.userRepo.findOne({
        where: { firebase_uid: uid },
      });

      if (!user) {
        throw new NotFoundException('USER_NOT_REGISTERED');
      }

      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('AUTH_FAILED');
    }
  }

  async registerUser(firebaseUser: any, body: any): Promise<User> {
    const { uid, email } = firebaseUser;

    const existing = await this.userRepo.findOne({
      where: { firebase_uid: uid },
    });

    if (existing) return existing;

    const user = this.userRepo.create({
      firebase_uid: uid,
      email,
      name: body?.name || null,
      role: body?.role || 'member',
    });

    return this.userRepo.save(user);
  }
}
