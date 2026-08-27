import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { State } from '../../states/entities/state.entity';
import { User } from '../../users/entities/user.entity';
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

  // Docente responsable del curso (nullable: un curso puede no tener uno aún).
  @ManyToOne(() => User, { eager: false, nullable: true })
  @JoinColumn({ name: 'Id_teacher' })
  teacher?: User | null;

  @OneToMany(() => Period, (period) => period.course)
  periods?: Period[];

  @Column({ name: 'Description', length: 500, nullable: true })
  description!: string;
}
