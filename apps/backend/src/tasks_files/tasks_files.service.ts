import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskFile } from './entities/tasks_file.entity';
import { extname } from 'path';

@Injectable()
export class TasksFilesService {
  constructor(
    @InjectRepository(TaskFile)
    private readonly taskFileRepo: Repository<TaskFile>,
  ) {}

  async create(idTask: number, file: Express.Multer.File) {
    const taskFile = this.taskFileRepo.create({
      idTask,
      urlFile: `/uploads/tasks/${file.filename}`,
      fileName: file.originalname,
      fileType: extname(file.originalname).replace('.', ''),
    });
    return this.taskFileRepo.save(taskFile);
  }

  findByTask(idTask: number) {
    return this.taskFileRepo.find({ where: { idTask } });
  }

  async remove(idTaskFile: number) {
    const file = await this.taskFileRepo.findOne({ where: { idTaskFile } });
    if (!file) throw new NotFoundException('Archivo no encontrado');
    return this.taskFileRepo.remove(file);
  }
}