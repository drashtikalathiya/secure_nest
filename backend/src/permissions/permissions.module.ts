import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionProfile } from './permission-profile.entity';
import { PermissionsService } from './permissions.service';

@Module({
  imports: [TypeOrmModule.forFeature([PermissionProfile])],
  providers: [PermissionsService],
  exports: [PermissionsService],
})
export class PermissionsModule {}
