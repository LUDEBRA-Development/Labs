import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateEvaluationTracking1787702400000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'User_tasks',
        columns: [
          {
            name: 'email_User',
            type: 'varchar',
            length: '255',
            isPrimary: true,
          },
          {
            name: 'Id_task',
            type: 'int',
            isPrimary: true,
          },
          {
            name: 'Qualification',
            type: 'decimal',
            precision: 4,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'Delivery_date',
            type: 'datetime',
          },
          {
            name: 'Qualification_date',
            type: 'datetime',
            isNullable: true,
          },
          {
            name: 'Feedback_comment',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'Comment',
            type: 'text',
            isNullable: true,
          },
        ],
        foreignKeys: [
          {
            name: 'FK_user_tasks_task',
            columnNames: ['Id_task'],
            referencedTableName: 'tasks',
            referencedColumnNames: ['Id_task'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'notifications',
        columns: [
          {
            name: 'Id_notification',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'Recipient_email',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'Id_task',
            type: 'int',
          },
          {
            name: 'Type',
            type: 'varchar',
            length: '50',
          },
          {
            name: 'Deadline_at',
            type: 'datetime',
          },
          {
            name: 'Title',
            type: 'varchar',
            length: '150',
          },
          {
            name: 'Message',
            type: 'varchar',
            length: '500',
          },
          {
            name: 'Delivery_count',
            type: 'int',
            default: 0,
          },
          {
            name: 'Pending_qualification_count',
            type: 'int',
            default: 0,
          },
          {
            name: 'Created_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'Read_at',
            type: 'datetime',
            isNullable: true,
          },
        ],
        uniques: [
          {
            name: 'UQ_notification_task_recipient_type',
            columnNames: ['Id_task', 'Recipient_email', 'Type', 'Deadline_at'],
          },
        ],
        foreignKeys: [
          {
            name: 'FK_notifications_task',
            columnNames: ['Id_task'],
            referencedTableName: 'tasks',
            referencedColumnNames: ['Id_task'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('notifications', true);
    await queryRunner.dropTable('User_tasks', true);
  }
}
