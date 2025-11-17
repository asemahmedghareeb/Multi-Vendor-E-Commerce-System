import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './guards/google-auth/google-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('google/oauth')
  async googleOauth(@Body('code') code: string) {
    if (!code) {
      return new BadRequestException('No code provided');
    }

    const userProfile = await this.authService.exchangeCodeForUser(code);
    console.log(userProfile);
    return userProfile;
  }
  
  @Post('google/login')
  @UseGuards(GoogleAuthGuard)
  async googleLogin(@Body('code') code: string, @Res() res: Response) {}

  // @Get('google/callback')
  // @UseGuards(GoogleAuthGuard)
  // async googleLoginCallback(@Req() req, @Res() res) {
  //   const tokens = await this.authService.generateTokens(req.user);
  //   res.cookie('access_token', tokens.accessToken, {
  //     httpOnly: true,
  //     secure: true,
  //     sameSite: 'lax',
  //     maxAge: 3600000,
  //   });

  //   res.cookie('refresh_token', tokens.refreshToken, {
  //     httpOnly: true,
  //     secure: true,
  //     sameSite: 'lax',
  //     maxAge: 3600000,
  //   });

  //   res.redirect(`http://localhost:3001/client`);
  // }
}
