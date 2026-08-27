import {
  ArrayUnique,
  IsArray,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export const RUBRIC_CRITERION_IDS = [
  'theoretical-calculations',
  'si-units',
  'charts-and-tables',
] as const;

export class SaveEvaluationDraftDto {
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  qualification?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  feedbackComments?: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsIn(RUBRIC_CRITERION_IDS, { each: true })
  selectedCriteria?: string[];
}
