import { Global, Module } from '@nestjs/common';
import { FirebaseAdminService } from './firebase-admin.service';

// Global porque el guard de autenticación lo necesita en toda petición
// protegida, sin tener que reimportar el módulo en cada dominio.
@Global()
@Module({
  providers: [FirebaseAdminService],
  exports: [FirebaseAdminService],
})
export class FirebaseAdminModule {}
