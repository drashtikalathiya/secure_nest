import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { DocumentFolder } from './document-folder.entity';

@Entity('documents')
export class DocumentFile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  family_owner_id: string;

  @Column()
  created_by_user_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'created_by_user_id' })
  created_by_user?: User;

  @Column()
  folder_id: string;

  @ManyToOne(() => DocumentFolder, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'folder_id' })
  folder?: DocumentFolder;

  @Column()
  title: string;

  @Column({ nullable: true })
  file_name: string;

  @Column({ nullable: true })
  category: string;

  @Column({ nullable: true })
  file_type: string;

  @Column({ nullable: true })
  file_url: string;

  @Column({ nullable: true })
  file_public_id: string;

  @Column({ nullable: true })
  file_resource_type: string;

  @Column({ nullable: true })
  file_mime_type: string;

  @Column({ type: 'float', default: 0 })
  size_mb: number;

  @Column({ default: 'family' })
  visibility: 'private' | 'family' | 'specific';

  @Column('simple-array', { nullable: true })
  shared_with_user_ids: string[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
