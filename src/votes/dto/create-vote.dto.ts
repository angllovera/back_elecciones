import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateVoteDto {
  @IsInt()
  @IsNotEmpty()
  candidateId: number;
}