import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Task } from '../tasks/entities/task.entity';
import { DeliveryFile } from './entities/delivery-file.entity';
import { UserTask } from './entities/user-task.entity';
import { UserTasksController } from './user-tasks.controller';
import { UserTasksService } from './user-tasks.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserTask, Task, DeliveryFile]),
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads/deliveries',
        filename: (_req, file, callback) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          callback(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 50 * 1024 * 1024 },
    }),
  ],
  controllers: [UserTasksController],
  providers: [UserTasksService],
  exports: [UserTasksService, TypeOrmModule],
})
export class UserTasksModule {}
