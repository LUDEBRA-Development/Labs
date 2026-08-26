import { getMetadataArgsStorage } from 'typeorm';
import { UserTask } from './user-task.entity';

describe('UserTask entity', () => {
  const storage = getMetadataArgsStorage();
  const columns = storage.columns.filter(
    (column) => column.target === UserTask,
  );

  function column(propertyName: string) {
    const metadata = columns.find(
      (candidate) => candidate.propertyName === propertyName,
    );
    expect(metadata).toBeDefined();
    return metadata!;
  }

  it('representa exactamente la tabla User_tasks existente', () => {
    const table = storage.tables.find(
      (candidate) => candidate.target === UserTask,
    );

    expect(table?.name).toBe('User_tasks');
    expect(column('emailUser').options).toMatchObject({
      name: 'email_User',
      type: 'varchar',
      length: 100,
      primary: true,
    });
    expect(column('idTask').options).toMatchObject({
      name: 'Id_task',
      type: 'int',
      primary: true,
    });
    expect(column('qualification').options).toMatchObject({
      name: 'Qualification',
      type: 'decimal',
      precision: 4,
      scale: 2,
      nullable: true,
    });
    expect(column('deliveryDate').options).toMatchObject({
      name: 'Delivery_date',
      type: 'datetime',
      nullable: true,
    });
    expect(column('qualificationDate').options).toMatchObject({
      name: 'Qualification_date',
      type: 'datetime',
      nullable: true,
    });
    expect(column('feedbackComments').options).toMatchObject({
      name: 'Feedback_comments',
      type: 'varchar',
      length: 500,
      nullable: true,
    });
    expect(column('comment').options).toMatchObject({
      name: 'Comment',
      type: 'varchar',
      length: 500,
      nullable: true,
    });
  });
});
