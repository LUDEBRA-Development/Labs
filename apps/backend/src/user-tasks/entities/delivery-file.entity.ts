import { Column, Entity, PrimaryColumn } from 'typeorm';

/** Archivo que un estudiante adjunta a la entrega de una tarea. */
@Entity('files')
export class DeliveryFile {
  @PrimaryColumn({ name: 'Id_file', type: 'varchar', length: 100 })
  idFile!: string;

  @Column({ name: 'Url_file', type: 'varchar', length: 500 })
  urlFile!: string;

  @Column({ name: 'email_User', type: 'varchar', length: 100 })
  emailUser!: string;

  @Column({ name: 'Id_task', type: 'int' })
  idTask!: number;

  @Column({ name: 'File_name', type: 'varchar', length: 255 })
  fileName!: string;

  @Column({ name: 'File_type', type: 'varchar', length: 20, nullable: true })
  fileType!: string | null;

  @Column({
    name: 'Upload_date',
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
  })
  uploadDate!: Date;
}
