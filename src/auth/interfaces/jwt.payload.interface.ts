import { UserRole } from '../../shared/enums/user-roles.enum';

export interface TokenPayload {
  id: number;
  role: UserRole;
}
