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
import { SimulatorsService } from './simulators.service';
import { CreateSimulatorDto } from './dto/create-simulator.dto';
import { UpdateSimulatorDto } from './dto/update-simulator.dto';

@Controller('simulators')
export class SimulatorsController {
  constructor(private readonly simulatorsService: SimulatorsService) {}

  @Post()
  create(@Body() dto: CreateSimulatorDto) {
    return this.simulatorsService.create(dto);
  }

  // GET /simulators?onlyActive=true  -> lista para el selector del docente
  @Get()
  findAll(@Query('onlyActive') onlyActive?: string) {
    return this.simulatorsService.findAll(onlyActive === 'true');
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.simulatorsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSimulatorDto,
  ) {
    return this.simulatorsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.simulatorsService.remove(id);
  }
}
