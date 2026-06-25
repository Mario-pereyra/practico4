import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Movie } from '../movies/entities/movie.entity';
import { Showtime } from '../showtimes/entities/showtime.entity';
import { Room } from '../rooms/entities/room.entity';
import { Seat } from '../rooms/entities/seat.entity';
import { Reservation } from '../reservations/entities/reservation.entity';
import { ReservedSeat } from '../reservations/entities/reserved-seat.entity';
import * as dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password123',
  database: process.env.DB_DATABASE || 'cine_reservas',
  synchronize: false, // Must be false for production/migrations readiness
  logging: true,
  entities: [User, Movie, Showtime, Room, Seat, Reservation, ReservedSeat],
  migrations: [__dirname + '/migrations/*.{ts,js}'],
  subscribers: [],
});
