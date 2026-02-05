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

  @Column({ default: 'member' })
  role: 'owner' | 'member';

  @Column({ default: false })
  is_subscribed: boolean;

  @CreateDateColumn()
  created_at: Date;
}
