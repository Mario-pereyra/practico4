import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { PublicMoviesQueryDto } from './dto/public-movies-query.dto';

/**
 * Public (no auth) endpoints for the movies billboard.
 * Route prefix: /movies (no admin prefix, no guards)
 */
@Controller('movies')
export class PublicMoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get()
  listPublic(@Query() query: PublicMoviesQueryDto) {
    return this.moviesService.listPublicMovies(query);
  }

  @Get(':movieId')
  getOnePublic(@Param('movieId', ParseIntPipe) movieId: number) {
    return this.moviesService.getPublicMovieDetail(movieId);
  }
}
