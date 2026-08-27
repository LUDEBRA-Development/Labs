import { IsUUID } from 'class-validator';

export class EnrollStudentDto {
  @IsUUID()
  userId!: string;
}
