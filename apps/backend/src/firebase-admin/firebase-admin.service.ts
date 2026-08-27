import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  App,
  cert,
  getApps,
  initializeApp,
} from 'firebase-admin/app';
import {
  Auth,
  DecodedIdToken,
  UserRecord,
  getAuth,
} from 'firebase-admin/auth';
import { FirebaseConfig } from 'src/config';

// Punto único de contacto con Firebase Auth.
@Injectable()
export class FirebaseAdminService implements OnModuleInit {
  private app!: App;
  private firebaseAuth!: Auth;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const firebase = this.configService.getOrThrow('firebase') as FirebaseConfig;

    if (getApps().length > 0) {
      this.app = getApps()[0];
    } else {
      this.app = initializeApp({
        credential: cert({
          projectId: firebase.projectId,
          clientEmail: firebase.clientEmail,
          privateKey: firebase.privateKey,
        }),
      });
    }

    this.firebaseAuth = getAuth(this.app);
  }

  get auth(): Auth {
    return this.firebaseAuth;
  }

  verifyIdToken(idToken: string): Promise<DecodedIdToken> {
    return this.auth.verifyIdToken(idToken);
  }

  createAuthUser(params: {
    email: string;
    password: string;
    displayName: string;
  }): Promise<UserRecord> {
    return this.auth.createUser({
      email: params.email,
      password: params.password,
      displayName: params.displayName,
      emailVerified: false,
      disabled: false,
    });
  }

  setDisabled(
    firebaseUid: string,
    disabled: boolean,
  ): Promise<UserRecord> {
    return this.auth.updateUser(firebaseUid, { disabled });
  }

  deleteAuthUser(firebaseUid: string): Promise<void> {
    return this.auth.deleteUser(firebaseUid);
  }
}
