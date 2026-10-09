import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { SafeUser } from '../../users/users.service.js';

export const CurrentUser = createParamDecorator(
  (data: keyof SafeUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as SafeUser | undefined;

    return data && user ? user[data] : user;
  },
);
