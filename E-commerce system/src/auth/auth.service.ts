import { Role } from 'src/auth/enums/role.enum';
import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { AuthResponse } from './dto/loginResponse.dto';
import { RegisterResponse } from './dto/registerResponse.dto';
import { VerifyOtpInput } from './dto/verifyOtpInput';
import { EmailsService } from 'src/emails/emails.service';
import { ResendOtpInput } from './dto/resendOtpInput';
import { OAuth2Client } from 'google-auth-library';
import { RegisterInput } from './dto/register.input';
import { Vendor, VendorStatus } from 'src/vendors/entities/vendor.entity';
import { UserRole } from 'src/common/enums/roles.enum';
import { LoginInput } from './dto/login.input';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Vendor)
    private vendorRepo: Repository<Vendor>,
    private jwtService: JwtService,
    private emailService: EmailsService,
    private i18n: I18nService,
  ) {
    this.googleClient = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
    );
  }

  async register(input: RegisterInput): Promise<User> {
    const existing = await this.userRepo.findOne({
      where: { email: input.email },
    });
    if (existing)
      throw new BadRequestException(this.i18n.t('events.auth.EMAIL_EXISTS'));

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
        throw new BadRequestException(
          this.i18n.t('events.auth.MUST_SUPPLY_BUSINESS_NAME'),
        );

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

  async login(input: LoginInput) {
    const user = await this.userRepo.findOne({ where: { email: input.email } });
    if (!user || !(await bcrypt.compare(input.password, user.password))) {
      throw new UnauthorizedException(
        this.i18n.t('events.auth.INVALID_CREDENTIALS'),
      );
    }

    if (!user.isVerified) {
      throw new UnauthorizedException(
        this.i18n.t('events.auth.ACCOUNT_NOT_VERIFIED'),
      );
    }

    if (user.role === UserRole.VENDOR) {
      const vendor = await this.vendorRepo.findOne({
        where: { user: { id: user.id } },
      });
      if (!vendor) {
        throw new UnauthorizedException(this.i18n.t('events.vendor.NOT_FOUND'));
      }
      if (vendor?.status === VendorStatus.PENDING) {
        const lang = I18nContext.current()?.lang;
        throw new UnauthorizedException(
          this.i18n.t('events.auth.ACCOUNT_PENDING', { lang }),
        );
      }
    }
    const { accessToken, refreshToken } = await this.generateTokens(user);

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  async exchangeCodeForUser(code: string) {
    try {
      const { tokens } = await this.googleClient.getToken({
        code,
        redirect_uri: 'postmessage',
      });

      const ticket = await this.googleClient.verifyIdToken({
        idToken: tokens.id_token!,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new UnauthorizedException(this.i18n.t('events.auth.INVALID_GOOGLE_CODE'));
      }

      return {
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        googleAccessToken: tokens.access_token,
      };
    } catch (error) {
      console.error('Google Exchange Error:', error);
      throw new UnauthorizedException(this.i18n.t('events.auth.INVALID_GOOGLE_CODE'));
    }
  }

  async verifyOtp({
    email,
    otp,
  }: VerifyOtpInput): Promise<{ accessToken: string; refreshToken: string }> {
    const user: User | null = await this.userRepo.findOne({ where: { email } });

    if (!user) {
      throw new BadRequestException(this.i18n.t('events.auth.USER_NOT_FOUND'));
    }
    if (user.isVerified) {
      throw new BadRequestException(
        this.i18n.t('events.auth.ACCOUNT_ALREADY_VERIFIED'),
      );
    }
    if (user.otp !== otp) {
      throw new BadRequestException(this.i18n.t('events.auth.INVALID_OTP'));
    }
    if (new Date() > user.otpExpires!) {
      throw new BadRequestException(this.i18n.t('events.auth.EXPIRED_OTP'));
    }

    user.isVerified = true;
    await this.userRepo.save(user);

    return this.generateTokens(user);
  }

  async resendOtp({ email }: ResendOtpInput): Promise<RegisterResponse> {
    const user = await this.userRepo.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException(this.i18n.t('events.auth.NOT_FOUND'));
    }
    if (user.isVerified) {
      throw new BadRequestException(
        this.i18n.t('events.auth.ACCOUNT_ALREADY_VERIFIED'),
      );
    }

    const { otp, expires } = this.generateOtp();
    user.otp = otp;
    user.otpExpires = expires;
    await this.userRepo.save(user);

    await this.emailService.sendEmail(user.email, 'Verify OTP', otp);
    console.log(`New OTP for ${user.email}: ${otp}`);

    return { msg: 'A new OTP has been sent to your email.' };
  }

  async generateTokens(
    user: User,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = {
      userId: user.id,
      role: user.role,
    };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(
      { id: user.id },
      {
        expiresIn: '7d',
      },
    );

    return { accessToken, refreshToken };
  }

  private generateOtp(): { otp: string; expires: Date } {
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000);
    return { otp, expires };
  }

  async refreshToken(userId: string): Promise<AuthResponse> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(this.i18n.t('events.auth.USER_NOT_FOUND'));
    }
    const { accessToken, refreshToken } = await this.generateTokens(user);
    return { accessToken, refreshToken };
  }

  async findByIds(userIds: string[]): Promise<User[]> {
    return this.userRepo.find({
      where: { id: In(userIds) },
    });
  }
}