import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { State } from '../../states/entities/state.entity';
import { Period } from './period.entity';

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

  // Se resuelve desde Users_courses; el diseño original no tiene Id_teacher.
  teacher?: import('../../users/entities/user.entity').User | null;

  @OneToMany(() => Period, (period) => period.course)
  periods?: Period[];

  @Column({ name: 'Description', length: 500, nullable: true })
  description!: string;
}
