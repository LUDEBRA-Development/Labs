import { Module } from '@nestjs/common';
import { SimulatorsService } from './simulators.service';
import { SimulatorsController } from './simulators.controller';
import { Simulator } from './entities/simulator.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Simulator])],
  controllers: [SimulatorsController],
  providers: [SimulatorsService],
  exports: [SimulatorsService]  
})
export class SimulatorsModule {}
