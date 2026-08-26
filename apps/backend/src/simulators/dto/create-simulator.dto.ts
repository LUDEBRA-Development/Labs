import { IsBoolean, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class CreateSimulatorDto {
  @IsString()
  @MaxLength(100)
  name!: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(255)
  url?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsBoolean()
  status?: boolean = true;
}
