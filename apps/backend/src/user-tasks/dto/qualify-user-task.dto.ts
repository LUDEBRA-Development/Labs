import {
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class QualifyUserTaskDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  qualification!: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  feedbackComments!: string;
}
