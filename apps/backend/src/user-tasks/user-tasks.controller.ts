import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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

  @Post('submit')
  @UseInterceptors(FileInterceptor('file'))
  submit(
    @Body() dto: CreateUserTaskDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.userTasksService.submit(dto, file);
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
