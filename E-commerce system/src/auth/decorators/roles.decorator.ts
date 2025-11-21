import { SetMetadata } from '@nestjs/common';
<<<<<<< HEAD
import { Role } from 'src/auth/enums/role.enum';
=======
import { Role } from 'src/auth/role.enum';
>>>>>>> main

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);