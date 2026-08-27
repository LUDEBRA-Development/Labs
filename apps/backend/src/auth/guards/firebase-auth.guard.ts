import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { FirebaseAdminService } from '../../firebase-admin/firebase-admin.service';
import { UsersService } from '../../users/users.service';

// Este guard hace dos cosas, en orden:
// 1. Verifica el ID Token de Firebase (confirma que "quien entra" es quien
//    dice ser, y que el token no expiró/fue falsificado).
// 2. Busca en la BD propia el perfil ligado a ese firebaseUid y lo
//    adjunta a `request.user`. Si el usuario no existe en la BD propia,
//    o está desactivado, se rechaza aunque el token de Firebase sea válido.
@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(
    private readonly firebaseAdminService: FirebaseAdminService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const idToken = this.extractToken(request);

    if (!idToken) {
      throw new UnauthorizedException('Falta el token de autenticación');
    }

    let firebaseUid: string;
    try {
      const decoded = await this.firebaseAdminService.verifyIdToken(idToken);
      firebaseUid = decoded.uid;
    } catch {
      throw new UnauthorizedException('Token inválido o expirado');
    }

    const user = await this.usersService.findByFirebaseUid(firebaseUid);
    if (!user) {
      throw new UnauthorizedException('Usuario no registrado en el sistema');
    }
    if (!user.isActive) {
      throw new UnauthorizedException('Usuario deshabilitado');
    }

    (request as Request & { user: typeof user }).user = user;
    return true;
  }

  private extractToken(request: Request): string | undefined {
    const header = request.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) return undefined;
    return header.slice('Bearer '.length).trim();
  }
}
