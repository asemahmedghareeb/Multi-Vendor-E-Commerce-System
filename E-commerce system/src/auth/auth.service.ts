import { Role } from 'src/auth/role.enum';
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

import { User } from './entities/user.entity';
import { AuthResponse } from './dto/loginResponse.dto';
import { LoginInput } from './dto/loginInput.dto';
import { RegisterPassengerInput } from './dto/passenger.dto';

import { RegisterStaffInput } from './dto/staff.dto';
import { RegisterResponse } from './dto/registerResponse.dto';
import { VerifyOtpInput } from './dto/verifyOtpInput';
import { EmailsService } from 'src/emails/emails.service';
import { ResendOtpInput } from './dto/resendOtpInput';
import { OAuth2Client } from 'google-auth-library';
@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private emailService: EmailsService,
  ) {
    this.googleClient = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
    );
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
        throw new UnauthorizedException('Invalid Google Code');
      }

      return {
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        googleAccessToken: tokens.access_token,
      };

    } catch (error) {
      console.error('Google Exchange Error:', error);
      throw new UnauthorizedException('Invalid Google Code');
    }
  }






  // async registerPassenger(
  //   input: RegisterPassengerInput,
  // ): Promise<RegisterResponse> {
  //   const existingUser = await this.usersRepository.findOne({
  //     where: { email: input.email },
  //   });
  //   if (existingUser) {
  //     throw new BadRequestException('User with this email already exists.');
  //   }

  //   const hashedPassword = await bcrypt.hash(input.password, 10);
  //   const { otp, expires } = this.generateOtp(); 

  //   const newUser = this.usersRepository.create({
  //     email: input.email,
  //     password: hashedPassword,
  //     role: 'Passenger',
  //     isVerified: false,
  //     otp: otp,
  //     otpExpires: expires,
  //   });
  //   const savedUser = await this.usersRepository.save(newUser);

  //   const newPassenger = this.passengersRepository.create({
  //     user: savedUser,
  //     name: input.name,
  //     passportNumber: input.passportNumber,
  //     nationality: input.nationality,
  //   });
  //   await this.passengersRepository.save(newPassenger);

  //   await this.emailService.sendEmail(savedUser.email, 'Verify OTP', otp);
  //   console.log(`OTP for ${savedUser.email}: ${otp}`); 

  //   return {
  //     msg: 'Passenger registered. Please check your email for an OTP.',
  //   };
  // }












  // async registerStaff(input: RegisterStaffInput): Promise<RegisterResponse> {
    // const airport = await this.airportsRepository.findOne({
    //   where: { id: input.airportId },
    // });
    // if (!airport) {
    //   throw new BadRequestException(
    //     `Airport with ID ${input.airportId} not found.`,
    //   );
    // }

    // const existingUser = await this.usersRepository.findOne({
    //   where: { email: input.email },
    // });
    // if (existingUser) {
    //   throw new BadRequestException('User with this email already exists.');
    // }

    // const hashedPassword = await bcrypt.hash(input.password, 10);
    // const { otp, expires } = this.generateOtp();

    // const newUser = this.usersRepository.create({
    //   email: input.email,
    //   password: hashedPassword,
    //   role: input.userRole,
    //   isVerified: false,
    //   otp: otp,
    //   otpExpires: expires,
    // });
    // const savedUser = await this.usersRepository.save(newUser);
    // const newStaff = this.staffRepository.create({
    //   user: savedUser,
    //   airport: airport,
    //   employeeId: input.employeeId,
    //   name: input.name,
    //   role: input.staffRole,
    //   userId: savedUser.id,
    // });
    // await this.staffRepository.save(newStaff);

    // await this.emailService.sendEmail(savedUser.email, 'Verify OTP', otp);
    // console.log(`OTP for ${savedUser.email}: ${otp}`);

  //   return { msg: 'Staff registered. Please check your email for an OTP.' };
  // }









  // async verifyOtp({ email, otp }: VerifyOtpInput): Promise<AuthResponse> {
  //   const user = await this.usersRepository.findOne({ where: { email } });

  //   if (!user) {
  //     throw new BadRequestException('Invalid email or OTP.');
  //   }
  //   if (user.isVerified) {
  //     throw new BadRequestException('Account already verified.');
  //   }
  //   if (user.otp !== otp) {
  //     throw new BadRequestException('Invalid email or OTP.');
  //   }
  //   if (new Date() > user.otpExpires!) {
  //     throw new BadRequestException('OTP has expired.');
  //   }

  //   user.isVerified = true;
  //   user.otp = null;
  //   user.otpExpires = null;
  //   await this.usersRepository.save(user);

  //   return this.generateTokens(user);
  // }









  // async resendOtp({ email }: ResendOtpInput): Promise<RegisterResponse> {
  //   const user = await this.usersRepository.findOne({ where: { email } });

  //   if (!user) {
  //     throw new NotFoundException('User not found.');
  //   }
  //   if (user.isVerified) {
  //     throw new BadRequestException('Account already verified.');
  //   }

  //   const { otp, expires } = this.generateOtp();
  //   user.otp = otp;
  //   user.otpExpires = expires;
  //   await this.usersRepository.save(user);

  //   await this.emailService.sendEmail(user.email, 'Verify OTP', otp);
  //   console.log(`New OTP for ${user.email}: ${otp}`);

  //   return { msg: 'A new OTP has been sent to your email.' };
  // }






  // async login({ email, password }: LoginInput): Promise<AuthResponse> {
  //   const user = await this.usersRepository.findOne({
  //     where: { email },
  //     select: ['id', 'email', 'password', 'role', 'isVerified'],
  //   });

  //   if (!user) {
  //     throw new UnauthorizedException('Invalid credentials.');
  //   }

  //   // const isPasswordValid = await bcrypt.compare(password, user.password);
  //   // if (!isPasswordValid) {
  //   //   throw new UnauthorizedException('Invalid credentials.');
  //   // }

  //   if (!user.isVerified) {
  //     throw new UnauthorizedException(
  //       'Account not verified. Please check your email for an OTP.',
  //     );
  //   }

  //   const tokens = await this.generateTokens(user);
  //   return tokens;
  // }








  // async generateTokens(user: User): Promise<AuthResponse> {
    // if (user.role === Role.PASSENGER) {
    //   const passenger = await this.passengersRepository.findOne({
    //     where: { userId: user.id },
    //   });
    //   const payload = {
    //     userId: user.id,
    //     role: user.role,
    //     passengerId: passenger?.id,
    //   };
    //   const accessToken = this.jwtService.sign(payload);
    //   const refreshToken = this.jwtService.sign(
    //     { id: user.id },
    //     {
    //       expiresIn: '7d',
    //     },
    //   );

    //   return { accessToken, refreshToken };
    // }

    // if (user.role === Role.STAFF) {
    //   const staff = await this.staffRepository.findOne({
    //     where: { userId: user.id },
    //   });

    //   const payload = {
    //     userId: user.id,
    //     role: user.role,
    //     staffId: staff?.id,
    //     staffRole: staff?.role,
    //   };

    //   const accessToken = this.jwtService.sign(payload);
    //   const refreshToken = this.jwtService.sign(
    //     { id: user.id },
    //     {
    //       expiresIn: '7d',
    //     },
    //   );
    //   return { accessToken, refreshToken };
    // }

    // const admin = await this.staffRepository.findOne({
    //   where: { userId: user.id },
    // });

  //     const payload = {
  //       userId: user.id,
  //       role: user.role,
  //       staffRole: admin?.role,
  //       airportId: admin?.airportId,
  //     };

  //   const accessToken = this.jwtService.sign(payload);
  //   const refreshToken = this.jwtService.sign(
  //     { id: user.id },
  //     {
  //       expiresIn: '7d',
  //     },
  //   );

  //   return {
  //     accessToken,
  //     refreshToken,
  //   };
  // }

  









//   async refreshToken(userId: string): Promise<AuthResponse> {
//     const user = await this.usersRepository.findOne({ where: { id: userId } });
//     if (!user) throw new UnauthorizedException();

//     const tokens: AuthResponse = await this.generateTokens(user);
//     return tokens;
//   }

//   private generateOtp(): { otp: string; expires: Date } {
//     // Generate a 4-digit OTP
//     const otp = Math.floor(1000 + Math.random() * 9000).toString();
//     // Set expiry to 10 minutes from now
//     const expires = new Date(Date.now() + 10 * 60 * 1000);
//     return { otp, expires };
//   }

//   async findOne(id: string): Promise<User> {
//     const user: User | null = await this.usersRepository.findOne({
//       where: { id },
//       relations: ['pushDevices'],
//     });
//     if (!user) {
//       throw new NotFoundException(`User with ID "${id}" not found.`);
//     }
//     return user;
//   }

//   async findByIds(userIds: string[]): Promise<User[]> {
//     return this.usersRepository.find({
//       where: { id: In(userIds) },
//     });
//   }
}
