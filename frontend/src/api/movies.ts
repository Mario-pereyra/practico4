import type { PaginatedMoviesResponse, PublicMoviesParams, MovieDetail } from '../types/movies';

import { API_BASE_URL } from './config';

const BASE = API_BASE_URL;

export async function fetchPublicMovies(params: PublicMoviesParams = {}): Promise<PaginatedMoviesResponse> {
  const query = new URLSearchParams();
  if (params.search)  query.set('search', params.search);
  if (params.genre)   query.set('genre', params.genre);
  if (params.rating)  query.set('rating', params.rating);
  if (params.page)    query.set('page', String(params.page));
  if (params.limit)   query.set('limit', String(params.limit));

  const res = await fetch(`${BASE}/movies?${query}`);
  if (!res.ok) throw new Error('Error al cargar la cartelera');
  return res.json();
}

export async function fetchPublicMovieDetail(movieId: number): Promise<MovieDetail> {
  const res = await fetch(`${BASE}/movies/${movieId}`);
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error('MOVIE_NOT_FOUND');
    }
    throw new Error('Error al cargar el detalle de la película');
  }
  return res.json();
}
