// שומר תפקידים — אחרי שה-JWT guard אישר, הוא בודק שלמשתמש
//  יש את ה-role הנדרש. למשל אם endpoint דורש admin ומשתמש רגיל מנסה להיכנס — מחזיר 403.

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { users } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest<{ user: users }>();

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException('אין לך הרשאה לבצע פעולה זו');
    }

    return true;
  }
}
