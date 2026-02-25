import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PermissionsService } from '../permissions/permissions.service';
import { USER_ROLES } from '../utils/constants';
import { User } from '../users/user.entity';
import { Contact } from '../contacts/contact.entity';
import { PasswordRecord } from '../passwords/password.entity';
import { DocumentFile } from '../documents/document-file.entity';

type RecentActivityItem = {
  id: string;
  user_name: string;
  action: string;
  target_label: string;
  module: 'passwords' | 'documents' | 'contacts' | 'members';
  route: string;
  created_at: Date;
};

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Contact)
    private contactRepo: Repository<Contact>,
    @InjectRepository(PasswordRecord)
    private passwordRepo: Repository<PasswordRecord>,
    @InjectRepository(DocumentFile)
    private documentRepo: Repository<DocumentFile>,
    private permissionsService: PermissionsService,
  ) {}

  private async resolveRequester(firebaseUid: string): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { firebase_uid: firebaseUid },
    });

    if (!user) throw new NotFoundException('User account was not found.');
    return user;
  }

  private resolveFamilyOwnerId(user: User): string {
    return user.role === USER_ROLES.OWNER
      ? user.id
      : (user.family_owner_id ?? user.id);
  }

  private async getPermissions(user: User) {
    return Promise.all([
      this.permissionsService.getModuleCrudPermissions(user, 'contacts'),
      this.permissionsService.getModuleCrudPermissions(user, 'passwords'),
      this.permissionsService.getModuleCrudPermissions(user, 'documents'),
    ]);
  }

  private getDisplayName(user?: User | null) {
    return user?.name || user?.email || 'Vault';
  }

  private canSeeVisibilityRecord(
    requester: User,
    record: {
      visibility?: 'private' | 'family' | 'specific';
      created_by_user_id?: string;
      shared_with_user_ids?: string[] | null;
    },
  ): boolean {
    const visibility = record.visibility ?? 'family';

    if (visibility === 'family') return true;
    if (visibility === 'private')
      return record.created_by_user_id === requester.id;

    if (visibility === 'specific')
      return (
        record.created_by_user_id === requester.id ||
        record.shared_with_user_ids?.includes(requester.id) === true
      );

    return false;
  }

  async getOverview(firebaseUid: string) {
    const requester = await this.resolveRequester(firebaseUid);
    const familyOwnerId = this.resolveFamilyOwnerId(requester);

    const [contactsPerm, passwordsPerm, documentsPerm] =
      await this.getPermissions(requester);

    const baseWhere = { family_owner_id: familyOwnerId };

    const [members, contacts, passwords, documents] = await Promise.all([
      this.userRepo.count({
        where: [
          { id: familyOwnerId, role: USER_ROLES.OWNER },
          { family_owner_id: familyOwnerId, role: USER_ROLES.MEMBER },
        ],
      }),
      contactsPerm.view ? this.contactRepo.count({ where: baseWhere }) : 0,
      passwordsPerm.view ? this.passwordRepo.count({ where: baseWhere }) : 0,
      documentsPerm.view ? this.documentRepo.count({ where: baseWhere }) : 0,
    ]);

    return { members, contacts, passwords, documents };
  }

  async getRecentActivity(firebaseUid: string, limit = 8) {
    const requester = await this.resolveRequester(firebaseUid);
    const familyOwnerId = this.resolveFamilyOwnerId(requester);

    const [contactsPerm, passwordsPerm, documentsPerm] =
      await this.getPermissions(requester);

    const take = Math.max(3, Math.ceil(limit / 3));
    const baseFind = {
      where: { family_owner_id: familyOwnerId },
      order: { created_at: 'DESC' as const },
      take,
      relations: ['created_by_user'],
    };

    const [contacts, passwords, documents, members] = await Promise.all([
      contactsPerm.view ? this.contactRepo.find(baseFind) : [],
      passwordsPerm.view ? this.passwordRepo.find(baseFind) : [],
      documentsPerm.view ? this.documentRepo.find(baseFind) : [],
      this.userRepo.find({
        where: [
          { id: familyOwnerId, role: USER_ROLES.OWNER },
          { family_owner_id: familyOwnerId, role: USER_ROLES.MEMBER },
        ],
        order: { created_at: 'DESC' },
        take,
      }),
    ]);

    const activity: RecentActivityItem[] = [
      ...passwords
        .filter((r) => this.canSeeVisibilityRecord(requester, r))
        .map((r) => ({
          id: `password-${r.id}`,
          user_name: this.getDisplayName(r.created_by_user),
          action: 'added a password for',
          target_label: r.site_name,
          module: 'passwords' as const,
          route: '/passwords',
          created_at: r.created_at,
        })),

      ...documents
        .filter((r) => this.canSeeVisibilityRecord(requester, r))
        .map((r) => ({
          id: `document-${r.id}`,
          user_name: this.getDisplayName(r.created_by_user),
          action: 'uploaded',
          target_label: r.title,
          module: 'documents' as const,
          route: '/documents',
          created_at: r.created_at,
        })),

      ...contacts.map((r) => ({
        id: `contact-${r.id}`,
        user_name: this.getDisplayName(r.created_by_user),
        action: 'added',
        target_label: r.name,
        module: 'contacts' as const,
        route: '/contacts',
        created_at: r.created_at,
      })),

      ...members.map((r) => ({
        id: `member-${r.id}`,
        user_name: 'Vault',
        action: 'added member',
        target_label: this.getDisplayName(r),
        module: 'members' as const,
        route: '/members',
        created_at: r.created_at,
      })),
    ];

    return activity
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
      .slice(0, limit);
  }
}
