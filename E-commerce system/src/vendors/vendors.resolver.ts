import { Args, Mutation, Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { UsersService } from './vendors.service';
import { Role } from 'src/auth/enums/role.enum';
import { UseGuards } from '@nestjs/common';
import { Vendor, VendorStatus } from './entities/vendor.entity';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { UserLoader } from 'src/dataLoaders/user.loader';
import { User } from 'src/users/entities/user.entity';
@Resolver(()=>Vendor)
export class UsersResolver {
  constructor(private readonly usersService: UsersService, private readonly userLoader: UserLoader) {}

  @Mutation(() => Vendor)
  @Roles(Role.SUPER_ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  async approveVendor(@Args('userId') userId: string) {
    return this.usersService.updateVendorStatus(userId, VendorStatus.VERIFIED);
  }

  @ResolveField(() => User)
  async user(@Parent() vendor: Vendor) {
    if (vendor.user) return vendor.user;
    return this.userLoader.batchUsers.load(vendor.userId);
  }
}
