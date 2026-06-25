import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Showtime } from './entities/showtime.entity';
import { Movie } from '../movies/entities/movie.entity';
import { Room } from '../rooms/entities/room.entity';
import { CreateShowtimeDto } from './dto/create-showtime.dto';
import { UpdateShowtimeDto } from './dto/update-showtime.dto';
import { ShowtimesQueryDto } from './dto/showtimes-query.dto';
import { Seat } from '../rooms/entities/seat.entity';
import { ReservedSeat } from '../reservations/entities/reserved-seat.entity';

@Injectable()
export class ShowtimesService {
  constructor(
    @InjectRepository(Showtime)
    private readonly showtimeRepository: Repository<Showtime>,
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    private readonly dataSource: DataSource,
  ) {}

  // ─── Helpers ────────────────────────────────────────────────────────────────

  private async findMovieAndRoom(
    movieId: number,
    roomId: number,
  ): Promise<{ movie: Movie; room: Room }> {
    const [movie, room] = await Promise.all([
      this.movieRepository.findOne({ where: { id: movieId } }),
      this.roomRepository.findOne({ where: { id: roomId } }),
    ]);
    if (!movie || !room) {
      throw new NotFoundException({
        statusCode: 404,
        code: 'MOVIE_OR_ROOM_NOT_FOUND',
        message: 'La película o la sala no existe.',
      });
    }
    return { movie, room };
  }

  private computeEndsAt(startsAt: Date, durationMinutes: number): Date {
    return new Date(startsAt.getTime() + durationMinutes * 60 * 1000);
  }

  /**
   * Check for overlap using the half-open interval [startsAt, endsAt).
   * An overlap exists when: newStart < existingEnd AND newEnd > existingStart.
   * Adjacent showtimes (newStart === existingEnd) are explicitly allowed.
   * `excludeId` is used on updates to exclude the showtime being edited.
   */
  private async checkOverlap(
    roomId: number,
    startsAt: Date,
    endsAt: Date,
    excludeId?: number,
  ): Promise<void> {
    const qb = this.showtimeRepository
      .createQueryBuilder('s')
      .where('s.room_id = :roomId', { roomId })
      .andWhere('s.starts_at < :endsAt', { endsAt })
      .andWhere('s.ends_at > :startsAt', { startsAt });

    if (excludeId) {
      qb.andWhere('s.id != :excludeId', { excludeId });
    }

    const count = await qb.getCount();
    if (count > 0) {
      throw new ConflictException({
        statusCode: 409,
        code: 'SHOWTIME_OVERLAP',
        message: 'La sala ya está ocupada durante el intervalo solicitado.',
      });
    }
  }

  private ensureFuture(startsAt: Date): void {
    if (startsAt <= new Date()) {
      throw new BadRequestException({
        statusCode: 400,
        code: 'VALIDATION_ERROR',
        message: 'La solicitud contiene datos inválidos.',
        errors: [
          { field: 'startsAt', message: 'startsAt debe ser una fecha futura.' },
        ],
      });
    }
  }

  private async hasStartedOrHasReservations(
    showtime: Showtime,
  ): Promise<boolean> {
    if (showtime.startsAt <= new Date()) return true;
    const count = await this.dataSource.getRepository(ReservedSeat).count({
      where: { showtimeId: showtime.id },
    });
    return count > 0;
  }

  private async ensureModifiable(showtime: Showtime): Promise<void> {
    if (await this.hasStartedOrHasReservations(showtime)) {
      throw new ConflictException({
        statusCode: 409,
        code: 'SHOWTIME_NOT_MODIFIABLE',
        message: 'La función ya comenzó o tiene reservas asociadas.',
      });
    }
  }

  private async ensureDeletable(showtime: Showtime): Promise<void> {
    if (await this.hasStartedOrHasReservations(showtime)) {
      throw new ConflictException({
        statusCode: 409,
        code: 'SHOWTIME_NOT_DELETABLE',
        message: 'La función ya comenzó o tiene reservas asociadas.',
      });
    }
  }

  formatDetail(showtime: Showtime) {
    return {
      id: showtime.id,
      movie: showtime.movie
        ? {
            id: showtime.movie.id,
            title: showtime.movie.title,
            genre: showtime.movie.genre,
            durationMinutes: showtime.movie.durationMinutes,
            rating: showtime.movie.rating,
            posterUrl: showtime.movie.posterUrl,
          }
        : undefined,
      room: showtime.room
        ? {
            id: showtime.room.id,
            name: showtime.room.name,
            rows: showtime.room.rows,
            columns: showtime.room.columns,
            capacity: showtime.room.capacity,
          }
        : undefined,
      startsAt: showtime.startsAt,
      endsAt: showtime.endsAt,
      price: Number(showtime.price),
      currency: showtime.currency,
      createdAt: showtime.createdAt,
      updatedAt: showtime.updatedAt,
    };
  }

  // ─── CRUD ───────────────────────────────────────────────────────────────────

  async findAll(query: ShowtimesQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const qb = this.showtimeRepository
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.movie', 'movie')
      .leftJoinAndSelect('s.room', 'room')
      .orderBy('s.starts_at', 'ASC')
      .skip(skip)
      .take(limit);

    if (query.movieId) {
      qb.andWhere('s.movie_id = :movieId', { movieId: query.movieId });
    }
    if (query.roomId) {
      qb.andWhere('s.room_id = :roomId', { roomId: query.roomId });
    }
    if (query.from) {
      qb.andWhere('s.starts_at >= :from', { from: new Date(query.from) });
    }
    if (query.to) {
      qb.andWhere('s.starts_at <= :to', { to: new Date(query.to) });
    }

    const [items, totalItems] = await qb.getManyAndCount();
    const totalPages = Math.ceil(totalItems / limit);

    return {
      items: items.map((s) => this.formatDetail(s)),
      meta: { page, limit, totalItems, totalPages },
    };
  }

  async findOne(id: number): Promise<Showtime> {
    const showtime = await this.showtimeRepository.findOne({
      where: { id },
      relations: { movie: true, room: true },
    });
    if (!showtime) {
      throw new NotFoundException({
        statusCode: 404,
        code: 'SHOWTIME_NOT_FOUND',
        message: 'La función no existe.',
      });
    }
    return showtime;
  }

  async create(dto: CreateShowtimeDto) {
    const startsAt = new Date(dto.startsAt);
    this.ensureFuture(startsAt);

    const { movie, room } = await this.findMovieAndRoom(
      dto.movieId,
      dto.roomId,
    );
    const endsAt = this.computeEndsAt(startsAt, movie.durationMinutes);

    await this.checkOverlap(dto.roomId, startsAt, endsAt);

    const showtime = this.showtimeRepository.create({
      movieId: movie.id,
      roomId: room.id,
      startsAt,
      endsAt,
      price: dto.price,
      currency: 'BOB',
    });
    const saved = await this.showtimeRepository.save(showtime);

    // Re-fetch with relations for the response
    const full = await this.findOne(Number(saved.id));
    return this.formatDetail(full);
  }

  async update(id: number, dto: UpdateShowtimeDto) {
    const showtime = await this.findOne(id);
    await this.ensureModifiable(showtime);

    const startsAt = new Date(dto.startsAt);
    this.ensureFuture(startsAt);

    const { movie, room } = await this.findMovieAndRoom(
      dto.movieId,
      dto.roomId,
    );
    const endsAt = this.computeEndsAt(startsAt, movie.durationMinutes);

    await this.checkOverlap(dto.roomId, startsAt, endsAt, id);

    showtime.movieId = movie.id;
    showtime.roomId = room.id;
    showtime.startsAt = startsAt;
    showtime.endsAt = endsAt;
    showtime.price = dto.price;

    await this.showtimeRepository.save(showtime);

    const full = await this.findOne(id);
    return this.formatDetail(full);
  }

  async remove(id: number): Promise<void> {
    const showtime = await this.findOne(id);
    await this.ensureDeletable(showtime);
    await this.showtimeRepository.delete(id);
  }

  async getSeatMap(showtimeId: number) {
    const showtime = await this.findOne(showtimeId);

    if (showtime.startsAt <= new Date()) {
      throw new ConflictException({
        statusCode: 409,
        code: 'SHOWTIME_NOT_BOOKABLE',
        message: 'La función ya inició o no admite nuevas reservas.',
      });
    }

    const seats = await this.dataSource.getRepository(Seat).find({
      where: { roomId: showtime.room.id },
      order: { rowLabel: 'ASC', columnNumber: 'ASC' },
    });

    const reserved = await this.dataSource.getRepository(ReservedSeat).find({
      where: { showtimeId: showtime.id },
    });
    const reservedSeatIds = new Set(reserved.map((rs) => Number(rs.seatId)));

    const mappedSeats = seats.map((seat) => ({
      id: Number(seat.id),
      roomId: Number(seat.roomId),
      rowLabel: seat.rowLabel,
      columnNumber: seat.columnNumber,
      code: seat.code,
      status: reservedSeatIds.has(Number(seat.id)) ? 'RESERVED' : 'AVAILABLE',
    }));

    return {
      showtimeId: Number(showtime.id),
      movie: {
        id: Number(showtime.movie.id),
        title: showtime.movie.title,
        genre: showtime.movie.genre,
        durationMinutes: showtime.movie.durationMinutes,
        rating: showtime.movie.rating,
        posterUrl: showtime.movie.posterUrl,
      },
      room: {
        id: Number(showtime.room.id),
        name: showtime.room.name,
        rows: showtime.room.rows,
        columns: showtime.room.columns,
        capacity: showtime.room.capacity,
      },
      startsAt: showtime.startsAt,
      endsAt: showtime.endsAt,
      price: Number(showtime.price),
      currency: showtime.currency,
      seats: mappedSeats,
    };
  }
}
