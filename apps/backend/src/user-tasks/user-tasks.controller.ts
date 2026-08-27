import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { FirebaseAuthGuard } from '../auth/guards/firebase-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { User } from '../users/entities/user.entity';
import { CreateUserTaskDto } from './dto/create-user-task.dto';
import { ListUserTasksDto } from './dto/list-user-tasks.dto';
import { QualifyUserTaskDto } from './dto/qualify-user-task.dto';
import { SaveEvaluationDraftDto } from './dto/save-evaluation-draft.dto';
import { TeacherEvaluationService } from './teacher-evaluation.service';
import { UserTasksService } from './user-tasks.service';

@Controller('user-tasks')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class UserTasksController {
  constructor(
    private readonly userTasksService: UserTasksService,
    private readonly teacherEvaluationService: TeacherEvaluationService,
  ) {}

  @Post()
  create(@Body() dto: CreateUserTaskDto) {
    return this.userTasksService.create(dto);
  }

  @Post('submit')
  @UseInterceptors(FileInterceptor('file'))
  submit(
    @Body() dto: CreateUserTaskDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.userTasksService.submit(dto, file);
  }

  @Patch(':idTask/:emailUser/qualification')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(Role.TEACHER)
  qualify(
    @Param('idTask', ParseIntPipe) idTask: number,
    @Param('emailUser') emailUser: string,
    @Body() dto: QualifyUserTaskDto,
    @CurrentUser() teacher: User,
  ) {
    return this.teacherEvaluationService.publish(
      idTask,
      emailUser,
      dto,
      teacher,
    );
  }

  @Patch(':idTask/:emailUser/draft')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(Role.TEACHER)
  saveDraft(
    @Param('idTask', ParseIntPipe) idTask: number,
    @Param('emailUser') emailUser: string,
    @Body() dto: SaveEvaluationDraftDto,
    @CurrentUser() teacher: User,
  ) {
    return this.teacherEvaluationService.saveDraft(
      idTask,
      emailUser,
      dto,
      teacher,
    );
  }

  @Get('follow-up')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(Role.TEACHER)
  getFollowUp(
    @Query('activityCode') activityCode: string,
    @CurrentUser() teacher: User,
  ) {
    return this.teacherEvaluationService.getFollowUp(
      activityCode ?? '',
      teacher,
    );
  }

  @Get(':idTask/:emailUser')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(Role.TEACHER)
  getDeliveryDetail(
    @Param('idTask', ParseIntPipe) idTask: number,
    @Param('emailUser') emailUser: string,
    @CurrentUser() teacher: User,
  ) {
    return this.teacherEvaluationService.getDeliveryDetail(
      idTask,
      emailUser,
      teacher,
    );
  }

  @Get()
  findAll(@Query() query: ListUserTasksDto) {
    return this.userTasksService.findAll(query);
  }
}
