import { Task } from '../../tasks/entities/task.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity('User_tasks')
export class UserTask {
  @PrimaryColumn({ name: 'email_User', type: 'varchar', length: 255 })
  emailUser!: string;

  @PrimaryColumn({ name: 'Id_task', type: 'int' })
  taskId!: number;

  @ManyToOne(() => Task, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'Id_task', referencedColumnName: 'idTask' })
  task!: Task;

  @Column({
    name: 'Qualification',
    type: 'decimal',
    precision: 4,
    scale: 2,
    nullable: true,
  })
  qualification!: number | null;

  @Column({ name: 'Delivery_date', type: 'datetime' })
  deliveryDate!: Date;

  @Column({ name: 'Qualification_date', type: 'datetime', nullable: true })
  qualificationDate!: Date | null;

  @Column({ name: 'Feedback_comment', type: 'text', nullable: true })
  feedbackComment!: string | null;

  @Column({ name: 'Comment', type: 'text', nullable: true })
  comment!: string | null;
}
