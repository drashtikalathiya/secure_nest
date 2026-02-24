import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionsModule } from '../permissions/permissions.module';
import { User } from '../users/user.entity';
import { UsersModule } from '../users/users.module';
import { DocumentFile } from './document-file.entity';
import { DocumentFolder } from './document-folder.entity';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([DocumentFolder, DocumentFile, User]),
    PermissionsModule,
    UsersModule,
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService],
  exports: [DocumentsService],
})
export class DocumentsModule {}
