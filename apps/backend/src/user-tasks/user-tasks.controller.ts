import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { GradeTaskDto } from './dto/grade-task.dto';
import { SubmitTaskDto } from './dto/submit-task.dto';
import { UserTasksService } from './user-tasks.service';

@Controller('user-tasks')
export class UserTasksController {
  constructor(private readonly userTasksService: UserTasksService) {}

  @Post(':taskId/deliver')
  submit(
    @Param('taskId', ParseIntPipe) taskId: number,
    @Body() dto: SubmitTaskDto,
  ) {
    return this.userTasksService.submit(taskId, dto);
  }

  @Patch(':taskId/users/:emailUser/grade')
  grade(
    @Param('taskId', ParseIntPipe) taskId: number,
    @Param('emailUser') emailUser: string,
    @Body() dto: GradeTaskDto,
  ) {
    // TODO: verificar que el usuario autenticado sea el docente de la tarea.
    return this.userTasksService.grade(taskId, emailUser, dto);
  }

  @Get('users/:emailUser/history')
  findHistory(@Param('emailUser') emailUser: string) {
    return this.userTasksService.findHistory(emailUser);
  }

  @Get('tasks/:taskId')
  findByTask(@Param('taskId', ParseIntPipe) taskId: number) {
    return this.userTasksService.findByTask(taskId);
  }

  @Get(':taskId/users/:emailUser')
  findOne(
    @Param('taskId', ParseIntPipe) taskId: number,
    @Param('emailUser') emailUser: string,
  ) {
    return this.userTasksService.findOne(taskId, emailUser);
  }
}
