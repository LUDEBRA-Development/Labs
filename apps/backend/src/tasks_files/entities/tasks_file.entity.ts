import { Task } from 'src/tasks/entities/task.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('task_files')
export class TaskFile {
  @PrimaryGeneratedColumn({ name: 'Id_task_file' })
  idTaskFile?: number;

  @Column({ name: 'Id_task' })
  idTask?: number;

  @Column({ name: 'Url_file', length: 500 })
  urlFile?: string;

  @Column({ name: 'File_name', length: 255 })
  fileName?: string;

  @Column({ name: 'File_type', length: 20, nullable: true })
  fileType?: string;

  @Column({
    name: 'Upload_date',
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
  })
  uploadDate?: Date;

  @ManyToOne(() => Task, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'Id_task' })
  task?: Task;
}