import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './entities/course.entity';
import { State } from '../states/entities/state.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(State)
    private readonly stateRepository: Repository<State>,
  ) {}

  async create(dto: CreateCourseDto): Promise<Course> {
    const state = await this.resolveState(dto.stateId);
    const course = this.courseRepository.create({
      idCourse: dto.idCourse,
      name: dto.name,
      code: dto.code,
      state,
      description: dto.description,
    });
    return this.courseRepository.save(course);
  }

  findAll(): Promise<Course[]> {
    return this.courseRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Course> {
    const course = await this.courseRepository.findOne({
      where: { idCourse: id },
    });
    if (!course) {
      throw new NotFoundException(`Curso ${id} no encontrado`);
    }
    return course;
  }

  async update(id: string, dto: UpdateCourseDto): Promise<Course> {
    const course = await this.findOne(id);
    Object.assign(course, {
      name: dto.name ?? course.name,
      code: dto.code ?? course.code,
      description: dto.description ?? course.description,
      ...(dto.stateId !== undefined && {
        state: await this.resolveState(dto.stateId),
      }),
    });
    return this.courseRepository.save(course);
  }

  async remove(id: string): Promise<void> {
    const course = await this.findOne(id);
    await this.courseRepository.remove(course);
  }

  // Si no se indica un stateId, el curso se crea/actualiza como "Activo".
  private async resolveState(stateId?: number): Promise<State> {
    if (stateId !== undefined) {
      const state = await this.stateRepository.findOne({
        where: { idState: stateId },
      });
      if (!state) {
        throw new NotFoundException(`Estado ${stateId} no encontrado`);
      }
      return state;
    }

    const active = await this.stateRepository.findOne({
      where: { name: 'Activo', entity: 'course' },
    });
    if (!active) {
      throw new NotFoundException(
        'No existe un estado "Activo" para cursos en la tabla states',
      );
    }
    return active;
  }
}
