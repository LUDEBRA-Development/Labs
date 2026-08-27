import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateUserTaskDto {
  // TODO: obtener este correo de la sesión cuando exista autenticación.
  @IsEmail()
  @MaxLength(100)
  emailUser!: string;

  @IsInt()
  idTask!: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  comment?: string;
}
