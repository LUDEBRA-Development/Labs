import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { Task } from '../../tasks/entities/task.entity';

export interface RubricCriterion {
  id: string;
  label: string;
}

/**
 * Configuración de evaluación propiedad del Módulo 4.
 *
 * Mantiene el código de búsqueda y la rúbrica fuera de `tasks`, de modo que
 * Evaluación y Seguimiento no modifica la tabla administrada por otro módulo.
 */
@Entity('Task_evaluation_config')
export class TaskEvaluationConfig {
  @PrimaryColumn({ name: 'Id_task', type: 'int' })
  idTask!: number;

  @OneToOne(() => Task, { eager: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'Id_task', referencedColumnName: 'idTask' })
  task!: Task;

  @Column({ name: 'Activity_code', type: 'varchar', length: 30, unique: true })
  activityCode!: string;

  @Column({ name: 'Rubric_criteria', type: 'json' })
  rubricCriteria!: RubricCriterion[];
}
