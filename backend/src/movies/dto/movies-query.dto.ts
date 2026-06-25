import { IsEnum, IsOptional, IsInt, Min, Max, IsString } from 'class-validator';
import { MovieGenre, MovieRating } from '../entities/movie.entity';
import { Type } from 'class-transformer';

export class MoviesQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(MovieGenre, { message: 'Género de búsqueda no válido.' })
  genre?: MovieGenre;

  @IsOptional()
  @IsEnum(MovieRating, { message: 'Clasificación de búsqueda no válida.' })
  rating?: MovieRating;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1, { message: 'La página debe ser al menos 1.' })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1, { message: 'El límite debe ser al menos 1.' })
  @Max(100, { message: 'El límite no puede superar 100.' })
  limit?: number = 10;
}
