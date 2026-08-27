import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { AssignTeacherDto } from './dto/assign-teacher.dto';
import { EnrollStudentDto } from './dto/enroll-student.dto';
import { CreatePeriodDto } from './dto/create-period.dto';
import { UpdatePeriodDto } from './dto/update-period.dto';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  create(@Body() dto: CreateCourseDto) {
    return this.coursesService.create(dto);
  }

  @Get()
  findAll() {
    return this.coursesService.findAll();
  }

  // --- Docente responsable ---
  @Patch(':id/teacher')
  assignTeacher(@Param('id') id: string, @Body() dto: AssignTeacherDto) {
    return this.coursesService.assignTeacher(id, dto.userId);
  }

  @Delete(':id/teacher')
  removeTeacher(@Param('id') id: string) {
    return this.coursesService.removeTeacher(id);
  }

  // --- Matrícula ---
  @Get(':id/enrollments')
  listEnrollments(@Param('id') id: string) {
    return this.coursesService.listStudents(id);
  }

  @Post(':id/enrollments')
  enroll(@Param('id') id: string, @Body() dto: EnrollStudentDto) {
    return this.coursesService.enrollStudent(id, dto.userId);
  }

  @Delete(':id/enrollments/:userId')
  unroll(@Param('id') id: string, @Param('userId') userId: string) {
    return this.coursesService.unrollStudent(id, userId);
  }

  // --- Períodos ---
  @Get(':id/periods')
  listPeriods(@Param('id') id: string) {
    return this.coursesService.listPeriods(id);
  }

  @Post(':id/periods')
  createPeriod(@Param('id') id: string, @Body() dto: CreatePeriodDto) {
    return this.coursesService.createPeriod(id, dto);
  }

  @Patch('periods/:periodId')
  updatePeriod(
    @Param('periodId', ParseIntPipe) periodId: number,
    @Body() dto: UpdatePeriodDto,
  ) {
    return this.coursesService.updatePeriod(periodId, dto);
  }

  @Delete('periods/:periodId')
  removePeriod(@Param('periodId', ParseIntPipe) periodId: number) {
    return this.coursesService.removePeriod(periodId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCourseDto) {
    return this.coursesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.coursesService.remove(id);
  }
}
