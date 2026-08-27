import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { Task } from './entities/task.entity';
import { Simulator } from '../simulators/entities/simulator.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SimulatorsModule } from '../simulators/simulators.module';
import { State } from '../states/entities/state.entity';
import { StatesModule } from '../states/states.module';
import { Period } from '../courses/entities/period.entity';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, Simulator, State, Period]),
    SimulatorsModule,
    StatesModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
