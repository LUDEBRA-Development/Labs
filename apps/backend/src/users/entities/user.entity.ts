import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from '../../auth/enums/role.enum';

// Esta tabla NUNCA guarda contraseñas ni tokens.
// La autenticación (login, password, reset) vive en Firebase Auth.
// Aquí solo se guarda el perfil académico y su vínculo (firebaseUid)
// con la identidad de Firebase.
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid', { name: 'Id_user' })
  idUser!: string;

  // uid que Firebase asigna a la cuenta de autenticación. Es el puente
  // entre "quién entra" (Firebase) y "quién es" (esta tabla).
  @Index({ unique: true })
  @Column({ name: 'Firebase_uid', length: 128, unique: true })
  firebaseUid!: string;

  @Index({ unique: true })
  @Column({ name: 'Email', length: 150, unique: true })
  email!: string;

  @Column({ name: 'First_name', length: 100 })
  firstName!: string;

  @Column({ name: 'Last_name', length: 100 })
  lastName!: string;

  @Column({ name: 'Role', type: 'enum', enum: Role })
  role!: Role;

  // Soft delete / soft disable: nunca se borra un usuario, solo se
  // desactiva (y se deshabilita también su cuenta en Firebase).
  @Column({ name: 'Is_active', type: 'tinyint', default: 1 })
  isActive!: boolean;

  @CreateDateColumn({ name: 'Created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'Updated_at' })
  updatedAt!: Date;

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
