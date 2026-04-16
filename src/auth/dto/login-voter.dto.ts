import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class LoginVoterDto {
  @IsString()
  @IsNotEmpty()
  carnet: string;

  @IsDateString()
  fechaNacimiento: string;
}