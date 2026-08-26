/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Task } from '../tasks/entities/task.entity';
import { UserTask } from './entities/user-task.entity';
import { UserTasksService } from './user-tasks.service';

describe('UserTasksService', () => {
  let service: UserTasksService;
  let userTaskRepository: {
    findOne: jest.Mock;
    find: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };
  let taskRepository: { findOne: jest.Mock };

  const task = {
    idTask: 7,
    name: 'Capacitancia',
    expirationDate: new Date('2026-09-01T23:59:59.000Z'),
    maxScore: 5,
  } as Task;

  beforeEach(() => {
    userTaskRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn((value) => value),
      save: jest.fn((value) => Promise.resolve(value)),
    };
    taskRepository = { findOne: jest.fn() };

    service = new UserTasksService(
      userTaskRepository as unknown as Repository<UserTask>,
      taskRepository as unknown as Repository<Task>,
    );
  });

  it('registra una entrega antes de la fecha límite', async () => {
    taskRepository.findOne.mockResolvedValue(task);
    userTaskRepository.findOne.mockResolvedValue(null);
    const deliveredAt = new Date('2026-09-01T20:00:00.000Z');

    const result = await service.submit(
      task.idTask,
      { emailUser: ' Estudiante@Ejemplo.com ', comment: 'Mi entrega' },
      deliveredAt,
    );

    expect(result.emailUser).toBe('estudiante@ejemplo.com');
    expect(result.deliveryDate).toEqual(deliveredAt);
    expect(result.qualification).toBeNull();
    expect(userTaskRepository.save).toHaveBeenCalledTimes(1);
  });

  it('rechaza una entrega después de la fecha límite', async () => {
    taskRepository.findOne.mockResolvedValue(task);

    await expect(
      service.submit(
        task.idTask,
        { emailUser: 'estudiante@ejemplo.com' },
        new Date('2026-09-02T00:00:00.000Z'),
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(userTaskRepository.save).not.toHaveBeenCalled();
  });

  it('rechaza una segunda entrega de la misma actividad', async () => {
    taskRepository.findOne.mockResolvedValue(task);
    userTaskRepository.findOne.mockResolvedValue({
      emailUser: 'estudiante@ejemplo.com',
      taskId: task.idTask,
    });

    await expect(
      service.submit(
        task.idTask,
        { emailUser: 'estudiante@ejemplo.com' },
        new Date('2026-09-01T20:00:00.000Z'),
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rechaza una calificación cuando no existe una entrega', async () => {
    userTaskRepository.findOne.mockResolvedValue(null);

    await expect(
      service.grade(task.idTask, 'estudiante@ejemplo.com', {
        qualification: 4.5,
        feedbackComment: 'Buen trabajo',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rechaza una calificación superior al puntaje máximo', async () => {
    userTaskRepository.findOne.mockResolvedValue({
      emailUser: 'estudiante@ejemplo.com',
      taskId: task.idTask,
      task,
      deliveryDate: new Date(),
    });

    await expect(
      service.grade(task.idTask, 'estudiante@ejemplo.com', {
        qualification: 5.1,
        feedbackComment: 'Revisar el cálculo',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('registra la calificación, fecha y retroalimentación', async () => {
    const delivery = {
      emailUser: 'estudiante@ejemplo.com',
      taskId: task.idTask,
      task,
      deliveryDate: new Date('2026-09-01T20:00:00.000Z'),
      qualification: null,
      qualificationDate: null,
      feedbackComment: null,
    } as UserTask;
    userTaskRepository.findOne.mockResolvedValue(delivery);
    const qualifiedAt = new Date('2026-09-02T14:30:00.000Z');

    const result = await service.grade(
      task.idTask,
      delivery.emailUser,
      { qualification: 4.8, feedbackComment: ' Excelente análisis. ' },
      qualifiedAt,
    );

    expect(result.qualification).toBe(4.8);
    expect(result.qualificationDate).toEqual(qualifiedAt);
    expect(result.feedbackComment).toBe('Excelente análisis.');
    expect(userTaskRepository.save).toHaveBeenCalledWith(delivery);
  });

  it('informa cuando la tarea no existe', async () => {
    taskRepository.findOne.mockResolvedValue(null);

    await expect(
      service.submit(999, { emailUser: 'estudiante@ejemplo.com' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
