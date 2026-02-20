import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invitation } from '../invitations/invitation.entity';
import { User } from './user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { CloudinaryService } from './cloudinary.service';
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Invitation]), PermissionsModule],
  providers: [UsersService, CloudinaryService],
  controllers: [UsersController],
  exports: [CloudinaryService],
})
export class UsersModule {}
