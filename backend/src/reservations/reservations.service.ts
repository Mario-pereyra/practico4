import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { Reservation } from './entities/reservation.entity';
import { ReservedSeat } from './entities/reserved-seat.entity';
import { Showtime } from '../showtimes/entities/showtime.entity';
import { Seat } from '../rooms/entities/seat.entity';
import { CreateReservationDto } from './dto/create-reservation.dto';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    private readonly dataSource: DataSource,
  ) {}

  formatDetail(reservation: Reservation) {
    return {
      id: Number(reservation.id),
      showtime: {
        id: Number(reservation.showtime.id),
        movieId: Number(reservation.showtime.movie.id),
        movieTitle: reservation.showtime.movie.title,
        roomId: Number(reservation.showtime.room.id),
        roomName: reservation.showtime.room.name,
        startsAt: reservation.showtime.startsAt,
        endsAt: reservation.showtime.endsAt,
        price: Number(reservation.showtime.price),
        currency: reservation.showtime.currency,
      },
      seats: (reservation.reservedSeats || []).map((rs) => ({
        seatId: Number(rs.seatId),
        rowLabel: rs.rowLabel,
        columnNumber: rs.columnNumber,
        code: rs.code,
        unitPrice: Number(rs.unitPrice),
      })),
      reservedAt: reservation.createdAt,
      total: Number(reservation.total),
      currency: reservation.currency,
    };
  }

  async create(userId: number, dto: CreateReservationDto) {
    return this.dataSource.transaction(async (manager) => {
      // 1. Fetch showtime with relations
      const showtime = await manager.findOne(Showtime, {
        where: { id: dto.showtimeId },
        relations: { movie: true, room: true },
      });

      if (!showtime) {
        throw new NotFoundException({
          statusCode: 404,
          code: 'SHOWTIME_OR_SEAT_NOT_FOUND',
          message: 'La función o uno de los asientos no existe.',
        });
      }

      // 2. Ensure showtime is in the future
      if (showtime.startsAt <= new Date()) {
        throw new ConflictException({
          statusCode: 409,
          code: 'SHOWTIME_NOT_BOOKABLE',
          message: 'La función ya inició o no admite nuevas reservas.',
        });
      }

      // 3. Verify all seats exist in this room
      const seats = await manager.find(Seat, {
        where: {
          id: In(dto.seatIds),
          roomId: showtime.room.id,
        },
      });

      if (seats.length !== dto.seatIds.length) {
        throw new NotFoundException({
          statusCode: 404,
          code: 'SHOWTIME_OR_SEAT_NOT_FOUND',
          message: 'La función o uno de los asientos no existe.',
        });
      }

      // 4. Verify no seat is already reserved for this showtime
      const existing = await manager.findOne(ReservedSeat, {
        where: {
          showtimeId: showtime.id,
          seatId: In(dto.seatIds),
        },
      });

      if (existing) {
        throw new ConflictException({
          statusCode: 409,
          code: 'SEAT_ALREADY_RESERVED',
          message: 'Uno o más asientos ya fueron reservados para esta función.',
        });
      }

      // 5. Create reservation
      const total = seats.length * Number(showtime.price);
      const reservation = manager.create(Reservation, {
        userId,
        showtimeId: showtime.id,
        total,
        currency: 'BOB',
      });
      const saved = await manager.save(Reservation, reservation);

      // 6. Create reserved seats
      const reservedSeats = seats.map((seat) =>
        manager.create(ReservedSeat, {
          reservationId: saved.id,
          showtimeId: showtime.id,
          seatId: seat.id,
          rowLabel: seat.rowLabel,
          columnNumber: seat.columnNumber,
          code: seat.code,
          unitPrice: Number(showtime.price),
        }),
      );
      await manager.save(ReservedSeat, reservedSeats);

      // 7. Return complete detail
      const full = await manager.findOne(Reservation, {
        where: { id: saved.id },
        relations: {
          showtime: { movie: true, room: true },
          reservedSeats: true,
        },
      });

      return this.formatDetail(full!);
    });
  }

  async getReservationDetail(id: number, userId: number, isAdmin = false) {
    const query: any = {
      where: { id },
      relations: {
        showtime: { movie: true, room: true },
        reservedSeats: true,
      },
    };

    if (!isAdmin) {
      query.where.userId = userId;
    }

    const reservation = await this.reservationRepository.findOne(query);
    if (!reservation) {
      throw new NotFoundException({
        statusCode: 404,
        code: 'RESERVATION_NOT_FOUND',
        message: 'La reserva no existe.',
      });
    }

    return this.formatDetail(reservation);
  }

  async listMyReservations(userId: number, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [items, totalItems] = await this.reservationRepository.findAndCount({
      where: { userId },
      relations: {
        showtime: { movie: true, room: true },
        reservedSeats: true,
      },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(totalItems / limit);

    return {
      items: items.map((r) => this.formatDetail(r)),
      meta: { page, limit, totalItems, totalPages },
    };
  }
}
