export type MovieGenre =
  | 'ACTION' | 'COMEDY' | 'DRAMA' | 'HORROR'
  | 'SCIENCE_FICTION' | 'ANIMATION' | 'DOCUMENTARY'
  | 'THRILLER' | 'ROMANCE' | 'OTHER';

export type MovieRating = 'ALL_AGES' | 'AGE_14' | 'R';

export interface MovieSummary {
  id: number;
  title: string;
  genre: MovieGenre;
  durationMinutes: number;
  rating: MovieRating;
  posterUrl: string;
}

export interface PageMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface PaginatedMoviesResponse {
  items: MovieSummary[];
  meta: PageMeta;
}

export interface PublicMoviesParams {
  search?: string;
  genre?: MovieGenre;
  rating?: MovieRating;
  page?: number;
  limit?: number;
}

export interface RoomPublicSummary {
  id: number;
  name: string;
}

export interface PublicShowtime {
  id: number;
  startsAt: string;
  endsAt: string;
  price: number;
  currency: string;
  room: RoomPublicSummary;
}

export interface MovieDetail extends MovieSummary {
  synopsis: string;
  showtimes: PublicShowtime[];
}
