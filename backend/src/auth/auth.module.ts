import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { DocumentsModule } from '../documents/documents.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { InvitationsModule } from '../invitations/invitations.module';
import { UsersModule } from '../users/users.module';
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    InvitationsModule,
    UsersModule,
    PermissionsModule,
    DocumentsModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
