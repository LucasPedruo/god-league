import { AppRole } from './app-role.model';

export interface UserAccess {
  role: AppRole;
  active: boolean;
  teamId: string | null;
  displayName: string | null;
  photoUrl: string | null;
}
