import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('courses')
export class Course {
  @PrimaryColumn({ name: 'Id_course', length: 8 })
  idCourse!: string;

  @Column({ name: 'Name', length: 100 })
  name!: string;

  @Column({ name: 'Code', length: 13 })
  code!: string;

  @Column({ name: 'Description', length: 500, nullable: true })
  description!: string;
}
