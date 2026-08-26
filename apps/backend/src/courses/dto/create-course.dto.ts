import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCourseDto {
  @IsString()
  @MaxLength(100)
  name!: string;

  @IsString()
  @MaxLength(20)
  code!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
