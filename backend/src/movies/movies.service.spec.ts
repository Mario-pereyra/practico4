import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { MoviesService } from './movies.service';
import { Movie, MovieGenre, MovieRating } from './entities/movie.entity';
import { Showtime } from '../showtimes/entities/showtime.entity';

describe('MoviesService', () => {
  let service: MoviesService;
  let movieRepository: jest.Mocked<Repository<Movie>>;
  let showtimeRepository: jest.Mocked<Repository<Showtime>>;

  beforeEach(async () => {
    const mockMovieRepository = {
      findAndCount: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    const mockShowtimeRepository = {
      count: jest.fn(),
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoviesService,
        {
          provide: getRepositoryToken(Movie),
          useValue: mockMovieRepository,
        },
        {
          provide: getRepositoryToken(Showtime),
          useValue: mockShowtimeRepository,
        },
      ],
    }).compile();

    service = module.get<MoviesService>(MoviesService);
    movieRepository = module.get(getRepositoryToken(Movie));
    showtimeRepository = module.get(getRepositoryToken(Showtime));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getMovieById', () => {
    it('should return a movie if it exists', async () => {
      const mockMovie = { id: 1, title: 'Inception' } as Movie;
      movieRepository.findOne.mockResolvedValue(mockMovie);

      const result = await service.getMovieById(1);
      expect(result).toEqual({ id: 1, title: 'Inception' });
    });

    it('should throw NotFoundException if movie does not exist', async () => {
      movieRepository.findOne.mockResolvedValue(null);

      await expect(service.getMovieById(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getPublicMovieDetail', () => {
    it('should return a movie detail with future showtimes sorted ascending', async () => {
      const mockMovie = {
        id: 1,
        title: 'Inception',
        synopsis: 'Dream within a dream',
        genre: MovieGenre.SCIENCE_FICTION,
        durationMinutes: 148,
        rating: MovieRating.AGE_14,
        posterUrl: '/uploads/inception.jpg',
      } as Movie;
      movieRepository.findOne.mockResolvedValue(mockMovie);

      const mockRoom = { id: 2, name: 'Sala 1' };
      const showtime1 = {
        id: 10,
        startsAt: new Date(Date.now() + 3600000), // in 1 hour
        endsAt: new Date(Date.now() + 3600000 * 2),
        price: 45.0,
        currency: 'BOB',
        room: mockRoom,
      } as Showtime;
      const showtime2 = {
        id: 11,
        startsAt: new Date(Date.now() + 3600000 * 3), // in 3 hours
        endsAt: new Date(Date.now() + 3600000 * 4),
        price: 45.0,
        currency: 'BOB',
        room: mockRoom,
      } as Showtime;

      showtimeRepository.find.mockResolvedValue([showtime1, showtime2]);

      const result = await service.getPublicMovieDetail(1);
      expect(result.id).toBe(1);
      expect(result.showtimes).toHaveLength(2);
      expect(result.showtimes[0].id).toBe(10);
      expect(result.showtimes[1].id).toBe(11);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(showtimeRepository.find).toHaveBeenCalled();
    });

    it('should throw NotFoundException if movie does not exist', async () => {
      movieRepository.findOne.mockResolvedValue(null);

      await expect(service.getPublicMovieDetail(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create a new movie', async () => {
      const dto = {
        title: 'Inception',
        synopsis: 'Dream within a dream',
        genre: MovieGenre.SCIENCE_FICTION,
        durationMinutes: 148,
        rating: MovieRating.AGE_14,
      };
      const posterPath = '/uploads/posters/inception.jpg';
      const createdMovie = { ...dto, posterUrl: posterPath, id: 1 } as Movie;

      movieRepository.create.mockReturnValue(createdMovie);
      movieRepository.save.mockResolvedValue(createdMovie);

      const result = await service.create(dto, posterPath);
      expect(result).toEqual(createdMovie);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(movieRepository.create).toHaveBeenCalledWith({
        ...dto,
        posterUrl: posterPath,
      });
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(movieRepository.save).toHaveBeenCalledWith(createdMovie);
    });
  });

  describe('update', () => {
    it('should update a movie successfully if duration does not change', async () => {
      const mockMovie = {
        id: 1,
        title: 'Inception',
        durationMinutes: 148,
      } as Movie;
      movieRepository.findOne.mockResolvedValue(mockMovie);
      movieRepository.save.mockResolvedValue({
        ...mockMovie,
        title: 'Inception Updated',
      });

      const result = await service.update(1, {
        title: 'Inception Updated',
        synopsis: 'Dream within a dream',
        genre: MovieGenre.SCIENCE_FICTION,
        durationMinutes: 148,
        rating: MovieRating.AGE_14,
      });

      expect(result.title).toBe('Inception Updated');
    });

    it('should throw ConflictException if duration changes and active showtimes exist', async () => {
      const mockMovie = {
        id: 1,
        title: 'Inception',
        durationMinutes: 148,
      } as Movie;
      movieRepository.findOne.mockResolvedValue(mockMovie);
      showtimeRepository.count.mockResolvedValue(1); // has active showtimes

      await expect(
        service.update(1, {
          title: 'Inception',
          synopsis: 'Dream within a dream',
          genre: MovieGenre.SCIENCE_FICTION,
          durationMinutes: 150, // changed duration
          rating: MovieRating.AGE_14,
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('delete', () => {
    it('should delete a movie if it has no associated showtimes', async () => {
      const mockMovie = { id: 1, title: 'Inception' } as Movie;
      movieRepository.findOne.mockResolvedValue(mockMovie);
      showtimeRepository.count.mockResolvedValue(0);

      await service.delete(1);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(movieRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw ConflictException if movie has associated showtimes', async () => {
      const mockMovie = { id: 1, title: 'Inception' } as Movie;
      movieRepository.findOne.mockResolvedValue(mockMovie);
      showtimeRepository.count.mockResolvedValue(5);

      await expect(service.delete(1)).rejects.toThrow(ConflictException);
    });
  });
});
