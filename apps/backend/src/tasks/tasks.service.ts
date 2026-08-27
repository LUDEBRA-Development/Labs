import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { Simulator } from '../simulators/entities/simulator.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AssignSimulatorsDto } from './dto/assign-simulators.dto';
import { Period } from '../courses/entities/period.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(Simulator)
    private readonly simulatorRepository: Repository<Simulator>,
    @InjectRepository(Period)
    private readonly periodRepository: Repository<Period>,
  ) {}

async create(dto: CreateTaskDto, createdById: string): Promise<Task> {
  const simulators = await this.resolveSimulators(dto.simulatorIds);

  const task = this.taskRepository.create({
    name: dto.name,
    descriptions: dto.descriptions,
    expirationDate: dto.expirationDate ? new Date(dto.expirationDate) : undefined,
    maxScore: dto.maxScore,
    periodId: dto.periodId,
    state: { idState: dto.stateId },
    createdById: createdById,
    simulators,
  });

  return this.taskRepository.save(task);
}

  findByPeriod(periodId: number): Promise<Task[]> {
    return this.taskRepository.find({
     // where: { period: { idPeriod: periodId } as any }, mientran hacen el modulo periodo. 
     where: { periodId }, 
     order: { creationDate: 'DESC' },
    });
  }

  async findByCourse(courseId: string): Promise<Task[]> {
    const periods = await this.periodRepository.find({
      where: { course: { idCourse: courseId } },
    });
    if (periods.length === 0) return [];
    return this.taskRepository.find({
      where: { periodId: In(periods.map(({ idPeriod }) => idPeriod)) },
      order: { creationDate: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Task> {
    const task = await this.taskRepository.findOne({ where: { idTask: id } });
    if (!task) {
      throw new NotFoundException(`Tarea ${id} no encontrada`);
    }
    return task;
  }

  async update(id: number, dto: UpdateTaskDto): Promise<Task> {
    const task = await this.findOne(id);

    if (dto.simulatorIds) {
      task.simulators = await this.resolveSimulators(dto.simulatorIds);
    }

    Object.assign(task, {
      name: dto.name ?? task.name,
      descriptions: dto.descriptions ?? task.descriptions,
      maxScore: dto.maxScore ?? task.maxScore,
      expirationDate: dto.expirationDate
        ? new Date(dto.expirationDate)
        : task.expirationDate,
    });

    return this.taskRepository.save(task);
  }

  async assignSimulators(id: number, dto: AssignSimulatorsDto): Promise<Task> {
    const task = await this.findOne(id);
    const simulators = await this.resolveSimulators(dto.simulatorIds);
    task.simulators = simulators;
    return this.taskRepository.save(task);
  }

  async removeSimulator(id: number, simulatorId: number): Promise<Task> {
    const task = await this.findOne(id);
    task.simulators = task.simulators.filter(
      (s) => s.idSimulador !== simulatorId,
    );
    return this.taskRepository.save(task);
  }

  async remove(id: number): Promise<void> {
    const task = await this.findOne(id);
    await this.taskRepository.remove(task);
  }

  private async resolveSimulators(ids?: number[]): Promise<Simulator[]> {
    if (!ids || ids.length === 0) return [];
    const simulators = await this.simulatorRepository.find({
      where: { idSimulador: In(ids) },
    });
    if (simulators.length !== ids.length) {
      throw new NotFoundException('Uno o más simuladores no existen');
    }
    return simulators;
  }
}
