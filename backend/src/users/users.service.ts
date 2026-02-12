import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import admin from '../../config/firebase-admin';
import { Invitation } from '../invitations/invitation.entity';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Invitation)
    private inviteRepo: Repository<Invitation>,
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

  async updateMemberPermissions(
    firebaseUid: string,
    memberId: string,
    body: any,
  ): Promise<User> {
    const requester = await this.userRepo.findOne({
      where: { firebase_uid: firebaseUid },
    });

    if (!requester) {
      throw new NotFoundException('User account was not found.');
    }

    if (requester.role !== 'owner') {
      throw new ForbiddenException('Only an owner can update permissions.');
    }

    const member = await this.userRepo.findOne({
      where: { id: memberId },
    });

    if (!member) {
      throw new NotFoundException('Member account was not found.');
    }

    if (member.family_owner_id !== requester.id) {
      throw new ForbiddenException(
        'You can update permissions only for users in your family.',
      );
    }

    const nextPermissions = {
      permission_view:
        typeof body?.view === 'boolean' ? body.view : member.permission_view,
      permission_edit:
        typeof body?.edit === 'boolean' ? body.edit : member.permission_edit,
      permission_delete:
        typeof body?.delete === 'boolean'
          ? body.delete
          : member.permission_delete,
    };

    await this.userRepo.update({ id: member.id }, nextPermissions);

    const updatedMember = await this.userRepo.findOne({
      where: { id: member.id },
    });
    if (!updatedMember) {
      throw new NotFoundException('Member account was not found.');
    }

    return updatedMember;
  }

  async deleteFamilyMember(
    firebaseUid: string,
    memberId: string,
  ): Promise<void> {
    const requester = await this.userRepo.findOne({
      where: { firebase_uid: firebaseUid },
    });

    if (!requester) {
      throw new NotFoundException('User account was not found.');
    }

    if (requester.role !== 'owner') {
      throw new ForbiddenException('Only an owner can delete members.');
    }

    if (requester.id === memberId) {
      throw new ForbiddenException('Owner cannot delete their own account.');
    }

    const member = await this.userRepo.findOne({
      where: { id: memberId },
    });

    if (!member) {
      throw new NotFoundException('Member account was not found.');
    }

    if (member.family_owner_id !== requester.id) {
      throw new ForbiddenException(
        'You can delete only members in your family.',
      );
    }

    if (member.firebase_uid) {
      try {
        await admin.auth().deleteUser(member.firebase_uid);
      } catch (error: any) {
        if (error?.code !== 'auth/user-not-found') {
          throw new InternalServerErrorException(
            'Failed to delete member from Firebase.',
          );
        }
      }
    }

    await this.inviteRepo.delete({
      owner_id: requester.id,
      email: member.email,
    });

    await this.userRepo.delete({ id: member.id });
  }
}
