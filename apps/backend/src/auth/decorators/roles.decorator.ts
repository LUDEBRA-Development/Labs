import { SetMetadata } from '@nestjs/common';
import { Role } from '../enums/role.enum';

export const ROLES_KEY = 'roles';

// Uso: @Roles(Role.ADMIN) sobre un método de controller.
// Si un endpoint no lleva @Roles, RolesGuard lo deja pasar para
// cualquier usuario autenticado (autenticación sí, autorización por
// rol solo donde se declare explícitamente).
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
