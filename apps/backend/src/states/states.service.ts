import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { State } from './entities/state.entity';
import { CreateStateDto } from './dto/create-state.dto';
import { UpdateStateDto } from './dto/update-state.dto';

@Injectable()
export class StatesService {
  constructor(
    @InjectRepository(State)
    private readonly stateRepository: Repository<State>,
  ) {}

  create(dto: CreateStateDto): Promise<State> {
    const state = this.stateRepository.create(dto);
    return this.stateRepository.save(state);
  }

  // GET /states?entity=task -> para el selector de estado al crear una tarea
  findAll(entity?: string): Promise<State[]> {
    return this.stateRepository.find({
      where: entity ? { entity } : {},
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<State> {
    const state = await this.stateRepository.findOne({
      where: { idState: id },
    });
    if (!state) {
      throw new NotFoundException(`Estado ${id} no encontrado`);
    }
    return state;
  }

  async update(id: number, dto: UpdateStateDto): Promise<State> {
    const state = await this.findOne(id);
    Object.assign(state, dto);
    return this.stateRepository.save(state);
  }

  async remove(id: number): Promise<void> {
    const state = await this.findOne(id);
    await this.stateRepository.remove(state);
  }
}