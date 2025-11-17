import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { EmailsModule } from 'src/emails/emails.module';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth.controller';
import googleOAuthConfig from './config/google.oauth.config';
import { GoogleAuthGuard } from './guards/google-auth/google-auth.guard';
import { GoogleStrategy } from './strategies/google.strategy';
import { PassportModule } from '@nestjs/passport';
@Module({
  imports: [
    PassportModule,
    TypeOrmModule.forFeature([User]),
    EmailsModule,
    ConfigModule.forFeature(googleOAuthConfig),

  ],
  providers: [AuthResolver, AuthService, GoogleAuthGuard, GoogleStrategy],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
