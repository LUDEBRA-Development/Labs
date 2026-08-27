import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../auth/enums/role.enum';
import { Course } from '../courses/entities/course.entity';
import { Period } from '../courses/entities/period.entity';
import { UserCourse } from '../courses/entities/user-course.entity';
import { Task } from '../tasks/entities/task.entity';
import { User } from '../users/entities/user.entity';
import { QualifyUserTaskDto } from './dto/qualify-user-task.dto';
import { SaveEvaluationDraftDto } from './dto/save-evaluation-draft.dto';
import { DeliveryFile } from './entities/delivery-file.entity';
import {
  RubricCriterion,
  TaskEvaluationConfig,
} from './entities/task-evaluation-config.entity';
import {
  EvaluationStatus,
  UserTaskEvaluation,
} from './entities/user-task-evaluation.entity';
import { UserTask } from './entities/user-task.entity';
import { UserTasksService } from './user-tasks.service';

const DEFAULT_RUBRIC: RubricCriterion[] = [
  {
    id: 'theoretical-calculations',
    label: 'Precisión en cálculos teóricos',
  },
  { id: 'si-units', label: 'Correcto uso de unidades SI' },
  { id: 'charts-and-tables', label: 'Calidad de gráficas y tablas' },
];

interface TaskContext {
  task: Task;
  period: Period;
  course: Course;
  config: TaskEvaluationConfig;
}

@Injectable()
export class TeacherEvaluationService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(Period)
    private readonly periodRepository: Repository<Period>,
    @InjectRepository(UserCourse)
    private readonly userCourseRepository: Repository<UserCourse>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserTask)
    private readonly userTaskRepository: Repository<UserTask>,
    @InjectRepository(DeliveryFile)
    private readonly deliveryFileRepository: Repository<DeliveryFile>,
    @InjectRepository(TaskEvaluationConfig)
    private readonly configRepository: Repository<TaskEvaluationConfig>,
    @InjectRepository(UserTaskEvaluation)
    private readonly evaluationRepository: Repository<UserTaskEvaluation>,
    private readonly userTasksService: UserTasksService,
  ) {}

  async getFollowUp(activityCode: string, teacher: User) {
    const context = await this.findTaskByActivityCode(activityCode);
    this.assertTeacherOwnsTask(context.task, teacher);

    const [enrollments, deliveries, evaluations] = await Promise.all([
      this.userCourseRepository.find({
        where: { courseId: context.course.idCourse },
        relations: { user: true },
        order: { enrollmentDate: 'ASC' },
      }),
      this.userTaskRepository.find({
        where: { idTask: context.task.idTask },
        order: { deliveryDate: 'DESC' },
      }),
      this.evaluationRepository.find({
        where: { idTask: context.task.idTask },
      }),
    ]);

    const deliveriesByEmail = new Map(
      deliveries.map((delivery) => [delivery.emailUser, delivery]),
    );
    const evaluationsByEmail = new Map(
      evaluations.map((evaluation) => [evaluation.emailUser, evaluation]),
    );

    const students = enrollments
      .filter(
        ({ user }) => user?.role === Role.STUDENT && Boolean(user.isActive),
      )
      .map(({ user }) => {
        const email = this.normalizeEmail(user.email);
        const delivery = deliveriesByEmail.get(email) ?? null;
        const evaluation = evaluationsByEmail.get(email) ?? null;
        const isQualified = delivery?.qualification != null;

        return {
          student: this.toStudentSummary(user),
          status: !delivery
            ? 'not_submitted'
            : isQualified
              ? 'qualified'
              : 'submitted',
          delivery: delivery
            ? {
                id: this.deliveryKey(delivery.idTask, delivery.emailUser),
                deliveryDate: delivery.deliveryDate,
                comment: delivery.comment,
                attempt: 1,
              }
            : null,
          qualification: isQualified ? Number(delivery.qualification) : null,
          qualificationDate: delivery?.qualificationDate ?? null,
          feedbackComments: delivery?.feedbackComments ?? null,
          hasDraft: evaluation?.status === EvaluationStatus.DRAFT,
        };
      });

    const received = students.filter(({ delivery }) =>
      Boolean(delivery),
    ).length;
    const qualified = students.filter(
      ({ status }) => status === 'qualified',
    ).length;

    return {
      activity: this.toActivitySummary(context),
      summary: {
        totalStudents: students.length,
        received,
        pendingQualification: received - qualified,
        pendingDelivery: students.length - received,
      },
      students,
    };
  }

  async getDeliveryDetail(idTask: number, emailUser: string, teacher: User) {
    const context = await this.findTaskContext(idTask);
    this.assertTeacherOwnsTask(context.task, teacher);

    const normalizedEmail = this.normalizeEmail(emailUser);
    const [delivery, student, enrollment, file, evaluation] = await Promise.all(
      [
        this.userTaskRepository.findOne({
          where: { idTask, emailUser: normalizedEmail },
        }),
        this.userRepository.findOne({ where: { email: normalizedEmail } }),
        this.userCourseRepository.findOne({
          where: {
            courseId: context.course.idCourse,
            userId: normalizedEmail,
          },
        }),
        this.deliveryFileRepository.findOne({
          where: { idTask, emailUser: normalizedEmail },
          order: { uploadDate: 'DESC' },
        }),
        this.evaluationRepository.findOne({
          where: { idTask, emailUser: normalizedEmail },
        }),
      ],
    );

    if (!delivery?.deliveryDate) {
      throw new NotFoundException(
        'No existe una entrega registrada para este estudiante y actividad',
      );
    }
    if (!student || !enrollment || student.role !== Role.STUDENT) {
      throw new BadRequestException(
        'La entrega no corresponde a un estudiante inscrito en el curso',
      );
    }

    const hasDraft = evaluation?.status === EvaluationStatus.DRAFT;
    const qualification = hasDraft
      ? evaluation.draftQualification
      : delivery.qualification;
    const feedbackComments = hasDraft
      ? evaluation.draftFeedback
      : delivery.feedbackComments;

    return {
      activity: this.toActivitySummary(context),
      student: this.toStudentSummary(student),
      delivery: {
        id: this.deliveryKey(delivery.idTask, delivery.emailUser),
        emailUser: delivery.emailUser,
        idTask: delivery.idTask,
        deliveryDate: delivery.deliveryDate,
        comment: delivery.comment,
        attempt: 1,
        punctuality:
          context.task.expirationDate &&
          delivery.deliveryDate > context.task.expirationDate
            ? 'late'
            : 'on_time',
        file: file
          ? {
              idFile: file.idFile,
              name: file.fileName,
              type: file.fileType,
              url: file.urlFile,
              uploadedAt: file.uploadDate,
              canPreview: file.fileType?.toLowerCase() === 'pdf',
            }
          : null,
      },
      evaluation: {
        status: hasDraft
          ? EvaluationStatus.DRAFT
          : delivery.qualification != null
            ? EvaluationStatus.PUBLISHED
            : 'ungraded',
        qualification: qualification == null ? null : Number(qualification),
        publishedQualification:
          delivery.qualification == null
            ? null
            : Number(delivery.qualification),
        feedbackComments,
        selectedCriteria: evaluation?.selectedCriteria ?? [],
        qualificationDate: delivery.qualificationDate,
        evaluatedBy: evaluation?.teacherEmail ?? null,
        updatedAt: evaluation?.updatedAt ?? null,
        hasDraft,
      },
    };
  }

  async saveDraft(
    idTask: number,
    emailUser: string,
    dto: SaveEvaluationDraftDto,
    teacher: User,
  ) {
    const detail = await this.getDeliveryDetail(idTask, emailUser, teacher);
    this.validateScore(dto.qualification, detail.activity.maxScore);
    this.validateSelectedCriteria(dto.selectedCriteria, detail.activity.rubric);

    const normalizedEmail = this.normalizeEmail(emailUser);
    const existing = await this.evaluationRepository.findOne({
      where: { idTask, emailUser: normalizedEmail },
    });
    const evaluation =
      existing ??
      this.evaluationRepository.create({
        idTask,
        emailUser: normalizedEmail,
      });

    evaluation.draftQualification =
      dto.qualification ?? detail.evaluation.qualification ?? null;
    evaluation.draftFeedback =
      dto.feedbackComments === undefined
        ? detail.evaluation.feedbackComments
        : dto.feedbackComments.trim() || null;
    evaluation.selectedCriteria =
      dto.selectedCriteria ?? detail.evaluation.selectedCriteria;
    evaluation.status = EvaluationStatus.DRAFT;
    evaluation.teacherEmail = this.normalizeEmail(teacher.email);

    await this.evaluationRepository.save(evaluation);
    return this.getDeliveryDetail(idTask, normalizedEmail, teacher);
  }

  async publish(
    idTask: number,
    emailUser: string,
    dto: QualifyUserTaskDto,
    teacher: User,
  ) {
    const detail = await this.getDeliveryDetail(idTask, emailUser, teacher);
    this.validateScore(dto.qualification, detail.activity.maxScore);
    this.validateSelectedCriteria(dto.selectedCriteria, detail.activity.rubric);

    const normalizedEmail = this.normalizeEmail(emailUser);
    const delivery = await this.userTasksService.qualify(
      idTask,
      normalizedEmail,
      dto,
    );
    const existing = await this.evaluationRepository.findOne({
      where: { idTask, emailUser: normalizedEmail },
    });
    const evaluation =
      existing ??
      this.evaluationRepository.create({
        idTask,
        emailUser: normalizedEmail,
      });

    evaluation.draftQualification = Number(delivery.qualification);
    evaluation.draftFeedback = delivery.feedbackComments;
    evaluation.selectedCriteria = dto.selectedCriteria ?? [];
    evaluation.status = EvaluationStatus.PUBLISHED;
    evaluation.teacherEmail = this.normalizeEmail(teacher.email);
    await this.evaluationRepository.save(evaluation);

    return this.getDeliveryDetail(idTask, normalizedEmail, teacher);
  }

  private async findTaskByActivityCode(
    rawActivityCode: string,
  ): Promise<TaskContext> {
    const activityCode = rawActivityCode.trim().toUpperCase();
    if (!activityCode) {
      throw new BadRequestException(
        'Debe proporcionar el identificador de la actividad',
      );
    }

    const config = await this.configRepository.findOne({
      where: { activityCode },
    });
    if (config) return this.findTaskContext(config.idTask, config);

    const idMatch = activityCode.match(/(?:^|[-_])(\d+)$/);
    if (!idMatch) {
      throw new NotFoundException(`Actividad ${activityCode} no encontrada`);
    }

    const context = await this.findTaskContext(Number(idMatch[1]));
    if (
      activityCode !== String(context.task.idTask) &&
      activityCode !== context.config.activityCode
    ) {
      throw new NotFoundException(`Actividad ${activityCode} no encontrada`);
    }
    return context;
  }

  private async findTaskContext(
    idTask: number,
    knownConfig?: TaskEvaluationConfig,
  ): Promise<TaskContext> {
    const task = await this.taskRepository.findOne({ where: { idTask } });
    if (!task) throw new NotFoundException(`Tarea ${idTask} no encontrada`);

    const period = await this.periodRepository.findOne({
      where: { idPeriod: task.periodId },
      relations: { course: true },
    });
    if (!period?.course) {
      throw new NotFoundException(
        `La tarea ${idTask} no está asociada a un curso válido`,
      );
    }

    const config =
      knownConfig ??
      (await this.configRepository.findOne({ where: { idTask } })) ??
      (await this.createDefaultConfig(task, period.course));

    return { task, period, course: period.course, config };
  }

  private async createDefaultConfig(task: Task, course: Course) {
    const prefix =
      course.code
        ?.toUpperCase()
        .split(/[^A-Z0-9]+/)
        .find(Boolean) ?? 'ACT';
    const config = this.configRepository.create({
      idTask: task.idTask,
      task,
      activityCode: `LAB-${prefix}-${String(task.idTask).padStart(3, '0')}`,
      rubricCriteria: DEFAULT_RUBRIC,
    });
    return this.configRepository.save(config);
  }

  private toActivitySummary({ task, course, config }: TaskContext) {
    return {
      idTask: task.idTask,
      code: config.activityCode,
      name: task.name,
      descriptions: task.descriptions,
      expirationDate: task.expirationDate,
      maxScore: Number(task.maxScore),
      course: {
        idCourse: course.idCourse,
        code: course.code,
        name: course.name,
      },
      rubric: config.rubricCriteria,
    };
  }

  private toStudentSummary(user: User) {
    return {
      email: user.email,
      name: [user.firstName, user.lastName].filter(Boolean).join(' '),
      institutionalCode: user.profileId ?? user.email.split('@')[0],
      profilePicture: user.profilePicture,
    };
  }

  private assertTeacherOwnsTask(task: Task, teacher: User) {
    if (
      this.normalizeEmail(task.createdById) !==
      this.normalizeEmail(teacher.email)
    ) {
      throw new ForbiddenException(
        'La actividad no pertenece al docente autenticado',
      );
    }
  }

  private validateScore(value: number | undefined, maxScore: number) {
    if (value !== undefined && (value < 0 || value > maxScore)) {
      throw new BadRequestException(
        `La calificación debe estar entre 0 y ${maxScore}`,
      );
    }
  }

  private validateSelectedCriteria(
    selected: string[] | undefined,
    rubric: RubricCriterion[],
  ) {
    if (!selected) return;
    const validIds = new Set(rubric.map(({ id }) => id));
    if (selected.some((criterion) => !validIds.has(criterion))) {
      throw new BadRequestException(
        'La selección contiene criterios que no pertenecen a la rúbrica',
      );
    }
  }

  private deliveryKey(idTask: number, emailUser: string) {
    return `${idTask}:${this.normalizeEmail(emailUser)}`;
  }

  private normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }
}
