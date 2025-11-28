import { Resolver, Mutation, Query, Args, Context } from '@nestjs/graphql';
import { UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResponse } from './dto/loginResponse.dto';
import { RegisterResponse } from './dto/registerResponse.dto';
import { User } from 'src/users/entities/user.entity';
import { Session } from './entities/session.entity';
import { RegisterInput } from './dto/register.input';
import { LoginInput } from './dto/login.input';
import { VerifyOtpInput } from './dto/verifyOtpInput';
import { ResendOtpInput } from './dto/resendOtpInput';
import { AuthGuard } from './guards/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ResetPasswordInput } from './dto/reset-password.input';
import { GoogleLoginInput } from './entities/google-login.input';

@Resolver(() => User)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => User)
  async register(@Args('input') input: RegisterInput): Promise<User> {
    return this.authService.register(input);
  }

  @Mutation(() => AuthResponse)
  async login(
    @Args('input') input: LoginInput,
    @Context() context,
  ): Promise<AuthResponse> {
    const deviceName = context.req.headers['user-agent'] || 'Unknown Device';
    return this.authService.login(input, deviceName);
  }

  @Mutation(() => Boolean)
  @UseGuards(AuthGuard)
  async logout(
    @CurrentUser() user: { userId: string },
    @Args('sessionId', { nullable: true }) sessionId?: string,
  ) {
    if (sessionId) {
      return this.authService.logout(sessionId, user.userId);
    }
    return false;
  }

  @Mutation(() => Boolean)
  @UseGuards(AuthGuard)
  async logoutAllDevices(@CurrentUser() user: { userId: string }) {
    return this.authService.logoutAll(user.userId);
  }

  @Mutation(() => AuthResponse)
  async refreshToken(@Context() context) {
    const authHeader = context.req.headers.authorization;

    if (!authHeader) throw new UnauthorizedException('No Auth Header');
    const rawToken = authHeader.split(' ')[1];
    return this.authService.refreshTokens(rawToken);
  }

  @Query(() => [Session], { name: 'mySessions' })
  @UseGuards(AuthGuard)
  async mySessions(@CurrentUser() user: { userId: string }) {
    return this.authService.getSessions(user.userId);
  }

  @Mutation(() => AuthResponse, { name: 'verifyOtp' })
  async verifyOtp(@Args('input') input: VerifyOtpInput): Promise<AuthResponse> {
    return this.authService.verifyOtp(input);
  }

  @Mutation(() => RegisterResponse, { name: 'resendOtp' })
  async resendOtp(
    @Args('input') input: ResendOtpInput,
  ): Promise<RegisterResponse> {
    return this.authService.resendOtp(input);
  }

  @Mutation(() => Boolean)
  async forgotPassword(@Args('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @Mutation(() => Boolean)
  async resetPassword(@Args('input') input: ResetPasswordInput) {
    return this.authService.resetPassword(input.token, input.newPassword);
  }

  @Mutation(() => AuthResponse)
  async loginWithGoogle(
    @Args('input') input: GoogleLoginInput,
    @Context() context,
  ): Promise<AuthResponse> {
    const deviceName = context.req.headers['user-agent'] || 'Unknown Device';
    console.log(deviceName);
    return this.authService.loginWithGoogle(input, deviceName);
  }
}
