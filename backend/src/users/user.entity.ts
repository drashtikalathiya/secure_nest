import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  firebase_uid: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  profile_photo_url: string;

  @Column({ default: 'owner' })
  role: 'owner' | 'member';

  @Column({ default: false })
  is_subscribed: boolean;

  @Column({ nullable: true })
  subscribed_id: string;

  @Column({ nullable: true })
  family_owner_id: string;

  @Column({ default: true })
  permission_view: boolean;

  @Column({ default: false })
  permission_edit: boolean;

  @Column({ default: false })
  permission_delete: boolean;

  @CreateDateColumn()
  created_at: Date;
}
