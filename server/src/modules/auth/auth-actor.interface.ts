import { UserRole } from 'src/modules/admins/entities/admin.entity';

export interface AuthActor {
  userId: string;
  role: UserRole;
  email?: string;
}
