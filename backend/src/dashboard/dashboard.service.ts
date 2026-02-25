import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PermissionsService } from '../permissions/permissions.service';
import { USER_ROLES } from '../utils/constants';
import { User } from '../users/user.entity';
import { Contact } from '../contacts/contact.entity';
import { PasswordRecord } from '../passwords/password.entity';
import { DocumentFile } from '../documents/document-file.entity';

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

  async getOverview(firebaseUid: string) {
    const requester = await this.userRepo.findOne({
      where: { firebase_uid: firebaseUid },
    });

    if (!requester) {
      throw new NotFoundException('User account was not found.');
    }

    // Resolve family owner in one line
    const familyOwnerId =
      requester.role === USER_ROLES.OWNER
        ? requester.id
        : (requester.family_owner_id ?? requester.id);

    // Fetch permissions in parallel
    const [contactsPerm, passwordsPerm, documentsPerm] = await Promise.all([
      this.permissionsService.getModuleCrudPermissions(requester, 'contacts'),
      this.permissionsService.getModuleCrudPermissions(requester, 'passwords'),
      this.permissionsService.getModuleCrudPermissions(requester, 'documents'),
    ]);

    // Fetch counts in parallel
    const [members, contacts, passwords, documents] = await Promise.all([
      this.userRepo.count({
        where: [
          { id: familyOwnerId, role: USER_ROLES.OWNER },
          { family_owner_id: familyOwnerId, role: USER_ROLES.MEMBER },
        ],
      }),
      contactsPerm.view
        ? this.contactRepo.count({ where: { family_owner_id: familyOwnerId } })
        : 0,
      passwordsPerm.view
        ? this.passwordRepo.count({ where: { family_owner_id: familyOwnerId } })
        : 0,
      documentsPerm.view
        ? this.documentRepo.count({ where: { family_owner_id: familyOwnerId } })
        : 0,
    ]);

    return { members, contacts, passwords, documents };
  }
}
