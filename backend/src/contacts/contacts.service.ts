import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { Contact } from './contact.entity';
import { PermissionsService } from '../permissions/permissions.service';
import { USER_ROLES } from '../utils/constants';
import type {
  ContactListResponseDto,
  ContactPayloadDto,
  ContactPermissionsDto,
} from './dto/contacts.dto';

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(Contact)
    private contactRepo: Repository<Contact>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private permissionsService: PermissionsService,
  ) {}

  async getContacts(firebaseUid: string): Promise<ContactListResponseDto> {
    const requester = await this.getRequester(firebaseUid);
    const permissions = await this.permissionsService.getModuleCrudPermissions(
      requester,
      'contacts',
    );
    this.ensureCanViewContacts(permissions);
    const familyOwnerId = this.getFamilyOwnerId(requester);

    const contacts = await this.contactRepo.find({
      where: { family_owner_id: familyOwnerId },
      order: { created_at: 'DESC' },
    });

    return {
      items: contacts,
      permissions,
    };
  }

  async createContact(
    firebaseUid: string,
    body: ContactPayloadDto,
  ): Promise<Contact> {
    const requester = await this.getRequester(firebaseUid);
    const permissions = await this.permissionsService.getModuleCrudPermissions(
      requester,
      'contacts',
    );
    this.ensureCanEditContacts(permissions);
    const familyOwnerId = this.getFamilyOwnerId(requester);

    this.validateContactPayload(body);

    const contact = this.contactRepo.create({
      family_owner_id: familyOwnerId,
      created_by_user_id: requester.id,
      name: this.clean(body?.name),
      relationship: this.clean(body?.relationship),
      phone: this.clean(body?.phone),
      email: this.clean(body?.email),
      address: this.clean(body?.address),
      notes: this.clean(body?.notes),
      category: this.clean(body?.category),
      website: this.clean(body?.website),
    });

    return this.contactRepo.save(contact);
  }

  async updateContact(
    firebaseUid: string,
    contactId: string,
    body: ContactPayloadDto,
  ): Promise<Contact> {
    const requester = await this.getRequester(firebaseUid);
    const permissions = await this.permissionsService.getModuleCrudPermissions(
      requester,
      'contacts',
    );
    this.ensureCanEditContacts(permissions);

    const familyOwnerId = this.getFamilyOwnerId(requester);

    const existing = await this.contactRepo.findOne({
      where: { id: contactId, family_owner_id: familyOwnerId },
    });

    if (!existing) {
      throw new NotFoundException('Contact not found in your family.');
    }

    if (
      requester.role !== USER_ROLES.OWNER &&
      existing.created_by_user_id !== requester.id
    ) {
      throw new ForbiddenException('Only creator can edit this contact.');
    }

    this.validateContactPayload(body);

    const nextPayload: Partial<Contact> = {
      name: this.clean(body?.name),
      relationship: this.clean(body?.relationship),
      phone: this.clean(body?.phone),
      email: this.clean(body?.email),
      address: this.clean(body?.address),
      notes: this.clean(body?.notes),
      category: this.clean(body?.category),
      website: this.clean(body?.website),
    };

    const updated = await this.contactRepo.save({
      ...existing,
      ...nextPayload,
    });

    if (!updated) {
      throw new NotFoundException('Contact was not found.');
    }

    return updated;
  }

  async deleteContact(firebaseUid: string, contactId: string): Promise<void> {
    const requester = await this.getRequester(firebaseUid);
    const permissions = await this.permissionsService.getModuleCrudPermissions(
      requester,
      'contacts',
    );
    this.ensureCanEditContacts(permissions);

    const familyOwnerId = this.getFamilyOwnerId(requester);

    const existing = await this.contactRepo.findOne({
      where: { id: contactId },
    });
    if (!existing) {
      throw new NotFoundException('Contact was not found.');
    }

    if (existing.family_owner_id !== familyOwnerId) {
      throw new ForbiddenException(
        'You can delete only contacts in your family.',
      );
    }

    if (
      requester.role !== USER_ROLES.OWNER &&
      existing.created_by_user_id !== requester.id
    ) {
      throw new ForbiddenException('Only creator can delete this contact.');
    }

    await this.contactRepo.delete({ id: contactId });
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

  private ensureCanViewContacts(permissions: ContactPermissionsDto): void {
    if (!permissions.view) {
      throw new ForbiddenException(
        'You do not have permission to view contacts.',
      );
    }
  }

  private ensureCanEditContacts(permissions: ContactPermissionsDto): void {
    if (!permissions.edit) {
      throw new ForbiddenException(
        'You do not have permission to edit contacts.',
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

  private validateContactPayload(body: ContactPayloadDto): void {
    if (!this.clean(body?.name)) {
      throw new BadRequestException('Contact name is required.');
    }

    if (!this.clean(body?.relationship)) {
      throw new BadRequestException('Relationship is required.');
    }

    if (!this.clean(body?.phone)) {
      throw new BadRequestException('Phone number is required.');
    }
  }

  private clean(value: unknown): string | null {
    if (typeof value !== 'string') return null;

    const trimmed = value.trim();
    return trimmed || null;
  }
}
