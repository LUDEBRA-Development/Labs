import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Course } from './course.entity';

@Entity('periods')
export class Period {
  @PrimaryGeneratedColumn({ name: 'Id_period' })
  idPeriod!: number;

  @ManyToOne(() => Course, (course) => course.periods, {
    eager: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'Id_course' })
  course!: Course;

  @Column({ name: 'Name', length: 30 })
  name!: string;

  @Column({ name: 'Start_date', type: 'date', nullable: true })
  startDate?: string | null;

  @Column({ name: 'End_date', type: 'date', nullable: true })
  endDate?: string | null;
}
