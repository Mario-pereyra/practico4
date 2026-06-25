import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Reservation } from './reservation.entity';
import { Showtime } from '../../showtimes/entities/showtime.entity';
import { Seat } from '../../rooms/entities/seat.entity';

@Entity('reserved_seats')
@Unique(['showtimeId', 'seatId'])
export class ReservedSeat {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'reservation_id', type: 'bigint' })
  reservationId: number;

  @ManyToOne(() => Reservation, (r) => r.reservedSeats, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reservation_id' })
  reservation: Reservation;

  @Column({ name: 'showtime_id', type: 'bigint' })
  showtimeId: number;

  @ManyToOne(() => Showtime, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'showtime_id' })
  showtime: Showtime;

  @Column({ name: 'seat_id', type: 'bigint' })
  seatId: number;

  @ManyToOne(() => Seat, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'seat_id' })
  seat: Seat;

  @Column({ name: 'row_label', type: 'char', length: 1 })
  rowLabel: string;

  @Column({ name: 'column_number', type: 'integer' })
  columnNumber: number;

  @Column({ type: 'varchar', length: 4 })
  code: string;

  @Column({ name: 'unit_price', type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number;
}
