/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return */
import { Repository } from 'typeorm';
import { Task } from '../tasks/entities/task.entity';
import { UserTask } from '../user-tasks/entities/user-task.entity';
import { Notification } from './entities/notification.entity';
import { NotificationsService } from './notifications.service';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let notificationRepository: {
    findOne: jest.Mock;
    find: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };
  let taskRepository: { find: jest.Mock };
  let userTaskRepository: { count: jest.Mock };

  const expiredTask = {
    idTask: 10,
    name: 'Circuitos en serie',
    expirationDate: new Date('2026-08-25T23:59:59.000Z'),
    createdById: 'Docente@Ejemplo.com',
  } as Task;

  beforeEach(() => {
    notificationRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn((value) => value),
      save: jest.fn((value) => Promise.resolve(value)),
    };
    taskRepository = { find: jest.fn() };
    userTaskRepository = { count: jest.fn() };

    service = new NotificationsService(
      notificationRepository as unknown as Repository<Notification>,
      taskRepository as unknown as Repository<Task>,
      userTaskRepository as unknown as Repository<UserTask>,
    );
  });

  it('crea un recordatorio al finalizar una actividad', async () => {
    taskRepository.find.mockResolvedValue([expiredTask]);
    notificationRepository.findOne.mockResolvedValue(null);
    userTaskRepository.count.mockResolvedValueOnce(4).mockResolvedValueOnce(3);

    const created = await service.createDeadlineNotifications(
      new Date('2026-08-26T00:01:00.000Z'),
    );

    expect(created).toBe(1);
    expect(notificationRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        recipientEmail: 'docente@ejemplo.com',
        taskId: expiredTask.idTask,
        deliveryCount: 4,
        pendingQualificationCount: 3,
        message: expect.stringContaining('3 están pendientes de calificar'),
      }),
    );
  });

  it('no duplica un recordatorio ya creado', async () => {
    taskRepository.find.mockResolvedValue([expiredTask]);
    notificationRepository.findOne.mockResolvedValue({ idNotification: 1 });

    const created = await service.createDeadlineNotifications();

    expect(created).toBe(0);
    expect(userTaskRepository.count).not.toHaveBeenCalled();
    expect(notificationRepository.save).not.toHaveBeenCalled();
  });

  it('informa al docente cuando la actividad finaliza sin entregas', async () => {
    taskRepository.find.mockResolvedValue([expiredTask]);
    notificationRepository.findOne.mockResolvedValue(null);
    userTaskRepository.count.mockResolvedValue(0);

    await service.createDeadlineNotifications();

    expect(notificationRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        deliveryCount: 0,
        pendingQualificationCount: 0,
        message: expect.stringContaining('finalizó sin entregas'),
      }),
    );
  });
});
