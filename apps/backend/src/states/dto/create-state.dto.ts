import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateStateDto {
  @IsString()
  @MaxLength(30)
  name?: string;

  @IsIn(['course', 'task'])
  entity?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  code?: string;
}