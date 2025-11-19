import { Resolver, Query, Mutation, Args, Field } from '@nestjs/graphql';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthService } from './auth.service';
import { AuthResponse } from './dto/loginResponse.dto';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from './guards/auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Role } from './role.enum';
import { Roles } from './decorators/roles.decorator';
import { ObjectType } from '@nestjs/graphql';
import { RegisterResponse } from './dto/registerResponse.dto';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { VerifyOtpInput } from './dto/verifyOtpInput';
import { ResendOtpInput } from './dto/resendOtpInput';
import { User } from 'src/users/entities/user.entity';
import { RegisterInput } from './dto/register.input';
import { LoginInput } from './dto/login.input';

@ObjectType()
class Me {
  @Field()
  userId: string;

  @Field()
  role: string;
}

interface IUser {
  userId: string;
  role: string;
}

@Resolver(() => User)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Query(() => String, { name: 'hello' })
  async hello() {
    return 'hello';
  }

  @Mutation(() => User)
  async register(@Args('input') input: RegisterInput): Promise<User> {
    return this.authService.register(input);
  }

  @Mutation(() => AuthResponse)
  async login(@Args('input') input: LoginInput): Promise<AuthResponse> {
    return this.authService.login(input);
  }

  @Mutation(() => AuthResponse)
  @UseGuards(RefreshTokenGuard)
  async refreshToken(@CurrentUser() user: IUser): Promise<AuthResponse> {
    return this.authService.refreshToken(user.userId);
  }

  @Mutation(() => AuthResponse, { name: 'verifyOtp' })
  async verifyOtp(
    @Args('input') input: VerifyOtpInput,
  ): Promise<AuthResponse> {
    return this.authService.verifyOtp(input);
  }

  @Mutation(() => RegisterResponse, { name: 'resendOtp' })
  async resendOtp(
    @Args('input') input: ResendOtpInput,
  ): Promise<RegisterResponse> {
    return this.authService.resendOtp(input);
  }

  // @UseGuards(AuthGuard)
  // @Query(() => Me, { name: 'me' })
  // async me(@CurrentUser() user: IUser) {
  //   return this.authService.findOne(user.userId);
  // }

  // @UseGuards(AuthGuard,RolesGuard)
  // @Roles(Role.ADMIN)
  // @Query(() => User, { name: 'user' })
  // async findUser(@Args('id') id: string): Promise<User> {
  //   return this.authService.findOne(id);
  // }
}
