import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UploadedFile,
  UseInterceptors,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TasksFilesService } from './tasks_files.service';

@Controller('tasks/:idTask/files')
export class TasksFilesController {
  constructor(private readonly taskFilesService: TasksFilesService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @Param('idTask', ParseIntPipe) idTask: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.taskFilesService.create(idTask, file);
  }

  @Get()
  findByTask(@Param('idTask', ParseIntPipe) idTask: number) {
    return this.taskFilesService.findByTask(idTask);
  }
}


@Controller('task-files')
export class TasksFileDeleteController {
  constructor(private readonly taskFilesService: TasksFilesService) {}

  @Delete(':idTaskFile')
  remove(@Param('idTaskFile', ParseIntPipe) idTaskFile: number) {
    return this.taskFilesService.remove(idTaskFile);
  }
}