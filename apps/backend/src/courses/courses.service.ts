import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './entities/course.entity';
import { Period } from './entities/period.entity';
import { UserCourse } from './entities/user-course.entity';
import { State } from '../states/entities/state.entity';
import { User } from '../users/entities/user.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CreatePeriodDto } from './dto/create-period.dto';
import { UpdatePeriodDto } from './dto/update-period.dto';
import { Role } from '../auth/enums/role.enum';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(Period)
    private readonly periodRepository: Repository<Period>,
    @InjectRepository(UserCourse)
    private readonly userCourseRepository: Repository<UserCourse>,
    @InjectRepository(State)
    private readonly stateRepository: Repository<State>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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
      relations: { teacher: true },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Course> {
    const course = await this.courseRepository.findOne({
      where: { idCourse: id },
      relations: { teacher: true },
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

  // ---------------------------------------------------------------------
  // Docente responsable del curso
  // ---------------------------------------------------------------------
  async assignTeacher(courseId: string, userId: string): Promise<Course> {
    await this.findOne(courseId);
    const user = await this.findActiveUser(userId, Role.TEACHER, 'docente');
    await this.courseRepository.update(courseId, { teacher: user });
    return this.findOne(courseId);
  }

  async removeTeacher(courseId: string): Promise<Course> {
    await this.findOne(courseId);
    await this.courseRepository.update(courseId, { teacher: null });
    return this.findOne(courseId);
  }

  // ---------------------------------------------------------------------
  // Matrícula de estudiantes
  // ---------------------------------------------------------------------
  async listStudents(courseId: string): Promise<UserCourse[]> {
    await this.findOne(courseId);
    return this.userCourseRepository.find({
      where: { courseId },
      order: { enrollmentDate: 'ASC' },
    });
  }

  async enrollStudent(courseId: string, userId: string): Promise<UserCourse> {
    await this.findOne(courseId);
    await this.findActiveUser(userId, Role.STUDENT, 'estudiante');

    const existing = await this.userCourseRepository.findOne({
      where: { courseId, userId },
    });
    if (existing) {
      throw new ConflictException(
        `El estudiante ${userId} ya está matriculado en el curso ${courseId}`,
      );
    }

    const enrollment = this.userCourseRepository.create({ courseId, userId });
    return this.userCourseRepository.save(enrollment);
  }

  async unrollStudent(courseId: string, userId: string): Promise<void> {
    await this.findOne(courseId);
    const enrollment = await this.userCourseRepository.findOne({
      where: { courseId, userId },
    });
    if (!enrollment) {
      throw new NotFoundException(
        `El estudiante ${userId} no está matriculado en el curso ${courseId}`,
      );
    }
    await this.userCourseRepository.remove(enrollment);
  }

  // ---------------------------------------------------------------------
  // Períodos
  // ---------------------------------------------------------------------
  async listPeriods(courseId: string): Promise<Period[]> {
    await this.findOne(courseId);
    return this.periodRepository.find({
      where: { course: { idCourse: courseId } },
      order: { idPeriod: 'ASC' },
    });
  }

  async createPeriod(courseId: string, dto: CreatePeriodDto): Promise<Period> {
    await this.findOne(courseId);
    const period = this.periodRepository.create({
      course: { idCourse: courseId } as Course,
      name: dto.name,
      startDate: dto.startDate,
      endDate: dto.endDate,
    });
    return this.periodRepository.save(period);
  }

  async updatePeriod(
    periodId: number,
    dto: UpdatePeriodDto,
  ): Promise<Period> {
    const period = await this.periodRepository.findOne({
      where: { idPeriod: periodId },
    });
    if (!period) {
      throw new NotFoundException(`Período ${periodId} no encontrado`);
    }
    Object.assign(period, {
      name: dto.name ?? period.name,
      startDate: dto.startDate ?? period.startDate,
      endDate: dto.endDate ?? period.endDate,
    });
    return this.periodRepository.save(period);
  }

  async removePeriod(periodId: number): Promise<void> {
    const period = await this.periodRepository.findOne({
      where: { idPeriod: periodId },
    });
    if (!period) {
      throw new NotFoundException(`Período ${periodId} no encontrado`);
    }
    await this.periodRepository.remove(period);
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

  private async findActiveUser(
    userId: string,
    expectedRole: Role,
    label: string,
  ): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { idUser: userId },
    });
    if (!user) {
      throw new NotFoundException(`Usuario ${userId} no encontrado`);
    }
    if (user.role !== expectedRole) {
      throw new BadRequestException(
        `El usuario ${userId} no es ${label} (rol: ${user.role})`,
      );
    }
    if (!user.isActive) {
      throw new BadRequestException(`El usuario ${userId} está deshabilitado`);
    }
    return user;
  }
}
