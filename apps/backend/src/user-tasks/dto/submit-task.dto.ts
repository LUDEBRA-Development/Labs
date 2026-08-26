import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class SubmitTaskDto {
  // TODO: obtener este correo del usuario autenticado cuando exista el módulo 1.
  @IsEmail()
  @MaxLength(255)
  emailUser!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  comment?: string;
}
