import { Task } from '../../tasks/entities/task.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity('User_tasks')
export class UserTask {
  @PrimaryColumn({ name: 'email_User', type: 'varchar', length: 100 })
  emailUser!: string;

  @PrimaryColumn({ name: 'Id_task', type: 'int' })
  idTask!: number;

  @ManyToOne(() => Task, { eager: true })
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

  @Column({ name: 'Delivery_date', type: 'datetime', nullable: true })
  deliveryDate!: Date | null;

  @Column({ name: 'Qualification_date', type: 'datetime', nullable: true })
  qualificationDate!: Date | null;

  @Column({
    name: 'Feedback_comments',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  feedbackComments!: string | null;

  @Column({ name: 'Comment', type: 'varchar', length: 500, nullable: true })
  comment!: string | null;
}
