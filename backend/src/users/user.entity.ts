import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import {
  SUBSCRIPTION_PLANS,
  USER_ROLES,
  type SubscriptionPlan,
  type UserRole,
} from '../utils/constants';

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

  @Column({ default: USER_ROLES.OWNER })
  role: UserRole;

  @Column({ default: false })
  is_subscribed: boolean;

  @Column({ default: SUBSCRIPTION_PLANS.SMALL })
  subscription_plan: SubscriptionPlan;

  @Column({ nullable: true })
  subscribed_id: string;

  @Column({ nullable: true })
  family_owner_id: string;

  @Column({ nullable: true })
  permission_profile_id: string;

  @CreateDateColumn()
  created_at: Date;
}
