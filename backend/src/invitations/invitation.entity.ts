import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('invitations')
export class Invitation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  owner_id: string;

  @Column()
  email: string;

  @Column({ default: 'member' })
  role: 'member';

  @Column({ nullable: true })
  permission_profile_id: string;

  @Column({ unique: true })
  token: string;

  @Column({ default: 'pending' })
  status: 'pending' | 'accepted' | 'cancelled' | 'expired';

  @Column({ type: 'timestamp' })
  expires_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  accepted_at: Date;

  @Column({ nullable: true })
  accepted_by_user_id: string;

  @CreateDateColumn()
  created_at: Date;
}
