import {
  Body,
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  // Req, // descomenta cuando conectes el guard de auth para leer el usuario logueado
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AssignSimulatorsDto } from './dto/assign-simulators.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { FirebaseAuthGuard } from 'src/auth/guards/firebase-auth.guard';
import { User } from 'src/users/entities/user.entity';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @UseGuards(FirebaseAuthGuard)
  create(@Body() dto: CreateTaskDto, @CurrentUser() user: User) {
    const createdById = user.email;
    return this.tasksService.create(dto, createdById);
  }

  // GET /tasks?periodId=3
  @Get()
  findByPeriod(
    @Query('periodId') periodId?: string,
    @Query('courseId') courseId?: string,
  ) {
    if (courseId) return this.tasksService.findByCourse(courseId);
    const parsedPeriodId = Number(periodId);
    if (!Number.isInteger(parsedPeriodId)) {
      throw new BadRequestException('Debe proporcionar periodId o courseId');
    }
    return this.tasksService.findByPeriod(parsedPeriodId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tasksService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTaskDto) {
    return this.tasksService.update(id, dto);
  }

  @Post(':id/simulators')
  assignSimulators(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignSimulatorsDto,
  ) {
    return this.tasksService.assignSimulators(id, dto);
  }

  @Delete(':id/simulators/:simulatorId')
  removeSimulator(
    @Param('id', ParseIntPipe) id: number,
    @Param('simulatorId', ParseIntPipe) simulatorId: number,
  ) {
    return this.tasksService.removeSimulator(id, simulatorId);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tasksService.remove(id);
  }
}
