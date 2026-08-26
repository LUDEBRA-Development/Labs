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
} from '@nestjs/common';
import { StatesService } from './states.service';
import { CreateStateDto } from './dto/create-state.dto';
import { UpdateStateDto } from './dto/update-state.dto';

@Controller('states')
export class StatesController {
  constructor(private readonly statesService: StatesService) {}

  @Post()
  create(@Body() dto: CreateStateDto) {
    return this.statesService.create(dto);
  }

  @Get()
  findAll(@Query('entity') entity?: string) {
    return this.statesService.findAll(entity);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.statesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStateDto) {
    return this.statesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.statesService.remove(id);
  }
}