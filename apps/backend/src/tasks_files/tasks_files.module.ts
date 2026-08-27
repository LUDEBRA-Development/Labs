import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { extname } from 'path';
import { TasksFilesService } from './tasks_files.service';
import { TasksFileDeleteController, TasksFilesController } from './tasks_files.controller';
import { diskStorage } from 'multer';
import { TaskFile } from './entities/tasks_file.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([TaskFile]),
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads/tasks',
        filename: (req, file, callback) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          callback(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB, ajusta a tu gusto
    }),
  ],
  controllers: [TasksFilesController, TasksFileDeleteController],
  providers: [TasksFilesService],
})
export class TaskFilesModule {}