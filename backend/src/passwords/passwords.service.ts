import {
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from 'crypto';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { PasswordRecord } from './password.entity';
import { PermissionsService } from '../permissions/permissions.service';
import { USER_ROLES } from '../utils/constants';

@Injectable()
export class PasswordsService {
  private static readonly ENCRYPTION_ALGORITHM = 'aes-256-gcm';
  private static readonly IV_LENGTH = 12;

  constructor(
    @InjectRepository(PasswordRecord)
    private passwordRepo: Repository<PasswordRecord>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private permissionsService: PermissionsService,
  ) {}

  async getPasswords(firebaseUid: string) {
    const requester = await this.getRequester(firebaseUid);
    const permissions = await this.permissionsService.getModuleCrudPermissions(
      requester,
      'passwords',
    );
    this.ensureCanViewPasswords(permissions);

    const familyOwnerId = this.getFamilyOwnerId(requester);

    const records = await this.passwordRepo.find({
      where: { family_owner_id: familyOwnerId },
      order: { created_at: 'DESC' },
    });

    const visibleItems = records.filter((item) =>
      this.canViewPassword(item, requester.id),
    );

    return {
      items: visibleItems.map((item) => this.withDecryptedPassword(item)),
      permissions,
    };
  }

  async createPassword(
    firebaseUid: string,
    body: any,
  ): Promise<PasswordRecord> {
    const requester = await this.getRequester(firebaseUid);
    const permissions = await this.permissionsService.getModuleCrudPermissions(
      requester,
      'passwords',
    );
    this.ensureCanEditPasswords(permissions);

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
      password_value: this.encryptPassword(
        this.requireField(body?.password, 'Password is required.'),
      ),
      visibility,
      shared_with_user_ids:
        visibility === 'specific' && sharedWithUserIds.length
          ? sharedWithUserIds
          : null,
    });

    const saved = await this.passwordRepo.save(record);
    return this.withDecryptedPassword(saved);
  }

  async updatePassword(
    firebaseUid: string,
    passwordId: string,
    body: any,
  ): Promise<PasswordRecord> {
    const requester = await this.getRequester(firebaseUid);
    const permissions = await this.permissionsService.getModuleCrudPermissions(
      requester,
      'passwords',
    );
    this.ensureCanEditPasswords(permissions);
    const familyOwnerId = this.getFamilyOwnerId(requester);

    const existing = await this.passwordRepo.findOne({
      where: { id: passwordId, family_owner_id: familyOwnerId },
    });

    if (!existing) {
      throw new NotFoundException('Password record not found in your family.');
    }

    if (
      requester.role !== USER_ROLES.OWNER &&
      existing.created_by_user_id !== requester.id
    ) {
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
          ? this.encryptPassword(
              this.requireField(body?.password, 'Password is required.'),
            )
          : existing.password_value,
      visibility,
      shared_with_user_ids:
        visibility === 'specific' && sharedWithUserIds.length
          ? sharedWithUserIds
          : null,
    });

    return this.withDecryptedPassword(updated);
  }

  async deletePassword(firebaseUid: string, passwordId: string): Promise<void> {
    const requester = await this.getRequester(firebaseUid);
    const permissions = await this.permissionsService.getModuleCrudPermissions(
      requester,
      'passwords',
    );
    this.ensureCanEditPasswords(permissions);
    const familyOwnerId = this.getFamilyOwnerId(requester);

    const existing = await this.passwordRepo.findOne({
      where: { id: passwordId, family_owner_id: familyOwnerId },
    });

    if (!existing) {
      throw new NotFoundException('Password record not found in your family.');
    }

    if (
      requester.role !== USER_ROLES.OWNER &&
      existing.created_by_user_id !== requester.id
    ) {
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
        { id: familyOwnerId, role: USER_ROLES.OWNER },
        { family_owner_id: familyOwnerId, role: USER_ROLES.MEMBER },
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

  private ensureCanViewPasswords(permissions: {
    view: boolean;
    edit: boolean;
    delete: boolean;
  }): void {
    if (!permissions.view) {
      throw new ForbiddenException(
        'You do not have permission to view passwords.',
      );
    }
  }

  private ensureCanEditPasswords(permissions: {
    view: boolean;
    edit: boolean;
    delete: boolean;
  }): void {
    if (!permissions.edit) {
      throw new ForbiddenException(
        'You do not have permission to edit passwords.',
      );
    }
  }

  private getFamilyOwnerId(user: User): string {
    if (user.role === USER_ROLES.OWNER) return user.id;

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

  private withDecryptedPassword(item: PasswordRecord): PasswordRecord {
    return {
      ...item,
      password_value: this.decryptPassword(item.password_value),
    };
  }

  private getEncryptionKey(): Buffer {
    const rawKey = process.env.PASSWORD_ENCRYPTION_KEY?.trim();
    if (!rawKey) {
      throw new InternalServerErrorException(
        'PASSWORD_ENCRYPTION_KEY is not configured.',
      );
    }

    return createHash('sha256').update(rawKey).digest();
  }

  private encryptPassword(value: string): string {
    try {
      const key = this.getEncryptionKey();
      const iv = randomBytes(PasswordsService.IV_LENGTH);
      const cipher = createCipheriv(
        PasswordsService.ENCRYPTION_ALGORITHM,
        key,
        iv,
      );
      const encrypted = Buffer.concat([
        cipher.update(value, 'utf8'),
        cipher.final(),
      ]);
      const authTag = cipher.getAuthTag();

      return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted.toString('base64')}`;
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to encrypt password before saving.',
      );
    }
  }

  private decryptPassword(value: string): string {
    const parts = value?.split(':');
    if (!parts || parts.length !== 3) {
      return value;
    }

    try {
      const [ivBase64, authTagBase64, encryptedBase64] = parts;
      const key = this.getEncryptionKey();
      const iv = Buffer.from(ivBase64, 'base64');
      const authTag = Buffer.from(authTagBase64, 'base64');
      const encrypted = Buffer.from(encryptedBase64, 'base64');
      const decipher = createDecipheriv(
        PasswordsService.ENCRYPTION_ALGORITHM,
        key,
        iv,
      );
      decipher.setAuthTag(authTag);
      const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final(),
      ]);

      return decrypted.toString('utf8');
    } catch {
      return value;
    }
  }
}
