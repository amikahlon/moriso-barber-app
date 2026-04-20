// במקום לכתוב request.user בכל controller, פשוט כותבים @CurrentUser() ומקבלים את המשתמש המחובר ישירות.
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { users } from '@prisma/client';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): users => {
    const { user } = ctx.switchToHttp().getRequest<{ user: users }>();
    return user;
  },
);
