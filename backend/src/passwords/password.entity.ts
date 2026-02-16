import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('passwords')
export class PasswordRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  family_owner_id: string;

  @Column()
  created_by_user_id: string;

  @Column()
  site_name: string;

  @Column({ nullable: true })
  website_url: string;

  @Column({ nullable: true })
  category: string;

  @Column({ nullable: true })
  username_or_email: string;

  @Column({ type: 'text' })
  password_value: string;

  @Column({ default: 'family' })
  visibility: 'private' | 'family' | 'specific';

  @Column('simple-array', { nullable: true })
  shared_with_user_ids: string[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
