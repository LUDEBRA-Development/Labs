import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { State } from '../../states/entities/state.entity';

@Entity('courses')
export class Course {
  @PrimaryColumn({ name: 'Id_course', length: 8 })
  idCourse!: string;

  @Column({ name: 'Name', length: 100 })
  name!: string;

  @Column({ name: 'Code', length: 13 })
  code!: string;

  @ManyToOne(() => State, { eager: false })
  @JoinColumn({ name: 'Id_state' })
  state!: State;

  @Column({ name: 'Description', length: 500, nullable: true })
  description!: string;
}
