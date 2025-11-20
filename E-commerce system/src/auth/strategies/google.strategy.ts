import { Strategy } from 'passport-google-oauth20';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable } from '@nestjs/common';
import googleOauthConfig from '../config/google.oauth.config';
import type { ConfigType } from '@nestjs/config';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    @Inject(googleOauthConfig.KEY)
    private googleConfiguration: ConfigType<typeof googleOauthConfig>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {
    super({
      clientID: googleConfiguration.clientID!,
      clientSecret: googleConfiguration.clientSecret!,
      callbackURL: googleConfiguration.callbackURL!,
      scope: ['email', 'profile'],
    });
  }
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: (error: Error | null, user?: any, info?: any) => void,
  ) {
    console.log('from google strategy');
    console.log(accessToken);
    const user = await this.userRepo.findOne({
      where: {
        email: profile.emails[0].value,
      },
    });
    if (user) {
      return done(null, user);
    }
    // const newUser = this.userRepo.create({
    //   email: profile.emails[0].value,
    //   password: '',
    //   role: 'Passenger',
    // });

    // const savedUser = await this.userRepo.save(newUser);

    // return done(null, savedUser);
  }
}
