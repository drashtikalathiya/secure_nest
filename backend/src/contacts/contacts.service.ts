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

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(Contact)
    private contactRepo: Repository<Contact>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async getContacts(firebaseUid: string) {
    const requester = await this.getRequester(firebaseUid);
    const familyOwnerId = this.getFamilyOwnerId(requester);

    const contacts = await this.contactRepo.find({
      where: { family_owner_id: familyOwnerId },
      order: { created_at: 'DESC' },
    });

    return {
      items: contacts,
      permissions: this.getPermissions(requester),
    };
  }

  async createContact(firebaseUid: string, body: any): Promise<Contact> {
    const requester = await this.getRequester(firebaseUid);
    const familyOwnerId = this.getFamilyOwnerId(requester);

    if (!this.getPermissions(requester).edit) {
      throw new ForbiddenException(
        'You do not have permission to create contacts.',
      );
    }

    const type = body?.type === 'service' ? 'service' : 'primary';
    this.validateContactPayload(type, body);

    const contact = this.contactRepo.create({
      family_owner_id: familyOwnerId,
      type,
      name: this.clean(body?.name),
      relationship: type === 'primary' ? this.clean(body?.relationship) : null,
      phone: this.clean(body?.phone),
      email: this.clean(body?.email),
      address: this.clean(body?.address),
      notes: this.clean(body?.notes),
      category: type === 'service' ? this.clean(body?.category) : null,
      website: type === 'service' ? this.clean(body?.website) : null,
    });

    return this.contactRepo.save(contact);
  }

  async updateContact(
    firebaseUid: string,
    contactId: string,
    body: any,
  ): Promise<Contact> {
    const requester = await this.getRequester(firebaseUid);

    if (!this.getPermissions(requester).edit) {
      throw new ForbiddenException(
        'You do not have permission to edit contacts.',
      );
    }

    const familyOwnerId = this.getFamilyOwnerId(requester);

    const existing = await this.contactRepo.findOne({
      where: { id: contactId, family_owner_id: familyOwnerId },
    });

    if (!existing) {
      throw new NotFoundException('Contact not found in your family.');
    }

    const type = body.type ?? existing.type;
    this.validateContactPayload(type, body);

    const nextPayload: Partial<Contact> = {
      type,
      name: this.clean(body?.name),
      relationship: type === 'primary' ? this.clean(body?.relationship) : null,
      phone: this.clean(body?.phone),
      email: this.clean(body?.email),
      address: this.clean(body?.address),
      notes: this.clean(body?.notes),
      category: type === 'service' ? this.clean(body?.category) : null,
      website: type === 'service' ? this.clean(body?.website) : null,
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

    if (!this.getPermissions(requester).delete) {
      throw new ForbiddenException(
        'You do not have permission to delete contacts.',
      );
    }

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

  private getFamilyOwnerId(user: User): string {
    if (user.role === 'owner') return user.id;

    if (!user.family_owner_id) {
      throw new ForbiddenException(
        'Family owner was not found for this account.',
      );
    }

    return user.family_owner_id;
  }

  private getPermissions(user: User) {
    if (user.role === 'owner') {
      return { view: true, edit: true, delete: true };
    }

    return {
      view: Boolean(user.permission_view),
      edit: Boolean(user.permission_edit),
      delete: Boolean(user.permission_delete),
    };
  }

  private validateContactPayload(type: 'primary' | 'service', body: any): void {
    if (!this.clean(body?.name)) {
      throw new BadRequestException('Contact name is required.');
    }

    if (type === 'primary') {
      if (!this.clean(body?.relationship)) {
        throw new BadRequestException('Relationship is required.');
      }

      if (!this.clean(body?.phone)) {
        throw new BadRequestException('Phone number is required.');
      }

      return;
    }

    if (!this.clean(body?.phone)) {
      throw new BadRequestException('Phone number is required.');
    }
  }

  private clean(value: any): string | null {
    if (typeof value !== 'string') return null;

    const trimmed = value.trim();
    return trimmed || null;
  }
}
