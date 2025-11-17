import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config'; // Assuming you use ConfigService

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get the request object from the GraphQL context
    const gqlCtx = GqlExecutionContext.create(context);
    const req = gqlCtx.getContext().req;

    const token = this.extractTokenFromHeader(req);
    if (!token) {
      throw new UnauthorizedException('Refresh token not found.');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      req.user = payload;
    } catch (e) {
      throw new UnauthorizedException('Invalid or expired refresh token.');
    }

    return true; // Token is valid, allow access
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers['authorization'];
    if (!authHeader) return undefined;
    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
