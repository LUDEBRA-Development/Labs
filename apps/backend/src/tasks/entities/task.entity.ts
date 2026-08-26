import { Simulator } from "src/simulators/entities/simulator.entity";
import { State } from "src/states/entities/state.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn({ name: 'Id_task' })
  idTask!: number;

  @Column({ name: 'Name', length: 100 })
  name!: string;

  @Column({ name: 'Descriptions', length: 500, nullable: true })
  descriptions! : string;

  @CreateDateColumn({ name: 'Creation_date' })
  creationDate!: Date;

  @Column({ name: 'Expiration_date', type: 'datetime', nullable: true })
  expirationDate!: Date;

  @Column({ name: 'Max_score', type: 'decimal', precision: 4, scale: 2, default: 5.0 })
  maxScore!: number;

  // @ManyToOne(() => Period) period: Period;
  // Mientras el módulo de Period no exista
  @Column({ name: 'Id_period' })
  periodId!: number;

  // @ManyToOne(() => User) createdBy: User;
  // Mientras el módulo de User no exista
  @Column({ name: 'created_by' })
  createdById!: string;


  @ManyToOne(() => State, { eager: false })
  @JoinColumn({ name: 'Id_state' })
  state!: State;

  // Relación muchos a muchos: una tarea puede habilitar varios simuladores,
  // y un simulador puede usarse en varias tareas.
  // TypeORM crea/gestiona la tabla puente `task_simulators` automáticamente.
  @ManyToMany(() => Simulator, { eager: true })
  @JoinTable({
    name: 'task_simulators',
    joinColumn: { name: 'Id_task', referencedColumnName: 'idTask' },
    inverseJoinColumn: { name: 'Id_simulador', referencedColumnName: 'idSimulador' },
  })
  simulators!: Simulator[];

  // --- Métodos de dominio ---
  isExpired(): boolean {
    return this.expirationDate ? new Date() > this.expirationDate : false;
  }


  hasSimulators(): boolean {
    return this.simulators?.length > 0;
  }
}
