import { IsEmail, MaxLength } from 'class-validator';

export class NotificationRecipientDto {
  // TODO: obtener este correo del usuario autenticado cuando exista el módulo 1.
  @IsEmail()
  @MaxLength(255)
  recipientEmail!: string;
}
