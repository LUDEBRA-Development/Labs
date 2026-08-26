import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('states')
export class State {
  @PrimaryGeneratedColumn({ name: 'Id_state' })
  idState?: number;

  @Column({ name: 'Name', length: 30 })
  name?: string;

  // 'course' o 'task' -> indica a qué entidad aplica este estado
  @Column({ name: 'Entity', length: 30 })
  entity?: string;

  @Column({ name: 'Code', length: 10, nullable: true })
  code?: string;
}