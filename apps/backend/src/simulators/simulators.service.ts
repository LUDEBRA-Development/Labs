import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Simulator } from './entities/simulator.entity';
import { CreateSimulatorDto } from './dto/create-simulator.dto';
import { UpdateSimulatorDto } from './dto/update-simulator.dto';

@Injectable()
export class SimulatorsService {
  constructor(
    @InjectRepository(Simulator)
    private readonly simulatorRepository: Repository<Simulator>,
  ) {}

  create(dto: CreateSimulatorDto): Promise<Simulator> {
    const simulator = this.simulatorRepository.create(dto);
    return this.simulatorRepository.save(simulator);
  }

  // onlyActive: true -> para que los docentes solo vean simuladores habilitados
  // al momento de asignarlos a una tarea.
  findAll(onlyActive = false): Promise<Simulator[]> {
    return this.simulatorRepository.find({
      where: onlyActive ? { status: true } : {},
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Simulator> {
    const simulator = await this.simulatorRepository.findOne({
      where: { idSimulador: id },
    });
    if (!simulator) {
      throw new NotFoundException(`Simulador ${id} no encontrado`);
    }
    return simulator;
  }

  async update(id: number, dto: UpdateSimulatorDto): Promise<Simulator> {
    const simulator = await this.findOne(id);
    Object.assign(simulator, dto);
    return this.simulatorRepository.save(simulator);
  }

  async remove(id: number): Promise<void> {
    const simulator = await this.findOne(id);
    await this.simulatorRepository.remove(simulator);
  }
}
