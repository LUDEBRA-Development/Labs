import {
  ArrayUnique,
  IsArray,
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @MaxLength(100)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  descriptions?: string;

  @IsOptional()
  @IsDateString()
  expirationDate?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxScore?: number = 5.0;

  @IsInt()
  periodId!: number;

  @IsInt()
  stateId!: number;

  // El docente elige acá qué simulador(es) habilita para esta actividad.
  // Puede ir vacío si la tarea no usa simulador.
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  simulatorIds?: number[];
}
