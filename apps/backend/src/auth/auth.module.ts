import { forwardRef, Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { FirebaseAuthGuard } from './guards/firebase-auth.guard';
import { RolesGuard } from './guards/roles.guard';

// No expone controller propio: no hay endpoints /auth/login ni /auth/register,
// porque el login ocurre directamente entre el frontend y Firebase Auth.
// Este módulo solo empaqueta los guards de autenticación/autorización para
// que cualquier otro módulo (courses, tasks, users...) los reutilice con
// @UseGuards(FirebaseAuthGuard, RolesGuard).
//
// forwardRef: AuthModule necesita UsersService (para cargar el perfil en
// el guard) y UsersModule necesita estos guards para proteger sus propias
// rutas -> dependencia circular resuelta a propósito, no por accidente.
@Module({
  imports: [forwardRef(() => UsersModule)],
  providers: [FirebaseAuthGuard, RolesGuard],
  exports: [FirebaseAuthGuard, RolesGuard],
})
export class AuthModule {}
