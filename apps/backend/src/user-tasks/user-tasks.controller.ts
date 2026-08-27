import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateUserTaskDto } from './dto/create-user-task.dto';
import { ListUserTasksDto } from './dto/list-user-tasks.dto';
import { QualifyUserTaskDto } from './dto/qualify-user-task.dto';
import { UserTasksService } from './user-tasks.service';

@Controller('user-tasks')
export class UserTasksController {
  constructor(private readonly userTasksService: UserTasksService) {}

  @Post()
  create(@Body() dto: CreateUserTaskDto) {
    return this.userTasksService.create(dto);
  }

  @Patch(':idTask/:emailUser/qualification')
  qualify(
    @Param('idTask', ParseIntPipe) idTask: number,
    @Param('emailUser') emailUser: string,
    @Body() dto: QualifyUserTaskDto,
  ) {
    // TODO: verificar que la sesión corresponda al docente de la tarea.
    return this.userTasksService.qualify(idTask, emailUser, dto);
  }

  @Get()
  findAll(@Query() query: ListUserTasksDto) {
    return this.userTasksService.findAll(query);
  }
}
