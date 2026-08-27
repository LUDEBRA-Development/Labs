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

// Matrícula de usuarios en cursos; el rol distingue docentes de estudiantes.
@Entity('Users_courses')
export class UserCourse {
  @PrimaryColumn({ name: 'Email_User', type: 'varchar', length: 100 })
  userId!: string;

  @PrimaryColumn({ name: 'Id_course', type: 'varchar', length: 8 })
  courseId!: string;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'Email_User', referencedColumnName: 'email' })
  user!: User;

  @ManyToOne(() => Course, { eager: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'Id_course', referencedColumnName: 'idCourse' })
  course!: Course;

  @CreateDateColumn({ name: 'Enrollment_date' })
  enrollmentDate!: Date;
}
