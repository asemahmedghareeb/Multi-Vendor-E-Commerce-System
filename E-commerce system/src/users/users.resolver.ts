import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { PaginationInput } from '../common/dto/pagination.input';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Vendor } from 'src/vendors/entities/vendor.entity';
import { genericPaginated } from 'src/common/dto/paginated-output';
import { UpdateUserInput } from './dto/updated-user.dto';
import { Role } from 'src/auth/guards/role.enum';
import { RegisterDeviceInput } from './dto/register-device.input';

const paginatedCategory = genericPaginated(User);
@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => paginatedCategory, { name: 'users' })
  @Roles(Role.SUPER_ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  async findAll(
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ) {
    return this.usersService.findAll(pagination || { page: 1, limit: 10 });
  }

  @Query(() => User, { name: 'user' })
  @Roles(Role.SUPER_ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  async findOne(@Args('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Query(() => User, { name: 'me' })
  @UseGuards(AuthGuard)
  async me(@CurrentUser() user: User) {
    return this.usersService.findOne(user.id);
  }

  @Mutation(() => User)
  @UseGuards(AuthGuard)
  async updateUser(
    @Args('updateUserInput') input: UpdateUserInput,
    @CurrentUser() currentUser: User,
  ) {
    return this.usersService.update(currentUser.id, input);
  }

  @Mutation(() => Boolean)
  @Roles(Role.SUPER_ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  async removeUser(@Args('id') id: string) {
    return this.usersService.remove(id);
  }

  @Mutation(() => Boolean)
  @UseGuards(AuthGuard)
  async registerDevice(
    @Args('input') input: RegisterDeviceInput,
    @CurrentUser() user: { userId: string },
  ) {
    return this.usersService.registerDevice(user.userId, input);
  }

  @Mutation(() => Boolean)
  @UseGuards(AuthGuard)
  async unregisterDevice(@Args('token') token: string) {
    return this.usersService.removeDevice(token);
  }

  @ResolveField(() => Vendor, { nullable: true })
  async vendorProfile(@Parent() user: User) {
    if (user.vendorProfile) return user.vendorProfile;
    return null;
  }
}
