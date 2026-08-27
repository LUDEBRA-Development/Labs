import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../users/entities/user.entity';

// Uso: create(@CurrentUser() user: User, @Body() dto: ...)
// `user` ya es la entidad de la BD propia (no el token de Firebase),
// cargada por FirebaseAuthGuard.
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
