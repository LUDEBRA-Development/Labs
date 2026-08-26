import { Transform } from 'class-transformer';
import { IsBoolean, IsEmail, IsOptional, MaxLength } from 'class-validator';

export class ListNotificationsDto {
  // TODO: obtener este correo del usuario autenticado cuando exista el módulo 1.
  @IsEmail()
  @MaxLength(255)
  recipientEmail!: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value as unknown;
  })
  @IsBoolean()
  onlyUnread?: boolean;
}
