import { Task } from '../../tasks/entities/task.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

export const TASK_DEADLINE_NOTIFICATION = 'TASK_DEADLINE';

@Entity('notifications')
@Unique('UQ_notification_task_recipient_type', [
  'taskId',
  'recipientEmail',
  'type',
  'deadlineAt',
])
export class Notification {
  @PrimaryGeneratedColumn({ name: 'Id_notification' })
  idNotification!: number;

  @Column({ name: 'Recipient_email', type: 'varchar', length: 255 })
  recipientEmail!: string;

  @Column({ name: 'Id_task', type: 'int' })
  taskId!: number;

  @ManyToOne(() => Task, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'Id_task', referencedColumnName: 'idTask' })
  task!: Task;

  @Column({ name: 'Type', type: 'varchar', length: 50 })
  type!: string;

  @Column({ name: 'Deadline_at', type: 'datetime' })
  deadlineAt!: Date;

  @Column({ name: 'Title', type: 'varchar', length: 150 })
  title!: string;

  @Column({ name: 'Message', type: 'varchar', length: 500 })
  message!: string;

  @Column({ name: 'Delivery_count', type: 'int', default: 0 })
  deliveryCount!: number;

  @Column({ name: 'Pending_qualification_count', type: 'int', default: 0 })
  pendingQualificationCount!: number;

  @CreateDateColumn({ name: 'Created_at' })
  createdAt!: Date;

  @Column({ name: 'Read_at', type: 'datetime', nullable: true })
  readAt!: Date | null;
}
