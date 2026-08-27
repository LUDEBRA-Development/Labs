import { IsUUID } from 'class-validator';

export class AssignTeacherDto {
  @IsUUID()
  userId!: string;
}
