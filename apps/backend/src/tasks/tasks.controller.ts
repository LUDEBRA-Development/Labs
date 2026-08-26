import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  // Req, // descomenta cuando conectes el guard de auth para leer el usuario logueado
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AssignSimulatorsDto } from './dto/assign-simulators.dto';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(@Body() dto: CreateTaskDto /*, @Req() req */) {
    // TODO: reemplazar por el email del docente autenticado (req.user.email)
    // una vez esté conectado el guard de auth (Firebase).
    const createdById = 'docente@ejemplo.com';
    return this.tasksService.create(dto, createdById);
  }

  // GET /tasks?periodId=3
  @Get()
  findByPeriod(@Query('periodId', ParseIntPipe) periodId: number) {
    return this.tasksService.findByPeriod(periodId);
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
