import { registerEnumType } from '@nestjs/graphql';

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  VENDOR = 'VENDOR',
  CLIENT = 'CLIENT',
}

registerEnumType(UserRole, { name: 'UserRole' });