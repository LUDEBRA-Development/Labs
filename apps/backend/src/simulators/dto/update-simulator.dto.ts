import { PartialType } from '@nestjs/mapped-types';
import { CreateSimulatorDto } from './create-simulator.dto';

export class UpdateSimulatorDto extends PartialType(CreateSimulatorDto) {}
