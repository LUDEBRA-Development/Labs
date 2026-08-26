import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../tasks/entities/task.entity';
import { GradeTaskDto } from './dto/grade-task.dto';
import { SubmitTaskDto } from './dto/submit-task.dto';
import { UserTask } from './entities/user-task.entity';

@Injectable()
export class UserTasksService {
  constructor(
    @InjectRepository(UserTask)
    private readonly userTaskRepository: Repository<UserTask>,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  async submit(
    taskId: number,
    dto: SubmitTaskDto,
    deliveredAt = new Date(),
  ): Promise<UserTask> {
    const task = await this.findTask(taskId);

    if (task.expirationDate && deliveredAt > task.expirationDate) {
      throw new BadRequestException(
        `La tarea ${taskId} venció el ${task.expirationDate.toISOString()}`,
      );
    }

    const emailUser = this.normalizeEmail(dto.emailUser);
    const existing = await this.userTaskRepository.findOne({
      where: { emailUser, taskId },
    });

    if (existing) {
      throw new ConflictException('El estudiante ya entregó esta tarea');
    }

    const delivery = this.userTaskRepository.create({
      emailUser,
      taskId,
      task,
      deliveryDate: deliveredAt,
      qualification: null,
      qualificationDate: null,
      feedbackComment: null,
      comment: dto.comment?.trim() || null,
    });

    return this.userTaskRepository.save(delivery);
  }

  async grade(
    taskId: number,
    emailUser: string,
    dto: GradeTaskDto,
    qualifiedAt = new Date(),
  ): Promise<UserTask> {
    const delivery = await this.userTaskRepository.findOne({
      where: {
        taskId,
        emailUser: this.normalizeEmail(emailUser),
      },
    });

    if (!delivery?.deliveryDate) {
      throw new BadRequestException(
        'No se puede calificar una actividad que no fue entregada',
      );
    }

    const maxScore = Number(delivery.task.maxScore);
    if (dto.qualification > maxScore) {
      throw new BadRequestException(
        `La calificación no puede superar el puntaje máximo (${maxScore})`,
      );
    }

    delivery.qualification = dto.qualification;
    delivery.qualificationDate = qualifiedAt;
    delivery.feedbackComment = dto.feedbackComment.trim();

    return this.userTaskRepository.save(delivery);
  }

  findHistory(emailUser: string): Promise<UserTask[]> {
    return this.userTaskRepository.find({
      where: { emailUser: this.normalizeEmail(emailUser) },
      order: { deliveryDate: 'DESC' },
    });
  }

  async findByTask(taskId: number): Promise<UserTask[]> {
    await this.findTask(taskId);
    return this.userTaskRepository.find({
      where: { taskId },
      order: { deliveryDate: 'ASC' },
    });
  }

  async findOne(taskId: number, emailUser: string): Promise<UserTask> {
    const delivery = await this.userTaskRepository.findOne({
      where: {
        taskId,
        emailUser: this.normalizeEmail(emailUser),
      },
    });

    if (!delivery) {
      throw new NotFoundException('Entrega no encontrada');
    }

    return delivery;
  }

  private async findTask(taskId: number): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { idTask: taskId },
    });

    if (!task) {
      throw new NotFoundException(`Tarea ${taskId} no encontrada`);
    }

    return task;
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }
}
