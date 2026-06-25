import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, MoreThan, FindOptionsWhere } from 'typeorm';
import { Movie } from './entities/movie.entity';
import { Showtime } from '../showtimes/entities/showtime.entity';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { MoviesQueryDto } from './dto/movies-query.dto';
import { PublicMoviesQueryDto } from './dto/public-movies-query.dto';

@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
    @InjectRepository(Showtime)
    private readonly showtimeRepository: Repository<Showtime>,
  ) {}

  async listPublicMovies(query: PublicMoviesQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;
    const now = new Date();

    const qb = this.movieRepository
      .createQueryBuilder('m')
      .innerJoin('showtimes', 's', 's.movie_id = m.id AND s.starts_at > :now', {
        now,
      })
      .select([
        'm.id',
        'm.title',
        'm.genre',
        'm.duration_minutes',
        'm.rating',
        'm.poster_url',
      ])
      .orderBy('m.id', 'DESC')
      .skip(skip)
      .take(limit);

    if (query.search) {
      qb.andWhere('m.title ILIKE :search', {
        search: `%${query.search.trim()}%`,
      });
    }
    if (query.genre) {
      qb.andWhere('m.genre = :genre', { genre: query.genre });
    }
    if (query.rating) {
      qb.andWhere('m.rating = :rating', { rating: query.rating });
    }

    // Get distinct movies (innerJoin may cause duplicates if multiple showtimes)
    qb.groupBy('m.id');

    const [rawItems, totalItems] = await qb.getManyAndCount();
    const totalPages = Math.ceil(totalItems / limit);

    const items = rawItems.map((m) => ({
      id: Number(m.id),
      title: m.title,
      genre: m.genre,
      durationMinutes: m.durationMinutes,
      rating: m.rating,
      posterUrl: m.posterUrl,
    }));

    return { items, meta: { page, limit, totalItems, totalPages } };
  }

  async listAdminMovies(query: MoviesQueryDto) {
    const where: FindOptionsWhere<Movie> = {};

    if (query.search) {
      where.title = ILike(`%${query.search.trim()}%`);
    }
    if (query.genre) {
      where.genre = query.genre;
    }
    if (query.rating) {
      where.rating = query.rating;
    }

    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const [items, totalItems] = await this.movieRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { id: 'DESC' },
    });

    const totalPages = Math.ceil(totalItems / limit);

    // Cast bigint IDs to number
    const mappedItems = items.map((item) => {
      item.id = Number(item.id);
      return item;
    });

    return {
      items: mappedItems,
      meta: {
        page,
        limit,
        totalItems,
        totalPages,
      },
    };
  }

  async getMovieById(id: number): Promise<Movie> {
    const movie = await this.movieRepository.findOne({ where: { id } });
    if (!movie) {
      throw new NotFoundException({
        statusCode: 404,
        code: 'MOVIE_NOT_FOUND',
        message: 'La película no existe.',
      });
    }
    movie.id = Number(movie.id);
    return movie;
  }

  async getPublicMovieDetail(id: number) {
    const movie = await this.movieRepository.findOne({ where: { id } });
    if (!movie) {
      throw new NotFoundException({
        statusCode: 404,
        code: 'MOVIE_NOT_FOUND',
        message: 'La película no existe.',
      });
    }

    const now = new Date();
    const showtimes = await this.showtimeRepository.find({
      where: {
        movieId: id,
        startsAt: MoreThan(now),
      },
      relations: { room: true },
      order: { startsAt: 'ASC' },
    });

    return {
      id: Number(movie.id),
      title: movie.title,
      synopsis: movie.synopsis,
      genre: movie.genre,
      durationMinutes: movie.durationMinutes,
      rating: movie.rating,
      posterUrl: movie.posterUrl,
      showtimes: showtimes.map((s) => ({
        id: Number(s.id),
        startsAt: s.startsAt,
        endsAt: s.endsAt,
        price: Number(s.price),
        currency: s.currency,
        room: {
          id: Number(s.room.id),
          name: s.room.name,
        },
      })),
    };
  }

  async create(dto: CreateMovieDto, posterPath: string): Promise<Movie> {
    const movie = this.movieRepository.create({
      ...dto,
      posterUrl: posterPath,
    });
    const saved = await this.movieRepository.save(movie);
    saved.id = Number(saved.id);
    return saved;
  }

  async update(
    id: number,
    dto: UpdateMovieDto,
    newPosterPath?: string,
  ): Promise<Movie> {
    const movie = await this.getMovieById(id);

    if (dto.durationMinutes !== movie.durationMinutes) {
      // Check if there are future or active showtimes
      const count = await this.showtimeRepository.count({
        where: {
          movieId: id,
          endsAt: MoreThan(new Date()),
        },
      });
      if (count > 0) {
        throw new ConflictException({
          statusCode: 409,
          code: 'MOVIE_DURATION_LOCKED',
          message:
            'La duración no puede cambiar porque existen funciones futuras o en curso.',
        });
      }
    }

    movie.title = dto.title;
    movie.synopsis = dto.synopsis;
    movie.genre = dto.genre;
    movie.durationMinutes = dto.durationMinutes;
    movie.rating = dto.rating;

    if (newPosterPath) {
      movie.posterUrl = newPosterPath;
    }

    const saved = await this.movieRepository.save(movie);
    saved.id = Number(saved.id);
    return saved;
  }

  async delete(id: number): Promise<void> {
    // Ensure movie exists (throws 404 if not)
    await this.getMovieById(id);

    // Check if there are associated showtimes
    const count = await this.showtimeRepository.count({
      where: {
        movieId: id,
      },
    });

    if (count > 0) {
      throw new ConflictException({
        statusCode: 409,
        code: 'MOVIE_HAS_SHOWTIMES',
        message: 'La película tiene funciones asociadas.',
      });
    }

    await this.movieRepository.delete(id);
  }
}
