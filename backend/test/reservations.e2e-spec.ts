import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { DataSource, MoreThan } from 'typeorm';
import { User, UserRole } from '../src/users/entities/user.entity';
import { Movie } from '../src/movies/entities/movie.entity';
import { Room } from '../src/rooms/entities/room.entity';
import { Seat } from '../src/rooms/entities/seat.entity';
import { Showtime } from '../src/showtimes/entities/showtime.entity';
import { ReservedSeat } from '../src/reservations/entities/reserved-seat.entity';
import { Reservation } from '../src/reservations/entities/reservation.entity';
import * as bcrypt from 'bcryptjs';

describe('Reservations (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let token: string;
  let userId: number;
  let showtimeId: number;
  let seatIds: number[] = [];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);

    // Clean tables in order of dependencies
    await dataSource.getRepository(ReservedSeat).delete({ id: MoreThan(0) as any });
    await dataSource.getRepository(Reservation).delete({ id: MoreThan(0) as any });
    await dataSource.getRepository(Showtime).delete({ id: MoreThan(0) as any });
    await dataSource.getRepository(Seat).delete({ id: MoreThan(0) as any });
    await dataSource.getRepository(Room).delete({ id: MoreThan(0) as any });
    await dataSource.getRepository(User).delete({ id: MoreThan(0) as any });
    await dataSource.getRepository(Movie).delete({ id: MoreThan(0) as any });

    // Create a client user
    const clientPass = await bcrypt.hash('client123', 10);
    const user = await dataSource.getRepository(User).save({
      name: 'Client User',
      email: 'client@test.com',
      password: clientPass,
      role: UserRole.CLIENT,
    });
    userId = Number(user.id);

    // Create a movie
    const movie = await dataSource.getRepository(Movie).save({
      title: 'Test Movie',
      synopsis: 'A test synopsis',
      genre: 'ACTION',
      durationMinutes: 120,
      rating: 'ALL_AGES',
      posterUrl: '/uploads/test.jpg',
    });

    // Create a room with seats
    const room = await dataSource.getRepository(Room).save({
      name: 'Sala 1',
      rows: 2,
      columns: 3,
      capacity: 6,
    });

    // Generate seats
    const seats: any[] = [];
    for (let r = 0; r < 2; r++) {
      const rowLabel = String.fromCharCode(65 + r);
      for (let c = 1; c <= 3; c++) {
        seats.push({
          roomId: room.id,
          rowLabel,
          columnNumber: c,
          code: `${rowLabel}${c}`,
        });
      }
    }
    const savedSeats = await dataSource.getRepository(Seat).save(seats);
    seatIds = savedSeats.map((s) => Number(s.id));

    // Create a showtime in the future (starts tomorrow)
    const startsAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const endsAt = new Date(startsAt.getTime() + 120 * 60 * 1000);
    const showtime = await dataSource.getRepository(Showtime).save({
      movieId: movie.id,
      roomId: room.id,
      startsAt,
      endsAt,
      price: 45.0,
      currency: 'BOB',
    });
    showtimeId = Number(showtime.id);

    // Get JWT token by logging in
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'client@test.com', password: 'client123' })
      .expect(HttpStatus.OK);
    token = loginRes.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should not allow fetching seat map without token (401)', async () => {
    await request(app.getHttpServer())
      .get(`/showtimes/${showtimeId}/seats`)
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('should fetch the seat map successfully', async () => {
    const res = await request(app.getHttpServer())
      .get(`/showtimes/${showtimeId}/seats`)
      .set('Authorization', `Bearer ${token}`)
      .expect(HttpStatus.OK);

    expect(res.body.showtimeId).toBe(showtimeId);
    expect(res.body.seats).toHaveLength(6);
    expect(res.body.seats[0].status).toBe('AVAILABLE');
  });

  it('should create a reservation successfully', async () => {
    const res = await request(app.getHttpServer())
      .post('/reservations')
      .set('Authorization', `Bearer ${token}`)
      .send({
        showtimeId,
        seatIds: [seatIds[0], seatIds[1]],
      })
      .expect(HttpStatus.CREATED);

    expect(res.body.total).toBe(90.0);
    expect(res.body.seats).toHaveLength(2);
    expect(res.body.seats[0].seatId).toBe(seatIds[0]);
  });

  it('should fail to reserve the same seat again (409)', async () => {
    await request(app.getHttpServer())
      .post('/reservations')
      .set('Authorization', `Bearer ${token}`)
      .send({
        showtimeId,
        seatIds: [seatIds[0]],
      })
      .expect(HttpStatus.CONFLICT);
  });
});
