import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
} from 'typeorm';
import { Role } from '../../auth/enums/role.enum';

// Esta tabla NUNCA guarda contraseñas ni tokens.
// La autenticación (login, password, reset) vive en Firebase Auth.
// Firebase mantiene las credenciales; su UID se guarda en Id_Profile.
@Entity('Users')
export class User {
  @PrimaryColumn({ name: 'Email', length: 100 })
  email!: string;

  @Column({ name: 'First_Name', length: 50 })
  firstName!: string;

  @Column({ name: 'Second_Name', length: 50, nullable: true })
  lastName!: string;

  @Column({ name: 'Profile_Picture', type: 'varchar', length: 255, nullable: true })
  profilePicture!: string | null;

  @Column({ name: 'Id_Profile', type: 'varchar', length: 100, nullable: true })
  profileId!: string | null;

  @Column({ name: 'id_role', length: 10 })
  role!: Role;

  @Column({ name: 'Status', type: 'tinyint', default: 1 })
  isActive!: boolean;

  @CreateDateColumn({ name: 'Created_at' })
  createdAt!: Date;
}
