import { IsOptional, IsString, MaxLength } from 'class-validator';

// Update deliberadamente NO incluye email, password ni role:
// - email/password se gestionan contra Firebase con sus propios flujos.
// - role no debe cambiar por un PATCH genérico (evita escaladas de
//   privilegio accidentales); si se necesita, se hace con un endpoint
//   explícito y auditable.
export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;
}
