import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import admin from '../../config/firebase-admin';

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

      await this.syncFirebaseClaims(user);

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

    if (existing) {
      await this.syncFirebaseClaims(existing);
      return existing;
    }

    const user = this.userRepo.create({
      firebase_uid: uid,
      email,
      name: body?.name || null,
      role: 'owner',
    });

    const savedUser = await this.userRepo.save(user);
    await this.syncFirebaseClaims(savedUser);
    return savedUser;
  }

  private async syncFirebaseClaims(user: User): Promise<void> {
    try {
      const userRecord = await admin.auth().getUser(user.firebase_uid);
      const existingClaims = userRecord.customClaims || {};
      const nextClaims: Record<string, unknown> = {
        ...existingClaims,
        role: user.role,
        is_subscribed: Boolean(user.is_subscribed),
      };

      if (user.name) {
        nextClaims.name = user.name;
      }

      await admin.auth().setCustomUserClaims(user.firebase_uid, nextClaims);

      if (user.name && userRecord.displayName !== user.name) {
        await admin.auth().updateUser(user.firebase_uid, {
          displayName: user.name,
        });
      }
    } catch (error) {
      console.error('Failed to sync Firebase user claims:', {
        uid: user.firebase_uid,
        message: error?.message ?? error,
      });
    }
  }
}
