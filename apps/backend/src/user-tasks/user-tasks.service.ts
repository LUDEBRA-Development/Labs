import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import { Task } from '../tasks/entities/task.entity';
import { CreateUserTaskDto } from './dto/create-user-task.dto';
import { ListUserTasksDto } from './dto/list-user-tasks.dto';
import { QualifyUserTaskDto } from './dto/qualify-user-task.dto';
import { UserTask } from './entities/user-task.entity';
import { DeliveryFile } from './entities/delivery-file.entity';

@Injectable()
export class UserTasksService {
  constructor(
    @InjectRepository(UserTask)
    private readonly userTaskRepository: Repository<UserTask>,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(DeliveryFile)
    private readonly deliveryFileRepository: Repository<DeliveryFile>,
  ) {}

  async create(
    dto: CreateUserTaskDto,
    deliveredAt = new Date(),
  ): Promise<UserTask> {
    const task = await this.findTask(dto.idTask);

    if (task.expirationDate && deliveredAt > task.expirationDate) {
      throw new BadRequestException(
        `La tarea ${dto.idTask} venció el ${task.expirationDate.toISOString()}`,
      );
    }

    const emailUser = this.normalizeEmail(dto.emailUser);
    const existing = await this.userTaskRepository.findOne({
      where: { emailUser, idTask: dto.idTask },
    });

    if (existing) {
      throw new ConflictException('El estudiante ya entregó esta tarea');
    }

    const delivery = this.userTaskRepository.create({
      emailUser,
      idTask: dto.idTask,
      task,
      deliveryDate: deliveredAt,
      qualification: null,
      qualificationDate: null,
      feedbackComments: null,
      comment: dto.comment?.trim() || null,
    });

    return this.userTaskRepository.save(delivery);
  }

  async submit(
    dto: CreateUserTaskDto,
    file: Express.Multer.File | undefined,
  ): Promise<UserTask> {
    if (!file) {
      throw new BadRequestException('Debes adjuntar el informe de la tarea');
    }

    const allowedExtensions = new Set(['.pdf', '.doc', '.docx']);
    const extension = extname(file.originalname).toLowerCase();
    if (!allowedExtensions.has(extension)) {
      throw new BadRequestException('Solo se permiten archivos PDF, DOC o DOCX');
    }

    const delivery = await this.create(dto);
    await this.deliveryFileRepository.save(
      this.deliveryFileRepository.create({
        idFile: randomUUID(),
        urlFile: `/uploads/deliveries/${file.filename}`,
        emailUser: delivery.emailUser,
        idTask: delivery.idTask,
        fileName: file.originalname,
        fileType: extension.slice(1),
      }),
    );
    return delivery;
  }

  async qualify(
    idTask: number,
    emailUser: string,
    dto: QualifyUserTaskDto,
    qualifiedAt = new Date(),
  ): Promise<UserTask> {
    const delivery = await this.userTaskRepository.findOne({
      where: {
        idTask,
        emailUser: this.normalizeEmail(emailUser),
      },
    });

    if (!delivery?.deliveryDate) {
      throw new NotFoundException(
        'No existe una entrega registrada para calificar',
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
    delivery.feedbackComments = dto.feedbackComments.trim();

    return this.userTaskRepository.save(delivery);
  }

  async findAll(query: ListUserTasksDto): Promise<UserTask[]> {
    if (query.taskId === undefined && !query.email) {
      throw new BadRequestException(
        'Debe proporcionar taskId o email para consultar las entregas',
      );
    }

    if (query.taskId !== undefined) {
      await this.findTask(query.taskId);
    }

    const where: FindOptionsWhere<UserTask> = {
      ...(query.taskId !== undefined ? { idTask: query.taskId } : {}),
      ...(query.email ? { emailUser: this.normalizeEmail(query.email) } : {}),
    };

    return this.userTaskRepository.find({
      where,
      order: { deliveryDate: 'DESC' },
    });
  }

  private async findTask(idTask: number): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { idTask },
    });

    if (!task) {
      throw new NotFoundException(`Tarea ${idTask} no encontrada`);
    }

    return task;
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }
}
