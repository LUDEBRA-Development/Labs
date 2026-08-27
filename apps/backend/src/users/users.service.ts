import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { Role } from '../auth/enums/role.enum';
import { FirebaseAdminService } from '../firebase-admin/firebase-admin.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly firebaseAdminService: FirebaseAdminService,
  ) {}

  // El admin crea a la vez la credencial (Firebase) y el perfil (BD propia).
  // Si algo falla guardando en la BD propia, se revierte la cuenta creada
  // en Firebase para no dejar credenciales huérfanas sin perfil.
  async create(dto: CreateUserDto): Promise<User> {
    const existing = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Ya existe un usuario con ese correo');
    }

    const firebaseUser = await this.firebaseAdminService.createAuthUser({
      email: dto.email,
      password: dto.password,
      displayName: `${dto.firstName} ${dto.lastName}`,
    });

    try {
      const user = this.userRepository.create({
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        profileId: firebaseUser.uid,
        role: dto.role,
        isActive: true,
      });
      return await this.userRepository.save(user);
    } catch (error) {
      this.logger.error(
        `Fallo guardando perfil en BD, revirtiendo usuario de Firebase (${firebaseUser.uid})`,
        error as Error,
      );
      await this.firebaseAdminService
        .deleteAuthUser(firebaseUser.uid)
        .catch((cleanupError) =>
          this.logger.error('No se pudo revertir el usuario de Firebase', cleanupError as Error),
        );
      throw error;
    }
  }

  findAll(role?: Role): Promise<User[]> {
    return this.userRepository.find({
      where: role ? { role } : {},
      order: { firstName: 'ASC' },
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email: id } });
    if (!user) {
      throw new NotFoundException(`Usuario ${id} no encontrado`);
    }
    return user;
  }

  // Usado únicamente por FirebaseAuthGuard en cada request autenticado.
  findByFirebaseUid(firebaseUid: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { profileId: firebaseUid } });
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    Object.assign(user, dto);
    return this.userRepository.save(user);
  }

  // Activa/desactiva en ambos lados: BD propia (fuente de verdad del perfil)
  // y Firebase (para que un usuario desactivado no pueda ni siquiera
  // loguearse, no solo que el backend le rechace las peticiones).
  async updateStatus(id: string, dto: UpdateUserStatusDto): Promise<User> {
    const user = await this.findOne(id);
    user.isActive = dto.isActive;
    if (user.profileId) {
      await this.firebaseAdminService.setDisabled(user.profileId, !dto.isActive);
    }
    return this.userRepository.save(user);
  }
}
