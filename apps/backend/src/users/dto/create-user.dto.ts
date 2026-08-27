import { IsEmail, IsEnum, IsString, MaxLength, MinLength } from 'class-validator';
import { Role } from '../../auth/enums/role.enum';

export class CreateUserDto {
  @IsString()
  @MaxLength(100)
  firstName!: string;

  @IsString()
  @MaxLength(100)
  lastName!: string;

  @IsEmail()
  @MaxLength(150)
  email!: string;

  // Contraseña temporal que el admin define al crear la cuenta.
  // Firebase exige mínimo 6 caracteres.
  @IsString()
  @MinLength(6)
  @MaxLength(128)
  password!: string;

  // El admin no se crea a sí mismo desde aquí, solo docentes y estudiantes.
  @IsEnum([Role.TEACHER, Role.STUDENT], {
    message: 'role debe ser teacher o student',
  })
  role!: Role.TEACHER | Role.STUDENT;
}
