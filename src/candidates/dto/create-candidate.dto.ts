import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCandidateDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  partido: string;

  @IsOptional()
  @IsString()
  fotoUrl?: string;
}