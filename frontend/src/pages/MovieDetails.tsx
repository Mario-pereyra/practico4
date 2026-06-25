import { useEffect, useState } from 'react';
import type { MovieDetail, MovieGenre, MovieRating } from '../types/movies';
import { fetchPublicMovieDetail } from '../api/movies';

const GENRE_LABELS: Record<MovieGenre, string> = {
  ACTION: 'Acción',
  COMEDY: 'Comedia',
  DRAMA: 'Drama',
  HORROR: 'Terror',
  SCIENCE_FICTION: 'Ciencia ficción',
  ANIMATION: 'Animación',
  DOCUMENTARY: 'Documental',
  THRILLER: 'Thriller',
  ROMANCE: 'Romance',
  OTHER: 'Otro',
};

const RATING_LABELS: Record<MovieRating, string> = {
  ALL_AGES: 'Apto todo público',
  AGE_14: 'Mayores de 14',
  R: 'Solo adultos',
};

const POSTER_FALLBACK = '🎬';

interface MovieDetailsPageProps {
  movieId: number;
}

export default function MovieDetailsPage({ movieId }: MovieDetailsPageProps) {
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchPublicMovieDetail(movieId);
        setMovie(data);
      } catch (err: any) {
        if (err.message === 'MOVIE_NOT_FOUND') {
          setError('La película solicitada no existe.');
        } else {
          setError('No se pudo cargar el detalle de la película. Intente nuevamente.');
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [movieId]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const formatted = new Intl.DateTimeFormat('es-BO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }).format(date);
    // Capitalize first letter
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('es-BO', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date);
  };

  if (loading) {
    return (
      <main className="container">
        <div className="state-center">
          <div className="spinner" role="status" aria-label="Cargando..." />
          <p>Cargando detalles de la película…</p>
        </div>
      </main>
    );
  }

  if (error || !movie) {
    return (
      <main className="container">
        <div className="state-center">
          <span className="icon">⚠️</span>
          <p>{error || 'Película no encontrada'}</p>
          <a href="/movies" className="btn btn-primary" style={{ marginTop: '12px' }}>
            Volver a la cartelera
          </a>
        </div>
      </main>
    );
  }

  const posterSrc = movie.posterUrl ? movie.posterUrl : null;

  return (
    <main className="container" style={{ padding: '40px 24px 80px' }}>
      {/* Back button */}
      <div style={{ marginBottom: '24px' }}>
        <a href="/movies" className="back-link">
          ← Volver a la cartelera
        </a>
      </div>

      <div className="movie-detail-grid">
        {/* Poster column */}
        <div className="movie-detail__poster-wrapper">
          {posterSrc && !imgError ? (
            <img
              src={posterSrc}
              alt={`Póster de ${movie.title}`}
              onError={() => setImgError(true)}
              className="movie-detail__poster-img"
            />
          ) : (
            <div className="movie-detail__poster-placeholder">{POSTER_FALLBACK}</div>
          )}
        </div>

        {/* Info column */}
        <div className="movie-detail__info">
          <h1 className="movie-detail__title">{movie.title}</h1>
          
          <div className="movie-detail__badges" style={{ marginTop: '12px', marginBottom: '24px' }}>
            <span className="badge badge-genre">{GENRE_LABELS[movie.genre] ?? movie.genre}</span>
            <span className="badge badge-rating">{RATING_LABELS[movie.rating] ?? movie.rating}</span>
            <span className="badge badge-dur">⏱ {movie.durationMinutes} min</span>
          </div>

          <div className="movie-detail__synopsis-section">
            <h2>Sinopsis</h2>
            <p className="movie-detail__synopsis">{movie.synopsis}</p>
          </div>

          {/* Showtimes section */}
          <div className="movie-detail__showtimes-section" style={{ marginTop: '40px' }}>
            <h2>Funciones Disponibles</h2>
            {movie.showtimes.length === 0 ? (
              <div className="no-showtimes-box">
                <p>No hay funciones programadas para los próximos días.</p>
              </div>
            ) : (
              <div className="showtimes-list" style={{ marginTop: '16px' }}>
                {movie.showtimes.map((st) => (
                  <div key={st.id} className="showtime-card">
                    <div className="showtime-card__details">
                      <div className="showtime-card__date">
                        🗓 {formatDate(st.startsAt)}
                      </div>
                      <div className="showtime-card__time-room">
                        <span className="showtime-card__time">
                          🕒 {formatTime(st.startsAt)} - {formatTime(st.endsAt)}
                        </span>
                        <span className="showtime-card__separator">·</span>
                        <span className="showtime-card__room">
                          🚪 {st.room.name}
                        </span>
                      </div>
                    </div>
                    <div className="showtime-card__action">
                      <div className="showtime-card__price">
                        {st.price.toFixed(2)} {st.currency}
                      </div>
                      <a href={`/showtimes/${st.id}/seats`} className="btn btn-primary btn-sm">
                        Reservar Asientos
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
