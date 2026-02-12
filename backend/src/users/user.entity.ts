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

  @Column({ default: 'owner' })
  role: 'owner' | 'member';

  @Column({ default: false })
  is_subscribed: boolean;

  @Column({ nullable: true })
  subscribed_id: string;

  @Column({ nullable: true })
  family_owner_id: string;

  @CreateDateColumn()
  created_at: Date;
}
