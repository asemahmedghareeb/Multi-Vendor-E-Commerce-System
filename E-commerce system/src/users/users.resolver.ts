import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { Role } from 'src/auth/role.enum';
import { UseGuards } from '@nestjs/common';
import { Vendor, VendorStatus } from './entities/vendor.entity';

import { RolesGuard } from 'src/auth/guards/roles.guard';

import { Roles } from 'src/auth/decorators/roles.decorator';
import { AuthGuard } from 'src/auth/guards/auth.guard';
@Resolver()
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Mutation(() => Vendor)
  @Roles(Role.SUPER_ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  async approveVendor(@Args('userId') userId: string) {
    return this.usersService.updateVendorStatus(userId, VendorStatus.VERIFIED);
  }
}
