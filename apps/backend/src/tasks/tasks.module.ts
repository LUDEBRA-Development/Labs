import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { Task } from './entities/task.entity';
import { Simulator } from 'src/simulators/entities/simulator.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SimulatorsModule } from 'src/simulators/simulators.module';
import { State } from 'src/states/entities/state.entity';
import { StatesModule } from 'src/states/states.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, Simulator, State]), 
    SimulatorsModule,
    StatesModule
  ],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
