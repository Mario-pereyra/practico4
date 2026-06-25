import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Showtime } from '../../showtimes/entities/showtime.entity';

export enum MovieGenre {
  ACTION = 'ACTION',
  COMEDY = 'COMEDY',
  DRAMA = 'DRAMA',
  HORROR = 'HORROR',
  SCIENCE_FICTION = 'SCIENCE_FICTION',
  ANIMATION = 'ANIMATION',
  DOCUMENTARY = 'DOCUMENTARY',
  THRILLER = 'THRILLER',
  ROMANCE = 'ROMANCE',
  OTHER = 'OTHER',
}

export enum MovieRating {
  ALL_AGES = 'ALL_AGES',
  AGE_14 = 'AGE_14',
  R = 'R',
}

@Entity('movies')
export class Movie {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ length: 160 })
  title: string;

  @Column({ length: 2000 })
  synopsis: string;

  @Column({
    type: 'varchar',
    length: 20,
  })
  genre: MovieGenre;

  @Column({ name: 'duration_minutes', type: 'integer' })
  durationMinutes: number;

  @Column({
    type: 'varchar',
    length: 15,
  })
  rating: MovieRating;

  @Column({ name: 'poster_url', length: 255 })
  posterUrl: string;

  @OneToMany(() => Showtime, (showtime) => showtime.movie)
  showtimes: Showtime[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
