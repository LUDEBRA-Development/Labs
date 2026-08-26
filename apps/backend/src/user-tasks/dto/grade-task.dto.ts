import {
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class GradeTaskDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  qualification!: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(4000)
  feedbackComment!: string;
}
