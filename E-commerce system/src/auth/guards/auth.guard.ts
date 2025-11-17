import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}
  canActivate(context: ExecutionContext): boolean {
    const gqlCtx = GqlExecutionContext.create(context);
    const ctx = gqlCtx.getContext();
    const req = ctx.req;

    // Support both HTTP and GraphQL
    const headers = req?.headers || {};
    const auth = headers.authorization || headers.Authorization;
    if (!auth) throw new UnauthorizedException('You are unauthorized');

    const parts = auth.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer')
      throw new UnauthorizedException('Bad authorization header');

    const token = parts[1];

    try {
      const payload = this.jwtService.verify(token);
      console.log(payload);
      req.user = payload;
      return true;
    } catch (err) {
      throw new UnauthorizedException(
        'Invalid token (expect valid JWT in production)',
      );
    }
  }
}
