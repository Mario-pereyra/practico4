import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Movie } from './entities/movie.entity';
import { Showtime } from '../showtimes/entities/showtime.entity';
import { MoviesService } from './movies.service';
import { MoviesController } from './movies.controller';
import { PublicMoviesController } from './public-movies.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Movie, Showtime])],
  controllers: [MoviesController, PublicMoviesController],
  providers: [MoviesService],
  exports: [MoviesService],
})
export class MoviesModule {}
