import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userRepo.find({
      order: { created_at: 'DESC' },
    });
  }

  async findFamilyMembers(firebaseUid: string): Promise<User[]> {
    const requester = await this.userRepo.findOne({
      where: { firebase_uid: firebaseUid },
    });

    if (!requester) {
      throw new NotFoundException('User account was not found.');
    }

    const familyOwnerId =
      requester.role === 'owner' ? requester.id : requester.family_owner_id;

    if (!familyOwnerId) {
      return [requester];
    }

    const users = await this.userRepo.find({
      where: [
        { id: familyOwnerId, role: 'owner' },
        { family_owner_id: familyOwnerId, role: 'member' },
      ],
      order: { created_at: 'ASC' },
    });

    return users.sort((a, b) => {
      if (a.role === b.role) return 0;
      return a.role === 'owner' ? -1 : 1;
    });
  }
}
