import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../shared/enums/user-roles.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
