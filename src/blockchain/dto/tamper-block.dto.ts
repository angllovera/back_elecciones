import { IsInt, IsNotEmpty, IsObject } from 'class-validator';

export class TamperBlockDto {
  @IsInt()
  @IsNotEmpty()
  blockId: number;

  @IsObject()
  @IsNotEmpty()
  newData: Record<string, any>;
}