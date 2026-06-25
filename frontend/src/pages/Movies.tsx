import { useEffect, useRef, useState, useCallback } from 'react';
import type { MovieGenre, MovieRating, MovieSummary, PageMeta } from '../types/movies';
import { fetchPublicMovies } from '../api/movies';

// ─── Helpers ──────────────────────────────────────────────────────────────────
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
const LIMIT = 12;

// ─── Sub-components ───────────────────────────────────────────────────────────
function MovieCard({ movie }: { movie: MovieSummary }) {
  const [imgError, setImgError] = useState(false);
  const posterSrc = movie.posterUrl ? movie.posterUrl : null;

  return (
    <a href={`/movies/${movie.id}`} style={{ display: 'block', height: '100%', color: 'inherit', textDecoration: 'none' }}>
      <article className="movie-card" id={`movie-${movie.id}`}>
        <div className="movie-card__poster">
          {posterSrc && !imgError ? (
            <img
              src={posterSrc}
              alt={`Póster de ${movie.title}`}
              onError={() => setImgError(true)}
              loading="lazy"
            />
          ) : (
            <div className="movie-card__poster-placeholder">{POSTER_FALLBACK}</div>
          )}
        </div>
        <div className="movie-card__info">
          <p className="movie-card__title">{movie.title}</p>
          <div className="movie-card__badges">
            <span className="badge badge-genre">{GENRE_LABELS[movie.genre] ?? movie.genre}</span>
            <span className="badge badge-rating">{RATING_LABELS[movie.rating] ?? movie.rating}</span>
          </div>
          <p className="movie-card__dur">⏱ {movie.durationMinutes} min</p>
        </div>
      </article>
    </a>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function MoviesPage() {
  const [movies, setMovies]     = useState<MovieSummary[]>([]);
  const [meta, setMeta]         = useState<PageMeta | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  const [search, setSearch]     = useState('');
  const [genre, setGenre]       = useState<MovieGenre | ''>('');
  const [rating, setRating]     = useState<MovieRating | ''>('');
  const [page, setPage]         = useState(1);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async (
    s: string, g: MovieGenre | '', r: MovieRating | '', p: number
  ) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPublicMovies({
        search: s || undefined,
        genre:  g || undefined,
        rating: r || undefined,
        page: p,
        limit: LIMIT,
      });
      setMovies(data.items);
      setMeta(data.meta);
    } catch {
      setError('No se pudo cargar la cartelera. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      load(search, genre, rating, 1);
    }, 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search, genre, rating, load]);

  // Page change
  useEffect(() => {
    load(search, genre, rating, page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleGenre = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setGenre(e.target.value as MovieGenre | '');
    setPage(1);
  };

  const handleRating = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRating(e.target.value as MovieRating | '');
    setPage(1);
  };

  const totalPages = meta?.totalPages ?? 1;

  return (
    <>
      {/* ── Hero ─────────────────────────────────────── */}
      <section className="billboard-hero">
        <div className="container">
          <h1>
            Cartelera <span>Actual</span>
          </h1>
          <p>Descubrí las mejores películas en cartel y reservá tus asientos.</p>

          {/* ── Filters ─────────────────────────────── */}
          <div className="filter-bar">
            <input
              id="search-input"
              type="search"
              placeholder="🔍  Buscar película..."
              value={search}
              onChange={handleSearch}
              aria-label="Buscar película por título"
            />
            <select
              id="genre-filter"
              value={genre}
              onChange={handleGenre}
              aria-label="Filtrar por género"
            >
              <option value="">Todos los géneros</option>
              {(Object.keys(GENRE_LABELS) as MovieGenre[]).map((g) => (
                <option key={g} value={g}>{GENRE_LABELS[g]}</option>
              ))}
            </select>
            <select
              id="rating-filter"
              value={rating}
              onChange={handleRating}
              aria-label="Filtrar por clasificación"
            >
              <option value="">Todas las clasificaciones</option>
              {(Object.keys(RATING_LABELS) as MovieRating[]).map((r) => (
                <option key={r} value={r}>{RATING_LABELS[r]}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* ── Content ──────────────────────────────────── */}
      <main className="container">
        {loading && (
          <div className="state-center">
            <div className="spinner" role="status" aria-label="Cargando..." />
            <p>Cargando cartelera…</p>
          </div>
        )}

        {!loading && error && (
          <div className="state-center">
            <span className="icon">⚠️</span>
            <p>{error}</p>
            <button
              onClick={() => load(search, genre, rating, page)}
              style={{
                padding: '10px 24px',
                background: 'var(--accent)',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                color: '#fff',
                fontWeight: 600,
              }}
            >
              Reintentar
            </button>
          </div>
        )}

        {!loading && !error && movies.length === 0 && (
          <div className="state-center">
            <span className="icon">🎭</span>
            <p>No hay películas en cartelera con los filtros aplicados.</p>
          </div>
        )}

        {!loading && !error && movies.length > 0 && (
          <>
            <div className="movies-grid" id="movies-grid" role="list" aria-label="Cartelera de películas">
              {movies.map((m) => (
                <div key={m.id} role="listitem">
                  <MovieCard movie={m} />
                </div>
              ))}
            </div>

            {/* ── Pagination ──────────────────────── */}
            {totalPages > 1 && (
              <nav className="pagination" aria-label="Paginación">
                <button
                  id="prev-page"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  aria-label="Página anterior"
                >
                  ← Anterior
                </button>

                <span className="pagination__info">
                  Página {page} de {totalPages}
                </span>

                <button
                  id="next-page"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  aria-label="Página siguiente"
                >
                  Siguiente →
                </button>
              </nav>
            )}
          </>
        )}
      </main>
    </>
  );
}
