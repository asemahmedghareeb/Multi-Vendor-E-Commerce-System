import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailsModule } from 'src/emails/emails.module';
import { PassportModule } from '@nestjs/passport';
import { Vendor } from 'src/vendors/entities/vendor.entity';
import { User } from 'src/users/entities/user.entity';
import { Session } from './entities/session.entity';


@Module({
  imports: [
    PassportModule,
    TypeOrmModule.forFeature([User, Vendor, Session]),
    EmailsModule,
  ],
  providers: [AuthResolver, AuthService],
  exports: [AuthService],

})
export class AuthModule {}
