
// import {
//   Injectable,
//   CanActivate,
//   ExecutionContext,
//   ForbiddenException,
// } from '@nestjs/common';
// import { Reflector } from '@nestjs/core';
// import { GqlExecutionContext } from '@nestjs/graphql';
// import { ROLES_KEY } from '../decorators/roles.decorator';

// @Injectable()
// export class RolesGuard implements CanActivate {
//   constructor(private reflector: Reflector) {}

//   canActivate(context: ExecutionContext): boolean {
//     const requiredRoles = this.reflector.getAllAndOverride<string[]>(
//       ROLES_KEY,
//       [context.getHandler(), context.getClass()],
//     );

//     if (!requiredRoles || requiredRoles.length === 0) return true;

//     const gqlCtx = GqlExecutionContext.create(context).getContext();
//     const user = gqlCtx.user || gqlCtx.req?.user;

//     if (!user) {
//       throw new ForbiddenException('User not authenticated');
//     }

//     const userRoles = Array.isArray(user.role) ? user.role : [user.role];
//     const hasPermission = userRoles.some(role =>
//       requiredRoles.includes(role),
//     );

//     if (!hasPermission) {
//       throw new ForbiddenException(
//         `Access denied. Your role(s): [${userRoles.join(', ')}], required: [${requiredRoles.join(', ')}]`,
//       );
//     }

//     return true;
//   }
// }


import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) return true;

    const user = this.getUserFromContext(context);

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const userRoles = Array.isArray(user.role) ? user.role : [user.role];
    const hasPermission = userRoles.some((r) => requiredRoles.includes(r));

    if (!hasPermission) {
      throw new ForbiddenException(
        `Access denied. Your role(s): [${userRoles.join(
          ', ',
        )}], required: [${requiredRoles.join(', ')}]`,
      );
    }

    return true;
  }

  private getUserFromContext(context: ExecutionContext) {
    const type = context.getType<string>();

    // REST
    if (type === 'http') {
      return context.switchToHttp().getRequest().user;
    }

    // GraphQL
    if (type === 'graphql') {
      const gqlCtx = GqlExecutionContext.create(context).getContext();
      return gqlCtx.user || gqlCtx.req?.user;
    }

    return null;
  }
}

//if i gave you any error return to the commented code