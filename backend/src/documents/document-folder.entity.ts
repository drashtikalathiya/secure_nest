import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { DocumentFile } from './document-file.entity';

@Entity('document_folders')
export class DocumentFolder {
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
  name: string;

  @Column({ default: 'family' })
  visibility: 'private' | 'family' | 'specific';

  @Column('simple-array', { nullable: true })
  shared_with_user_ids: string[];

  @OneToMany(() => DocumentFile, (file) => file.folder)
  files?: DocumentFile[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
