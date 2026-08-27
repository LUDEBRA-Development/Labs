import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { FirebaseConfig } from '../config';

// Punto único de contacto con Firebase Auth. Todo lo demás en el backend
// (guards, users.service) pasa por aquí en vez de importar `firebase-admin`
// directamente, así el resto del código no depende del SDK concreto.
@Injectable()
export class FirebaseAdminService implements OnModuleInit {
  private app!: admin.app.App;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const firebase = this.configService.getOrThrow<FirebaseConfig>('firebase');

    this.app = admin.apps.length
      ? (admin.app() as admin.app.App)
      : admin.initializeApp({
          credential: admin.credential.cert({
            projectId: firebase.projectId,
            clientEmail: firebase.clientEmail,
            privateKey: firebase.privateKey,
          }),
        });
  }

  get auth(): admin.auth.Auth {
    return this.app.auth();
  }

  // Verifica el ID Token que manda el frontend en el header Authorization.
  // Lanza si el token es inválido o expiró.
  verifyIdToken(idToken: string): Promise<admin.auth.DecodedIdToken> {
    return this.auth.verifyIdToken(idToken);
  }

  // Crea la cuenta de autenticación en Firebase. La contraseña temporal
  // la define el admin desde el formulario de creación de usuarios.
  createAuthUser(params: {
    email: string;
    password: string;
    displayName: string;
  }): Promise<admin.auth.UserRecord> {
    return this.auth.createUser({
      email: params.email,
      password: params.password,
      displayName: params.displayName,
      emailVerified: false,
      disabled: false,
    });
  }

  // Refleja en Firebase el estado activo/inactivo que se guarda en la BD
  // propia: un usuario desactivado no debe poder loguearse nunca más,
  // aunque conserve el idToken todavía vigente en el navegador.
  setDisabled(
    firebaseUid: string,
    disabled: boolean,
  ): Promise<admin.auth.UserRecord> {
    return this.auth.updateUser(firebaseUid, { disabled });
  }

  deleteAuthUser(firebaseUid: string): Promise<void> {
    return this.auth.deleteUser(firebaseUid);
  }
}
