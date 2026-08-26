import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn({ name: 'Id_course' })
  idCourse!: number;

  @Column({ name: 'Name', length: 100 })
  name!: string;

  @Column({ name: 'Code', length: 20 })
  code!: string;

  @Column({ name: 'Description', length: 500, nullable: true })
  description!: string;
}
