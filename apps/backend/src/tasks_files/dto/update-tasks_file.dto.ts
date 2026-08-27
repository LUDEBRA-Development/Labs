import { PartialType } from '@nestjs/mapped-types';
import { CreateTasksFileDto } from './create-tasks_file.dto';

export class UpdateTasksFileDto extends PartialType(CreateTasksFileDto) {}
