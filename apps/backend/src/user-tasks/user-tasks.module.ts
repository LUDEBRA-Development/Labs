import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from '../tasks/entities/task.entity';
import { UserTask } from './entities/user-task.entity';
import { UserTasksController } from './user-tasks.controller';
import { UserTasksService } from './user-tasks.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserTask, Task])],
  controllers: [UserTasksController],
  providers: [UserTasksService],
  exports: [UserTasksService, TypeOrmModule],
})
export class UserTasksModule {}
