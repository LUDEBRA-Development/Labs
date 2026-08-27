import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

export enum EvaluationStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
}

/**
 * Estado auxiliar de la evaluación. `User_tasks` continúa siendo la fuente
 * oficial de la nota publicada; esta tabla permite conservar borradores y la
 * selección de criterios sin marcar prematuramente una entrega como calificada.
 */
@Entity('User_task_evaluations')
export class UserTaskEvaluation {
  @PrimaryColumn({ name: 'email_User', type: 'varchar', length: 100 })
  emailUser!: string;

  @PrimaryColumn({ name: 'Id_task', type: 'int' })
  idTask!: number;

  @Column({
    name: 'Draft_qualification',
    type: 'decimal',
    precision: 4,
    scale: 2,
    nullable: true,
  })
  draftQualification!: number | null;

  @Column({
    name: 'Draft_feedback',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  draftFeedback!: string | null;

  @Column({ name: 'Selected_criteria', type: 'json', nullable: true })
  selectedCriteria!: string[] | null;

  @Column({ name: 'Status', type: 'varchar', length: 10 })
  status!: EvaluationStatus;

  @Column({ name: 'Teacher_email', type: 'varchar', length: 100 })
  teacherEmail!: string;

  @UpdateDateColumn({ name: 'Updated_at', type: 'datetime' })
  updatedAt!: Date;
}
