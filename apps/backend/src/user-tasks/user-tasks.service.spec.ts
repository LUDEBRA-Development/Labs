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

    const result = await service.create(
      {
        emailUser: ' Estudiante@Ejemplo.com ',
        idTask: task.idTask,
        comment: 'Mi entrega',
      },
      deliveredAt,
    );

    expect(result.emailUser).toBe('estudiante@ejemplo.com');
    expect(result.idTask).toBe(task.idTask);
    expect(result.deliveryDate).toEqual(deliveredAt);
    expect(result.qualification).toBeNull();
    expect(userTaskRepository.save).toHaveBeenCalledTimes(1);
  });

  it('rechaza una entrega después de la fecha límite', async () => {
    taskRepository.findOne.mockResolvedValue(task);

    await expect(
      service.create(
        { emailUser: 'estudiante@ejemplo.com', idTask: task.idTask },
        new Date('2026-09-02T00:00:00.000Z'),
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(userTaskRepository.save).not.toHaveBeenCalled();
  });

  it('rechaza una segunda entrega de la misma actividad', async () => {
    taskRepository.findOne.mockResolvedValue(task);
    userTaskRepository.findOne.mockResolvedValue({
      emailUser: 'estudiante@ejemplo.com',
      idTask: task.idTask,
    });

    await expect(
      service.create(
        { emailUser: 'estudiante@ejemplo.com', idTask: task.idTask },
        new Date('2026-09-01T20:00:00.000Z'),
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rechaza una calificación cuando no existe una entrega', async () => {
    userTaskRepository.findOne.mockResolvedValue(null);

    await expect(
      service.qualify(task.idTask, 'estudiante@ejemplo.com', {
        qualification: 4.5,
        feedbackComments: 'Buen trabajo',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rechaza una calificación cuando el registro no tiene fecha de entrega', async () => {
    userTaskRepository.findOne.mockResolvedValue({
      emailUser: 'estudiante@ejemplo.com',
      idTask: task.idTask,
      deliveryDate: null,
    });

    await expect(
      service.qualify(task.idTask, 'estudiante@ejemplo.com', {
        qualification: 4.5,
        feedbackComments: 'Buen trabajo',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rechaza una calificación superior al puntaje máximo', async () => {
    userTaskRepository.findOne.mockResolvedValue({
      emailUser: 'estudiante@ejemplo.com',
      idTask: task.idTask,
      task,
      deliveryDate: new Date(),
    });

    await expect(
      service.qualify(task.idTask, 'estudiante@ejemplo.com', {
        qualification: 5.1,
        feedbackComments: 'Revisar el cálculo',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('registra la calificación, fecha y retroalimentación', async () => {
    const delivery = {
      emailUser: 'estudiante@ejemplo.com',
      idTask: task.idTask,
      task,
      deliveryDate: new Date('2026-09-01T20:00:00.000Z'),
      qualification: null,
      qualificationDate: null,
      feedbackComments: null,
    } as UserTask;
    userTaskRepository.findOne.mockResolvedValue(delivery);
    const qualifiedAt = new Date('2026-09-02T14:30:00.000Z');

    const result = await service.qualify(
      task.idTask,
      delivery.emailUser,
      { qualification: 4.8, feedbackComments: ' Excelente análisis. ' },
      qualifiedAt,
    );

    expect(result.qualification).toBe(4.8);
    expect(result.qualificationDate).toEqual(qualifiedAt);
    expect(result.feedbackComments).toBe('Excelente análisis.');
    expect(userTaskRepository.save).toHaveBeenCalledWith(delivery);
  });

  it('exige al menos un filtro para consultar el historial', async () => {
    await expect(service.findAll({})).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('consulta las entregas de una actividad', async () => {
    taskRepository.findOne.mockResolvedValue(task);
    userTaskRepository.find.mockResolvedValue([]);

    await service.findAll({ taskId: task.idTask });

    expect(userTaskRepository.find).toHaveBeenCalledWith({
      where: { idTask: task.idTask },
      order: { deliveryDate: 'DESC' },
    });
  });

  it('consulta el historial normalizando el correo', async () => {
    userTaskRepository.find.mockResolvedValue([]);

    await service.findAll({ email: ' Estudiante@Ejemplo.com ' });

    expect(userTaskRepository.find).toHaveBeenCalledWith({
      where: { emailUser: 'estudiante@ejemplo.com' },
      order: { deliveryDate: 'DESC' },
    });
  });

  it('informa cuando la tarea no existe', async () => {
    taskRepository.findOne.mockResolvedValue(null);

    await expect(
      service.create({ emailUser: 'estudiante@ejemplo.com', idTask: 999 }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
