import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Course } from './course.entity';

// Matrícula de un estudiante en un curso (relación N:N).
// Clave compuesta natural (Id_user, Id_course), mismo patrón que User_tasks.
@Entity('users_courses')
export class UserCourse {
  @PrimaryColumn({ name: 'Id_user', type: 'char', length: 36 })
  userId!: string;

  @PrimaryColumn({ name: 'Id_course', type: 'varchar', length: 8 })
  courseId!: string;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'Id_user', referencedColumnName: 'idUser' })
  user!: User;

  @ManyToOne(() => Course, { eager: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'Id_course', referencedColumnName: 'idCourse' })
  course!: Course;

  @CreateDateColumn({ name: 'Enrollment_date' })
  enrollmentDate!: Date;
}
