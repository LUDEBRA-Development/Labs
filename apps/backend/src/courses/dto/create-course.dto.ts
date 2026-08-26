import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCourseDto {
  @IsString()
  @MaxLength(8)
  idCourse!: string;

  @IsString()
  @MaxLength(100)
  name!: string;

  @IsString()
  @MaxLength(13)
  code!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
