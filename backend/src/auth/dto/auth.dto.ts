import type { AccessLevel } from '../../permissions/permission-profile.entity';
import type { SubscriptionPlan, UserRole } from '../../utils/constants';

export type AuthenticatedRequest = {
  user: FirebaseUserDto;
};

export type FirebaseUserDto = {
  uid: string;
  email?: string | null;
};

export type RegisterUserDto = {
  inviteToken?: string | null;
  name?: string | null;
  photo_url?: string | null;
};

export type AuthResponseDto = {
  id: string;
  email: string;
  name: string | null;
  profile_photo_url: string | null;
  role: UserRole;
  family_owner_id: string | null;
  is_subscribed: boolean;
  subscription_plan: SubscriptionPlan;
  permission_password_access_level: AccessLevel;
  permission_contacts_access_level: AccessLevel;
  permission_documents_access_level: AccessLevel;
  permission_invite_others: boolean;
  permission_export_data: boolean;
};
