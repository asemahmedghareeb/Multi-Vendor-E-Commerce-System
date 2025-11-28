import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import axios from 'axios';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, MoreThan } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity';
import { Vendor, VendorStatus } from 'src/vendors/entities/vendor.entity';
import { Session } from './entities/session.entity';
import { RegisterInput } from './dto/register.input';
import { LoginInput } from './dto/login.input';
import { VerifyOtpInput } from './dto/verifyOtpInput';
import { ResendOtpInput } from './dto/resendOtpInput';
import { AuthResponse } from './dto/loginResponse.dto';
import { RegisterResponse } from './dto/registerResponse.dto';
import { UserRole } from 'src/common/enums/roles.enum';
import { EmailsService } from 'src/emails/emails.service';
import { GoogleLoginInput } from './entities/google-login.input';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Vendor)
    private vendorRepo: Repository<Vendor>,
    @InjectRepository(Session)
    private sessionRepo: Repository<Session>,
    private jwtService: JwtService,
    private emailService: EmailsService,
  ) {}

  async register(input: RegisterInput): Promise<User> {
    const existing = await this.userRepo.findOne({
      where: { email: input.email },
    });
    if (existing) throw new BadRequestException('events.auth.EMAIL_EXISTS');

    const hashedPassword = await bcrypt.hash(input.password, 10);

    const user = this.userRepo.create({
      email: input.email,
      password: hashedPassword,
      role: input.role,
    });
    const savedUser = await this.userRepo.save(user);

    const { otp, expires } = this.generateOtp();
    savedUser.otp = otp;
    savedUser.otpExpires = expires;
    await this.userRepo.save(savedUser);

    await this.emailService.sendEmail(input.email, 'Verify OTP', otp);

    if (input.role === UserRole.VENDOR) {
      if (!input.businessName)
        throw new BadRequestException('events.auth.MUST_SUPPLY_BUSINESS_NAME');

      const vendor = this.vendorRepo.create({
        businessName: input.businessName,
        bio: input.bio,
        status: VendorStatus.PENDING,
        user: savedUser,
      });

      await this.vendorRepo.save(vendor);
    }

    return savedUser;
  }

  async login(input: LoginInput, deviceName: string = 'Unknown Device') {
    const user = await this.userRepo.findOne({ where: { email: input.email } });
    if (!user || !(await bcrypt.compare(input.password, user.password))) {
      throw new UnauthorizedException('events.auth.INVALID_CREDENTIALS');
    }

    if (!user.isVerified) {
      throw new UnauthorizedException('events.auth.ACCOUNT_NOT_VERIFIED');
    }

    if (user.role === UserRole.VENDOR) {
      const vendor = await this.vendorRepo.findOne({
        where: { user: { id: user.id } },
      });
      if (!vendor) {
        throw new UnauthorizedException('events.vendor.NOT_FOUND');
      }
      if (vendor.status === VendorStatus.PENDING) {
        throw new ForbiddenException('events.auth.ACCOUNT_PENDING');
      }
    }

    const refreshToken = this.generateRefreshToken();
    const refreshHash = this.hashToken(refreshToken);
    const session = this.sessionRepo.create({
      user,
      deviceName,
      refreshTokenHash: refreshHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    await this.sessionRepo.save(session);

    const accessToken = this.generateAccessToken(user);

    return {
      accessToken,
      refreshToken,
      user,
      sessionId: session.id,
    };
  }

  async logout(sessionId: string, userId: string): Promise<boolean> {
    const result = await this.sessionRepo.delete({
      id: sessionId,
      userId: userId,
    });

    return result.affected ? result.affected > 0 : false;
  }

  async logoutAll(userId: string): Promise<boolean> {
    await this.sessionRepo.delete({ userId: userId });

    return true;
  }

  async refreshTokens(rawRefreshToken: string): Promise<AuthResponse> {
    const hash = this.hashToken(rawRefreshToken);

    const session = await this.sessionRepo.findOne({
      where: {
        refreshTokenHash: hash,
        expiresAt: MoreThan(new Date()),
      },
      relations: ['user'],
    });

    if (!session) {
      throw new UnauthorizedException('Invalid or Expired Refresh Token');
    }

    const newRefreshToken = this.generateRefreshToken();
    const newHash = this.hashToken(newRefreshToken);

    session.refreshTokenHash = newHash;
    session.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await this.sessionRepo.save(session);

    const accessToken = this.generateAccessToken(session.user);

    return { accessToken, refreshToken: newRefreshToken };
  }

  async forgotPassword(email: string): Promise<boolean> {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) return true;

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hash = this.hashToken(resetToken);

    user.passwordResetToken = hash;
    user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);
    await this.userRepo.save(user);

    await this.emailService.sendEmail(
      user.email,
      'Resetting password',
      resetToken,
    );

    return true;
  }

  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    const hash = this.hashToken(token);

    const user = await this.userRepo.findOne({
      where: {
        passwordResetToken: hash,
        passwordResetExpires: MoreThan(new Date()),
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or Expired Token');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await this.userRepo.save(user);

    await this.logoutAll(user.id);

    return true;
  }

  async verifyOtp({
    email,
    otp,
  }: VerifyOtpInput): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.userRepo.findOne({ where: { email } });

    if (!user) throw new BadRequestException('events.auth.USER_NOT_FOUND');
    if (user.isVerified)
      throw new BadRequestException('events.auth.ACCOUNT_ALREADY_VERIFIED');
    if (user.otp !== otp)
      throw new BadRequestException('events.auth.INVALID_OTP');
    if (new Date() > user.otpExpires!)
      throw new BadRequestException('events.auth.EXPIRED_OTP');

    user.isVerified = true;
    await this.userRepo.save(user);

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken();
    const session = this.sessionRepo.create({
      user,
      deviceName: 'Verified Device',
      refreshTokenHash: this.hashToken(refreshToken),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    await this.sessionRepo.save(session);

    return { accessToken, refreshToken };
  }

  async resendOtp({ email }: ResendOtpInput): Promise<RegisterResponse> {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) throw new NotFoundException('events.auth.NOT_FOUND');
    if (user.isVerified)
      throw new BadRequestException('events.auth.ACCOUNT_ALREADY_VERIFIED');

    const { otp, expires } = this.generateOtp();
    user.otp = otp;
    user.otpExpires = expires;
    await this.userRepo.save(user);
    await this.emailService.sendEmail(user.email, 'Verify OTP', otp);

    return { msg: 'A new OTP has been sent to your email.' };
  }

  private generateAccessToken(user: User, sessionId?: string): string {
    const payload = {
      userId: user.id,
      role: user.role,
      // sessionId: sessionId,
    };
    return this.jwtService.sign(payload);
  }

  private generateRefreshToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private generateOtp(): { otp: string; expires: Date } {
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000);
    return { otp, expires };
  }

  async getSessions(userId: string): Promise<Session[]> {
    return this.sessionRepo.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async findByIds(userIds: string[]): Promise<User[]> {
    return this.userRepo.find({
      where: { id: In(userIds) },
    });
  }

  async loginWithGoogle(
    input: GoogleLoginInput,
    deviceName: string = 'Unknown Device',
  ) {
    const googleUser = await this.getGoogleUserInfo(input.token);

    let user = await this.userRepo.findOne({
      where: { email: googleUser.email },
    });

    if (!user) {
      user = this.userRepo.create({
        email: googleUser.email,
        isVerified: true,
        role: UserRole.CLIENT,
        password: await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10),
      });
      await this.userRepo.save(user);
    }

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken();
    const refreshHash = this.hashToken(refreshToken);

    const session = this.sessionRepo.create({
      user,
      deviceName: `Google Login - ${deviceName}`,
      refreshTokenHash: refreshHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    await this.sessionRepo.save(session);

    return {
      accessToken,
      refreshToken,
      sessionId: session.id,
      user,
    };
  }

  private async getGoogleUserInfo(accessToken: string) {
    try {
      const { data } = await axios.get(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );
      return data;
    } catch (error) {
      throw new UnauthorizedException('Invalid Google Token');
    }
  }
}
