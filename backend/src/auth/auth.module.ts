import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { InvitationsModule } from '../invitations/invitations.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), InvitationsModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
