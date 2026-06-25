import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { MovieGenre, MovieRating } from '../entities/movie.entity';
import { Type } from 'class-transformer';

export class CreateMovieDto {
  @IsString()
  @IsNotEmpty({ message: 'El título no puede estar vacío.' })
  @MinLength(1, { message: 'El título debe tener al menos 1 carácter.' })
  @MaxLength(160, { message: 'El título no puede superar los 160 caracteres.' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'La sinopsis no puede estar vacía.' })
  @MinLength(1, { message: 'La sinopsis debe tener al menos 1 carácter.' })
  @MaxLength(2000, {
    message: 'La sinopsis no puede superar los 2000 caracteres.',
  })
  synopsis: string;

  @IsEnum(MovieGenre, { message: 'Género no válido.' })
  genre: MovieGenre;

  @Type(() => Number)
  @IsInt({ message: 'La duración debe ser un número entero.' })
  @Min(1, { message: 'La duración debe ser al menos 1 minuto.' })
  @Max(600, { message: 'La duración no puede ser superior a 600 minutos.' })
  durationMinutes: number;

  @IsEnum(MovieRating, { message: 'Clasificación de edad no válida.' })
  rating: MovieRating;
}
