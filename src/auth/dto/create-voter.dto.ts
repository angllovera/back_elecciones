import { IsDateString, IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateVoterDto {
  @IsString()
  @IsNotEmpty()
  nombres: string;

  @IsString()
  @IsNotEmpty()
  apellidos: string;

  @IsString()
  @IsNotEmpty()
  @Length(5, 20)
  carnet: string;

  @IsDateString()
  fechaNacimiento: string;
}