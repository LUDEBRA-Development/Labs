import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('simulator')
export class Simulator {
  @PrimaryGeneratedColumn({ name: 'Id_simulador' })
  idSimulador!: number;

  @Column({ name: 'Name', length: 100 })
  name!: string;

  @Column({ name: 'Url', length: 255, nullable: true })
  url!: string;

  @Column({ name: 'Description', length: 500, nullable: true })
  description!: string;

  @Column({ name: 'Status', type: 'tinyint', default: 1 })
  status!: boolean;
}
