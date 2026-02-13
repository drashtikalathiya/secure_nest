import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Contact } from './contact.entity';
import { ContactsController } from './contacts.controller';
import { ContactsService } from './contacts.service';

@Module({
  imports: [TypeOrmModule.forFeature([Contact, User])],
  controllers: [ContactsController],
  providers: [ContactsService],
})
export class ContactsModule {}
