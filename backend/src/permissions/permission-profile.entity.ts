import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type AccessLevel = 'none' | 'view' | 'edit';

@Entity('permission_profiles')
export class PermissionProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  owner_id: string;

  @Column({ default: 'view' })
  password_access_level: AccessLevel;

  @Column({ default: 'view' })
  contacts_access_level: AccessLevel;

  @Column({ default: 'view' })
  documents_access_level: AccessLevel;

  @Column({ default: false })
  invite_others: boolean;

  @Column({ default: true })
  export_data: boolean;

  @CreateDateColumn()
  created_at: Date;
}
