import { AppDataSource } from '../data-source';
import { User, UserRole } from '../../users/entities/user.entity';
import { Movie, MovieGenre, MovieRating } from '../../movies/entities/movie.entity';
import { Room } from '../../rooms/entities/room.entity';
import { Seat } from '../../rooms/entities/seat.entity';
import { Showtime } from '../../showtimes/entities/showtime.entity';
import * as bcrypt from 'bcryptjs';

async function run() {
  console.log('Iniciando carga de semillas de base de datos...');
  await AppDataSource.initialize();

  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();

  // Limpiar tablas previas en el orden correcto para evitar conflictos de claves foráneas
  console.log('Limpiando base de datos...');
  await queryRunner.query('DELETE FROM reserved_seats');
  await queryRunner.query('DELETE FROM reservations');
  await queryRunner.query('DELETE FROM showtimes');
  await queryRunner.query('DELETE FROM seats');
  await queryRunner.query('DELETE FROM rooms');
  await queryRunner.query('DELETE FROM movies');
  await queryRunner.query('DELETE FROM users');

  const userRepository = AppDataSource.getRepository(User);
  const movieRepository = AppDataSource.getRepository(Movie);
  const roomRepository = AppDataSource.getRepository(Room);
  const seatRepository = AppDataSource.getRepository(Seat);
  const showtimeRepository = AppDataSource.getRepository(Showtime);

  // 1. Crear Usuarios (Admin y Cliente de pruebas)
  console.log('Creando usuarios...');
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const adminUser = userRepository.create({
    name: 'Administrador del Cine',
    email: 'admin@cinema.com',
    password: hashedPassword,
    role: UserRole.ADMIN,
  });
  await userRepository.save(adminUser);

  const clientPassword = await bcrypt.hash('client123', 10);
  const clientUser = userRepository.create({
    name: 'Cliente de Prueba',
    email: 'client@cinema.com',
    password: clientPassword,
    role: UserRole.CLIENT,
  });
  await userRepository.save(clientUser);
  console.log('Usuarios creados: admin@cinema.com, client@cinema.com');

  // 2. Crear Películas con pósteres e información completa
  console.log('Creando películas...');
  const movie1 = movieRepository.create({
    title: 'Interstellar',
    synopsis: 'Un equipo de exploradores viaja a través de un agujero de gusano en el espacio en un intento por asegurar la supervivencia de la humanidad.',
    genre: MovieGenre.SCIENCE_FICTION,
    durationMinutes: 169,
    rating: MovieRating.ALL_AGES,
    posterUrl: '/uploads/posters/interstellar.png',
  });

  const movie2 = movieRepository.create({
    title: 'The Dark Knight',
    synopsis: 'Cuando la amenaza conocida como el Joker causa estragos y caos en Gotham, Batman debe aceptar uno de los mayores desafíos psicológicos y físicos para luchar contra la injusticia.',
    genre: MovieGenre.ACTION,
    durationMinutes: 152,
    rating: MovieRating.AGE_14,
    posterUrl: '/uploads/posters/dark_knight.png',
  });

  const movie3 = movieRepository.create({
    title: 'Inside Out 2',
    synopsis: 'Regresa a la mente de la recién estrenada adolescente Riley justo cuando el cuartel general está sufriendo una repentina demolición para hacer espacio a algo totalmente inesperado: ¡nuevas emociones!',
    genre: MovieGenre.ANIMATION,
    durationMinutes: 96,
    rating: MovieRating.ALL_AGES,
    posterUrl: '/uploads/posters/inside_out_2.png',
  });

  const savedMovies = await movieRepository.save([movie1, movie2, movie3]);
  console.log('Películas creadas e insertadas.');

  // 3. Crear Salas y Asientos de manera atómica
  console.log('Creando salas y butacas...');
  
  // Sala 1 - Premium (5 filas x 8 columnas = 40 asientos)
  const room1 = roomRepository.create({
    name: 'Sala 1 - Premium 2D',
    rows: 5,
    columns: 8,
    capacity: 40,
  });
  const savedRoom1 = await roomRepository.save(room1);

  const seatsRoom1: Seat[] = [];
  for (let r = 0; r < savedRoom1.rows; r++) {
    const rowLabel = String.fromCharCode(65 + r);
    for (let c = 1; c <= savedRoom1.columns; c++) {
      seatsRoom1.push(
        seatRepository.create({
          roomId: savedRoom1.id,
          rowLabel,
          columnNumber: c,
          code: `${rowLabel}${c}`,
        })
      );
    }
  }
  await seatRepository.save(seatsRoom1);

  // Sala 2 - IMAX (6 filas x 10 columnas = 60 asientos)
  const room2 = roomRepository.create({
    name: 'Sala 2 - IMAX 3D',
    rows: 6,
    columns: 10,
    capacity: 60,
  });
  const savedRoom2 = await roomRepository.save(room2);

  const seatsRoom2: Seat[] = [];
  for (let r = 0; r < savedRoom2.rows; r++) {
    const rowLabel = String.fromCharCode(65 + r);
    for (let c = 1; c <= savedRoom2.columns; c++) {
      seatsRoom2.push(
        seatRepository.create({
          roomId: savedRoom2.id,
          rowLabel,
          columnNumber: c,
          code: `${rowLabel}${c}`,
        })
      );
    }
  }
  await seatRepository.save(seatsRoom2);
  console.log('Salas y asientos creados.');

  // 4. Crear Funciones (Showtimes) en el futuro (para que se muestren en cartelera)
  console.log('Programando funciones...');
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Función 1: Interstellar (169 mins) en Sala 1 - Premium
  const showtime1Starts = new Date(tomorrow);
  showtime1Starts.setHours(18, 0, 0, 0);
  const showtime1Ends = new Date(showtime1Starts);
  showtime1Ends.setMinutes(showtime1Ends.getMinutes() + savedMovies[0].durationMinutes);

  const showtime1 = showtimeRepository.create({
    startsAt: showtime1Starts,
    endsAt: showtime1Ends,
    movieId: savedMovies[0].id,
    roomId: savedRoom1.id,
    price: 45.00,
    currency: 'BOB',
  });

  // Función 2: The Dark Knight (152 mins) en Sala 2 - IMAX
  const showtime2Starts = new Date(tomorrow);
  showtime2Starts.setHours(20, 0, 0, 0);
  const showtime2Ends = new Date(showtime2Starts);
  showtime2Ends.setMinutes(showtime2Ends.getMinutes() + savedMovies[1].durationMinutes);

  const showtime2 = showtimeRepository.create({
    startsAt: showtime2Starts,
    endsAt: showtime2Ends,
    movieId: savedMovies[1].id,
    roomId: savedRoom2.id,
    price: 55.00,
    currency: 'BOB',
  });

  // Función 3: Inside Out 2 (96 mins) en Sala 1 - Premium (anterior a Interstellar, sin solapamiento)
  const showtime3Starts = new Date(tomorrow);
  showtime3Starts.setHours(15, 0, 0, 0);
  const showtime3Ends = new Date(showtime3Starts);
  showtime3Ends.setMinutes(showtime3Ends.getMinutes() + savedMovies[2].durationMinutes);

  const showtime3 = showtimeRepository.create({
    startsAt: showtime3Starts,
    endsAt: showtime3Ends,
    movieId: savedMovies[2].id,
    roomId: savedRoom1.id,
    price: 30.00,
    currency: 'BOB',
  });

  await showtimeRepository.save([showtime1, showtime2, showtime3]);
  console.log('Funciones programadas con éxito.');

  await queryRunner.release();
  await AppDataSource.destroy();
  console.log('Proceso de carga de semillas finalizado.');
}

run().catch((err) => {
  console.error('Error al correr las semillas:', err);
  process.exit(1);
});
