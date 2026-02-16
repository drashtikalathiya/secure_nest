import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { PasswordRecord } from './password.entity';
import { PasswordsController } from './passwords.controller';
import { PasswordsService } from './passwords.service';

@Module({
  imports: [TypeOrmModule.forFeature([PasswordRecord, User])],
  controllers: [PasswordsController],
  providers: [PasswordsService],
})
export class PasswordsModule {}
