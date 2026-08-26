import { ArrayNotEmpty, ArrayUnique, IsArray, IsInt } from 'class-validator';

export class AssignSimulatorsDto {
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsInt({ each: true })
  simulatorIds!: number[];
}
