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
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Contact) private contactRepo: Repository<Contact>,
    @InjectRepository(PasswordRecord)
    private passwordRepo: Repository<PasswordRecord>,
    @InjectRepository(DocumentFile)
    private documentRepo: Repository<DocumentFile>,
    private permissionsService: PermissionsService,
  ) {}

  private async getContext(firebaseUid: string) {
    const user = await this.userRepo.findOne({
      where: { firebase_uid: firebaseUid },
    });
    if (!user) throw new NotFoundException('User account was not found.');

    const familyOwnerId =
      user.role === USER_ROLES.OWNER
        ? user.id
        : (user.family_owner_id ?? user.id);

    const perms = await Promise.all([
      this.permissionsService.getModuleCrudPermissions(user, 'contacts'),
      this.permissionsService.getModuleCrudPermissions(user, 'passwords'),
      this.permissionsService.getModuleCrudPermissions(user, 'documents'),
    ]);

    return { user, familyOwnerId, perms };
  }

  private displayName = (user?: User | null) =>
    user?.name || user?.email || 'Vault';

  private canSeeVisibilityRecord = (
    requester: User,
    record?: {
      visibility?: 'private' | 'family' | 'specific';
      created_by_user_id?: string;
      shared_with_user_ids?: string[] | null;
    },
  ) => {
    const visibility = record?.visibility ?? 'family';

    if (visibility === 'family') return true;
    if (visibility === 'private')
      return record?.created_by_user_id === requester.id;
    if (visibility === 'specific')
      return (
        record?.created_by_user_id === requester.id ||
        record?.shared_with_user_ids?.includes(requester.id)
      );

    return false;
  };

  private canSeeDocument = (user: User, doc: DocumentFile) =>
    this.canSeeVisibilityRecord(user, doc) &&
    this.canSeeVisibilityRecord(user, doc.folder);

  async getOverview(firebaseUid: string) {
    const { user, familyOwnerId, perms } = await this.getContext(firebaseUid);

    const [contactsPerm, passwordsPerm, documentsPerm] = perms;
    const baseWhere = { family_owner_id: familyOwnerId };

    const [members, contacts, passwords, documents] = await Promise.all([
      this.userRepo.count({
        where: [
          { id: familyOwnerId, role: USER_ROLES.OWNER },
          { family_owner_id: familyOwnerId, role: USER_ROLES.MEMBER },
        ],
      }),

      contactsPerm.view ? this.contactRepo.count({ where: baseWhere }) : 0,

      passwordsPerm.view
        ? this.passwordRepo.find({
            where: baseWhere,
            select: [
              'id',
              'visibility',
              'created_by_user_id',
              'shared_with_user_ids',
            ],
          })
        : [],

      documentsPerm.view
        ? this.documentRepo.find({
            where: baseWhere,
            select: [
              'id',
              'visibility',
              'created_by_user_id',
              'shared_with_user_ids',
            ],
            relations: ['folder'],
          })
        : [],
    ]);

    return {
      members,
      contacts,
      passwords: Array.isArray(passwords)
        ? passwords.filter((p) => this.canSeeVisibilityRecord(user, p)).length
        : passwords,
      documents: Array.isArray(documents)
        ? documents.filter((d) => this.canSeeDocument(user, d)).length
        : documents,
    };
  }

  async getRecentActivity(firebaseUid: string, limit = 8) {
    const { user, familyOwnerId, perms } = await this.getContext(firebaseUid);

    const [contactsPerm, passwordsPerm, documentsPerm] = perms;
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

    const build = (
      list,
      module: RecentActivityItem['module'],
      action: string,
      route: string,
      labelKey: string,
    ) =>
      list.map((r) => ({
        id: `${module}-${r.id}`,
        user_name: this.displayName(r.created_by_user),
        action,
        target_label: r[labelKey],
        module,
        route,
        created_at: r.created_at,
      }));

    const activity: RecentActivityItem[] = [
      ...build(
        passwords.filter((p) => this.canSeeVisibilityRecord(user, p)),
        'passwords',
        'added a password for',
        '/passwords',
        'site_name',
      ),
      ...build(
        documents.filter((d) => this.canSeeVisibilityRecord(user, d)),
        'documents',
        'uploaded',
        '/documents',
        'title',
      ),
      ...build(
        contacts,
        'contacts',
        'added a contact for',
        '/contacts',
        'name',
      ),
      ...members.map((m) => ({
        id: `member-${m.id}`,
        user_name: 'Vault',
        action: 'added member',
        target_label: this.displayName(m),
        module: 'members',
        route: '/members',
        created_at: m.created_at,
      })),
    ];

    return activity
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
      .slice(0, limit);
  }
}
