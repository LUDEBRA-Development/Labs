import { Type } from 'class-transformer';
import { IsEmail, IsInt, IsOptional, Min } from 'class-validator';

export class ListUserTasksDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  taskId?: number;

  @IsOptional()
  @IsEmail()
  email?: string;
}
