import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { PasswordRecord } from './password.entity';

@Injectable()
export class PasswordsService {
  constructor(
    @InjectRepository(PasswordRecord)
    private passwordRepo: Repository<PasswordRecord>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async getPasswords(firebaseUid: string) {
    const requester = await this.getRequester(firebaseUid);

    const familyOwnerId = this.getFamilyOwnerId(requester);

    const records = await this.passwordRepo.find({
      where: { family_owner_id: familyOwnerId },
      order: { created_at: 'DESC' },
    });

    const visibleItems = records.filter((item) =>
      this.canViewPassword(item, requester.id),
    );

    return {
      items: visibleItems,
      permissions: { view: true, edit: true, delete: true },
    };
  }

  async createPassword(
    firebaseUid: string,
    body: any,
  ): Promise<PasswordRecord> {
    const requester = await this.getRequester(firebaseUid);

    const familyOwnerId = this.getFamilyOwnerId(requester);

    const visibility = this.getVisibility(body?.visibility);
    const sharedWithUserIds = await this.resolveSharedUsers(
      body?.sharedWith,
      visibility,
      familyOwnerId,
      requester.id,
    );

    const record = this.passwordRepo.create({
      family_owner_id: familyOwnerId,
      created_by_user_id: requester.id,
      site_name: this.requireField(body?.name, 'Site name is required.'),
      website_url: this.clean(body?.websiteUrl),
      category: this.clean(body?.category),
      username_or_email: this.requireField(
        body?.value,
        'Username or email is required.',
      ),
      password_value: this.requireField(
        body?.password,
        'Password is required.',
      ),
      visibility,
      shared_with_user_ids:
        visibility === 'specific' && sharedWithUserIds.length
          ? sharedWithUserIds
          : null,
    });

    return this.passwordRepo.save(record);
  }

  async updatePassword(
    firebaseUid: string,
    passwordId: string,
    body: any,
  ): Promise<PasswordRecord> {
    const requester = await this.getRequester(firebaseUid);
    const familyOwnerId = this.getFamilyOwnerId(requester);

    const existing = await this.passwordRepo.findOne({
      where: { id: passwordId, family_owner_id: familyOwnerId },
    });

    if (!existing) {
      throw new NotFoundException('Password record not found in your family.');
    }

    if (existing.created_by_user_id !== requester.id) {
      throw new ForbiddenException(
        'Only the creator can edit this password record.',
      );
    }

    const visibility = this.getVisibility(
      body?.visibility ?? existing.visibility,
    );
    const sharedWithUserIds = await this.resolveSharedUsers(
      body?.sharedWith ?? existing.shared_with_user_ids,
      visibility,
      familyOwnerId,
      requester.id,
    );

    const updated = await this.passwordRepo.save({
      ...existing,
      site_name:
        body?.name !== undefined
          ? this.requireField(body?.name, 'Site name is required.')
          : existing.site_name,
      website_url:
        body?.websiteUrl !== undefined
          ? this.clean(body?.websiteUrl)
          : existing.website_url,
      category:
        body?.category !== undefined
          ? this.clean(body?.category)
          : existing.category,
      username_or_email:
        body?.value !== undefined
          ? this.requireField(body?.value, 'Username or email is required.')
          : existing.username_or_email,
      password_value:
        body?.password !== undefined
          ? this.requireField(body?.password, 'Password is required.')
          : existing.password_value,
      visibility,
      shared_with_user_ids:
        visibility === 'specific' && sharedWithUserIds.length
          ? sharedWithUserIds
          : null,
    });

    return updated;
  }

  async deletePassword(firebaseUid: string, passwordId: string): Promise<void> {
    const requester = await this.getRequester(firebaseUid);
    const familyOwnerId = this.getFamilyOwnerId(requester);

    const existing = await this.passwordRepo.findOne({
      where: { id: passwordId, family_owner_id: familyOwnerId },
    });

    if (!existing) {
      throw new NotFoundException('Password record not found in your family.');
    }

    if (existing.created_by_user_id !== requester.id) {
      throw new ForbiddenException(
        'Only the creator can delete this password record.',
      );
    }

    await this.passwordRepo.delete({ id: existing.id });
  }

  private async resolveSharedUsers(
    input: any,
    visibility: 'private' | 'family' | 'specific',
    familyOwnerId: string,
    requesterId: string,
  ): Promise<string[]> {
    if (visibility !== 'specific') {
      return [];
    }

    if (!Array.isArray(input)) {
      return [];
    }

    const normalized = Array.from(
      new Set(
        input.filter((id) => typeof id === 'string').map((id) => id.trim()),
      ),
    ).filter(Boolean);

    if (!normalized.length) {
      return [];
    }

    const familyUsers = await this.userRepo.find({
      where: [
        { id: familyOwnerId, role: 'owner' },
        { family_owner_id: familyOwnerId, role: 'member' },
      ],
      select: ['id'],
    });

    const familyUserIdSet = new Set(familyUsers.map((user) => user.id));

    return normalized.filter(
      (id) => familyUserIdSet.has(id) && id !== requesterId,
    );
  }

  private canViewPassword(item: PasswordRecord, requesterId: string): boolean {
    if (item.created_by_user_id === requesterId) {
      return true;
    }

    if (item.visibility === 'family') {
      return true;
    }

    if (item.visibility === 'specific') {
      const sharedWith = item.shared_with_user_ids || [];
      return sharedWith.includes(requesterId);
    }

    return false;
  }

  private getVisibility(value: any): 'private' | 'family' | 'specific' {
    if (value === 'private' || value === 'specific') {
      return value;
    }

    return 'family';
  }

  private async getRequester(firebaseUid: string): Promise<User> {
    const requester = await this.userRepo.findOne({
      where: { firebase_uid: firebaseUid },
    });

    if (!requester) {
      throw new NotFoundException('User account was not found.');
    }

    return requester;
  }

  private getFamilyOwnerId(user: User): string {
    if (user.role === 'owner') return user.id;

    if (!user.family_owner_id) {
      throw new ForbiddenException(
        'Family owner was not found for this account.',
      );
    }

    return user.family_owner_id;
  }

  private clean(value: any): string | null {
    if (typeof value !== 'string') return null;

    const trimmed = value.trim();
    return trimmed || null;
  }

  private requireField(value: any, message: string): string {
    const cleaned = this.clean(value);
    if (!cleaned) {
      throw new BadRequestException(message);
    }

    return cleaned;
  }
}
