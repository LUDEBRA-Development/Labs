import { Injectable, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, LessThanOrEqual, Repository } from 'typeorm';
import { Task } from '../tasks/entities/task.entity';
import { UserTask } from '../user-tasks/entities/user-task.entity';
import {
  Notification,
  TASK_DEADLINE_NOTIFICATION,
} from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(UserTask)
    private readonly userTaskRepository: Repository<UserTask>,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleExpiredTasks(): Promise<void> {
    await this.createDeadlineNotifications();
  }

  async createDeadlineNotifications(now = new Date()): Promise<number> {
    const expiredTasks = await this.taskRepository.find({
      where: { expirationDate: LessThanOrEqual(now) },
    });

    let createdCount = 0;

    for (const task of expiredTasks) {
      const recipientEmail = task.createdById?.trim().toLowerCase();
      if (!recipientEmail || !task.expirationDate) continue;

      const existing = await this.notificationRepository.findOne({
        where: {
          taskId: task.idTask,
          recipientEmail,
          type: TASK_DEADLINE_NOTIFICATION,
          deadlineAt: task.expirationDate,
        },
      });

      if (existing) continue;

      const [deliveryCount, pendingQualificationCount] = await Promise.all([
        this.userTaskRepository.count({ where: { taskId: task.idTask } }),
        this.userTaskRepository.count({
          where: { taskId: task.idTask, qualification: IsNull() },
        }),
      ]);

      const notification = this.notificationRepository.create({
        recipientEmail,
        taskId: task.idTask,
        task,
        type: TASK_DEADLINE_NOTIFICATION,
        deadlineAt: task.expirationDate,
        title: `Finalizó la actividad: ${task.name}`,
        message: this.buildDeadlineMessage(
          task.name,
          deliveryCount,
          pendingQualificationCount,
        ),
        deliveryCount,
        pendingQualificationCount,
        readAt: null,
      });

      await this.notificationRepository.save(notification);
      createdCount += 1;
    }

    return createdCount;
  }

  findForRecipient(
    recipientEmail: string,
    onlyUnread?: boolean,
  ): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: {
        recipientEmail: recipientEmail.trim().toLowerCase(),
        ...(onlyUnread ? { readAt: IsNull() } : {}),
      },
      order: { createdAt: 'DESC' },
    });
  }

  async markAsRead(
    idNotification: number,
    recipientEmail: string,
    readAt = new Date(),
  ): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: {
        idNotification,
        recipientEmail: recipientEmail.trim().toLowerCase(),
      },
    });

    if (!notification) {
      throw new NotFoundException('Notificación no encontrada');
    }

    notification.readAt = readAt;
    return this.notificationRepository.save(notification);
  }

  private buildDeadlineMessage(
    taskName: string,
    deliveryCount: number,
    pendingQualificationCount: number,
  ): string {
    if (deliveryCount === 0) {
      return `La actividad "${taskName}" finalizó sin entregas.`;
    }

    if (pendingQualificationCount === 0) {
      return `La actividad "${taskName}" finalizó. Todas sus entregas ya fueron calificadas.`;
    }

    return `La actividad "${taskName}" finalizó con ${deliveryCount} entregas; ${pendingQualificationCount} están pendientes de calificar.`;
  }
}
