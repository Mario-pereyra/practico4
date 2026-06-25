import {
  IsDateString,
  IsInt,
  IsNumber,
  Min,
  Max,
  IsPositive,
} from 'class-validator';

export class CreateShowtimeDto {
  @IsInt()
  @Min(1)
  movieId: number;

  @IsInt()
  @Min(1)
  roomId: number;

  /**
   * ISO 8601 datetime string. Must be in the future relative to server time.
   */
  @IsDateString()
  startsAt: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Max(99999999.99)
  price: number;
}
