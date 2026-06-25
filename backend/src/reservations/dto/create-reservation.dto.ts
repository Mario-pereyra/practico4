import { IsArray, IsInt, IsNotEmpty, ArrayMinSize, ArrayMaxSize, ArrayUnique } from 'class-validator';

export class CreateReservationDto {
  @IsNotEmpty()
  @IsInt()
  showtimeId: number;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @ArrayUnique()
  @IsInt({ each: true })
  seatIds: number[];
}
