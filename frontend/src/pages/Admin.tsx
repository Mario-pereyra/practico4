import { useEffect, useState } from 'react';

// Types
interface Movie {
  id: number;
  title: string;
  synopsis: string;
  genre: string;
  durationMinutes: number;
  rating: string;
  posterUrl: string;
}

interface Room {
  id: number;
  name: string;
  rows: number;
  columns: number;
  capacity: number;
}

interface Showtime {
  id: number;
  startsAt: string;
  endsAt: string;
  price: number;
  currency: string;
  movieId: number;
  roomId: number;
  movie?: { title: string };
  room?: { name: string };
}

export default function AdminPage() {
  const token = localStorage.getItem('token');

  // Check role
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  if (!token || user?.role !== 'ADMIN') {
    window.location.href = '/';
    return null;
  }

  const [activeTab, setActiveTab] = useState<'movies' | 'rooms' | 'showtimes'>('movies');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Forms Visibility
  const [showMovieForm, setShowMovieForm] = useState(false);
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [showShowtimeForm, setShowShowtimeForm] = useState(false);

  // Edit IDs
  const [editingMovieId, setEditingMovieId] = useState<number | null>(null);
  const [editingRoomId, setEditingRoomId] = useState<number | null>(null);
  const [editingShowtimeId, setEditingShowtimeId] = useState<number | null>(null);

  // Movie Form State
  const [mTitle, setMTitle] = useState('');
  const [mSynopsis, setMSynopsis] = useState('');
  const [mGenre, setMGenre] = useState('ACTION');
  const [mDuration, setMDuration] = useState(120);
  const [mRating, setMRating] = useState('ALL_AGES');
  const [mPosterFile, setMPosterFile] = useState<File | null>(null);

  // Room Form State
  const [rName, setRName] = useState('');
  const [rRows, setRRows] = useState(5);
  const [rColumns, setRColumns] = useState(8);

  // Showtime Form State
  const [sMovieId, setSMovieId] = useState('');
  const [sRoomId, setSRoomId] = useState('');
  const [sStartsAt, setSStartsAt] = useState('');
  const [sPrice, setSPrice] = useState(40);

  // Fetch Data
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      // Movies
      const mRes = await fetch('/api/v1/admin/movies?limit=100', { headers });
      const mData = await mRes.json();
      setMovies(mData.items || []);

      // Rooms
      const rRes = await fetch('/api/v1/admin/rooms', { headers });
      const rData = await rRes.json();
      setRooms(rData || []);

      // Showtimes
      const sRes = await fetch('/api/v1/admin/showtimes', { headers });
      const sData = await sRes.json();
      setShowtimes(sData || []);
    } catch (err: any) {
      setError('Error al conectar con la base de datos de administración.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const clearMessages = () => {
    setError(null);
    setSuccessMsg(null);
  };

  // Movie Actions
  const handleMovieSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', mTitle);
      formData.append('synopsis', mSynopsis);
      formData.append('genre', mGenre);
      formData.append('durationMinutes', mDuration.toString());
      formData.append('rating', mRating);
      if (mPosterFile) {
        formData.append('poster', mPosterFile);
      }

      const method = editingMovieId ? 'PUT' : 'POST';
      const url = editingMovieId ? `/api/v1/admin/movies/${editingMovieId}` : '/api/v1/admin/movies';

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al guardar la película');

      setSuccessMsg(`Película ${editingMovieId ? 'actualizada' : 'creada'} correctamente.`);
      setShowMovieForm(false);
      setEditingMovieId(null);
      // Reset form
      setMTitle('');
      setMSynopsis('');
      setMGenre('ACTION');
      setMDuration(120);
      setMRating('ALL_AGES');
      setMPosterFile(null);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Error en la petición de películas.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditMovie = (movie: Movie) => {
    clearMessages();
    setEditingMovieId(movie.id);
    setMTitle(movie.title);
    setMSynopsis(movie.synopsis);
    setMGenre(movie.genre);
    setMDuration(movie.durationMinutes);
    setMRating(movie.rating);
    setMPosterFile(null);
    setShowMovieForm(true);
  };

  const handleDeleteMovie = async (id: number) => {
    if (!window.confirm('¿Está seguro de eliminar esta película?')) return;
    clearMessages();
    setLoading(true);

    try {
      const res = await fetch(`/api/v1/admin/movies/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'No se pudo eliminar la película.');
      }

      setSuccessMsg('Película eliminada correctamente.');
      fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Room Actions
  const handleRoomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);

    try {
      const body = { name: rName, rows: Number(rRows), columns: Number(rColumns) };
      const method = editingRoomId ? 'PUT' : 'POST';
      const url = editingRoomId ? `/api/v1/admin/rooms/${editingRoomId}` : '/api/v1/admin/rooms';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al guardar la sala');

      setSuccessMsg(`Sala ${editingRoomId ? 'actualizada' : 'creada'} correctamente.`);
      setShowRoomForm(false);
      setEditingRoomId(null);
      setRName('');
      setRRows(5);
      setRColumns(8);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditRoom = (room: Room) => {
    clearMessages();
    setEditingRoomId(room.id);
    setRName(room.name);
    setRRows(room.rows);
    setRColumns(room.columns);
    setShowRoomForm(true);
  };

  const handleDeleteRoom = async (id: number) => {
    if (!window.confirm('¿Está seguro de eliminar esta sala?')) return;
    clearMessages();
    setLoading(true);

    try {
      const res = await fetch(`/api/v1/admin/rooms/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'No se pudo eliminar la sala.');
      }

      setSuccessMsg('Sala eliminada correctamente.');
      fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Showtime Actions
  const handleShowtimeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);

    try {
      // Map local date format to ISO
      const isoStartsAt = new Date(sStartsAt).toISOString();
      const body = {
        movieId: Number(sMovieId),
        roomId: Number(sRoomId),
        startsAt: isoStartsAt,
        price: Number(sPrice),
      };

      const method = editingShowtimeId ? 'PUT' : 'POST';
      const url = editingShowtimeId ? `/api/v1/admin/showtimes/${editingShowtimeId}` : '/api/v1/admin/showtimes';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        // Handle validation or overlapping error
        if (data.code === 'SHOWTIME_OVERLAP') {
          throw new Error('Solapamiento de funciones: Ya existe otra función en esa sala en el rango de tiempo calculado.');
        }
        if (data.code === 'SHOWTIME_MUST_BE_FUTURE') {
          throw new Error('La función debe ser programada en una fecha y hora futura.');
        }
        throw new Error(data.message || 'Error al guardar la función');
      }

      setSuccessMsg(`Función ${editingShowtimeId ? 'actualizada' : 'programada'} correctamente.`);
      setShowShowtimeForm(false);
      setEditingShowtimeId(null);
      setSMovieId('');
      setSRoomId('');
      setSStartsAt('');
      setSPrice(40);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditShowtime = (st: Showtime) => {
    clearMessages();
    setEditingShowtimeId(st.id);
    setSMovieId(st.movieId.toString());
    setSRoomId(st.roomId.toString());

    // Format ISO string to datetime-local compatible format (YYYY-MM-DDThh:mm)
    const date = new Date(st.startsAt);
    const tzOffset = date.getTimezoneOffset() * 60000;
    const localISOTime = new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);

    setSStartsAt(localISOTime);
    setSPrice(st.price);
    setShowShowtimeForm(true);
  };

  const handleDeleteShowtime = async (id: number) => {
    if (!window.confirm('¿Está seguro de eliminar esta función?')) return;
    clearMessages();
    setLoading(true);

    try {
      const res = await fetch(`/api/v1/admin/showtimes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'No se pudo eliminar la función.');
      }

      setSuccessMsg('Función eliminada correctamente.');
      fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatLocalDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString('es-BO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  return (
    <main className="container" style={{ padding: '40px 24px 80px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '32px', letterSpacing: '-0.5px' }}>Panel de Administración</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Gestiona películas, salas y funciones disponibles</p>
        </div>
        {loading && <div className="spinner" style={{ width: '24px', height: '24px' }} />}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '1px', marginBottom: '24px' }}>
        <button
          onClick={() => { setActiveTab('movies'); clearMessages(); }}
          className={`btn ${activeTab === 'movies' ? 'btn-primary' : ''}`}
          style={{ padding: '8px 16px', background: activeTab !== 'movies' ? 'transparent' : undefined, border: activeTab !== 'movies' ? '1px solid var(--border)' : undefined }}
        >
          🎬 Películas
        </button>
        <button
          onClick={() => { setActiveTab('rooms'); clearMessages(); }}
          className={`btn ${activeTab === 'rooms' ? 'btn-primary' : ''}`}
          style={{ padding: '8px 16px', background: activeTab !== 'rooms' ? 'transparent' : undefined, border: activeTab !== 'rooms' ? '1px solid var(--border)' : undefined }}
        >
          🚪 Salas
        </button>
        <button
          onClick={() => { setActiveTab('showtimes'); clearMessages(); }}
          className={`btn ${activeTab === 'showtimes' ? 'btn-primary' : ''}`}
          style={{ padding: '8px 16px', background: activeTab !== 'showtimes' ? 'transparent' : undefined, border: activeTab !== 'showtimes' ? '1px solid var(--border)' : undefined }}
        >
          🕒 Funciones
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.25)', color: '#fca5a5', borderRadius: 'var(--radius-sm)', fontSize: '13px', marginBottom: '20px' }}>
          ⚠️ {error}
        </div>
      )}
      {successMsg && (
        <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.25)', color: '#a7f3d0', borderRadius: 'var(--radius-sm)', fontSize: '13px', marginBottom: '20px' }}>
          ✅ {successMsg}
        </div>
      )}

      {/* --- TAB MOVIES --- */}
      {activeTab === 'movies' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '20px' }}>Listado de Películas</h2>
            {!showMovieForm && (
              <button onClick={() => { clearMessages(); setEditingMovieId(null); setShowMovieForm(true); }} className="btn btn-primary btn-sm">
                + Agregar Película
              </button>
            )}
          </div>

          {showMovieForm && (
            <div className="summary-card" style={{ marginBottom: '32px', padding: '24px', background: 'var(--bg-card)', borderRadius: 'var(--radius)' }}>
              <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>{editingMovieId ? 'Editar Película' : 'Crear Película'}</h3>
              <form onSubmit={handleMovieSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600 }}>Título</label>
                    <input type="text" required value={mTitle} onChange={(e) => setMTitle(e.target.value)} placeholder="Ej. Inception" style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px', color: '#fff' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600 }}>Género</label>
                    <select value={mGenre} onChange={(e) => setMGenre(e.target.value)} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px', color: '#fff' }}>
                      <option value="ACTION">Acción</option>
                      <option value="COMEDY">Comedia</option>
                      <option value="DRAMA">Drama</option>
                      <option value="HORROR">Terror</option>
                      <option value="SCIENCE_FICTION">Ciencia ficción</option>
                      <option value="ANIMATION">Animación</option>
                      <option value="DOCUMENTARY">Documental</option>
                      <option value="THRILLER">Thriller</option>
                      <option value="ROMANCE">Romance</option>
                      <option value="OTHER">Otro</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600 }}>Sinopsis</label>
                  <textarea required rows={3} value={mSynopsis} onChange={(e) => setMSynopsis(e.target.value)} placeholder="Escriba el resumen de la película..." style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px', color: '#fff', fontFamily: 'inherit', resize: 'vertical' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600 }}>Duración (minutos)</label>
                    <input type="number" required min={1} value={mDuration} onChange={(e) => setMDuration(Number(e.target.value))} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px', color: '#fff' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600 }}>Clasificación de edad</label>
                    <select value={mRating} onChange={(e) => setMRating(e.target.value)} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px', color: '#fff' }}>
                      <option value="ALL_AGES">Apto todo público (ALL_AGES)</option>
                      <option value="AGE_14">Mayores de 14 años (AGE_14)</option>
                      <option value="R">Solo adultos (R)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600 }}>Archivo del Póster {editingMovieId && '(Opcional si no cambia)'}</label>
                  <input type="file" accept="image/*" required={!editingMovieId} onChange={(e) => setMPosterFile(e.target.files?.[0] || null)} style={{ color: 'var(--text-muted)', fontSize: '13px' }} />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                  <button type="submit" className="btn btn-primary btn-sm">Guardar Película</button>
                  <button type="button" onClick={() => { setShowMovieForm(false); setEditingMovieId(null); }} className="btn btn-sm" style={{ background: 'transparent', border: '1px solid var(--border)' }}>Cancelar</button>
                </div>
              </form>
            </div>
          )}

          {movies.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No hay películas cargadas en el sistema.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--text-h)' }}>Póster</th>
                    <th style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--text-h)' }}>Título</th>
                    <th style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--text-h)' }}>Género</th>
                    <th style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--text-h)' }}>Duración</th>
                    <th style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--text-h)' }}>Clasificación</th>
                    <th style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--text-h)', textAlign: 'right' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {movies.map((m) => (
                    <tr key={m.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                      <td style={{ padding: '12px 16px' }}>
                        {m.posterUrl ? (
                          <img src={m.posterUrl} alt={m.title} style={{ width: '40px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                        ) : (
                          '🎬'
                        )}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-h)' }}>{m.title}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span className="badge badge-genre" style={{ padding: '2px 8px', fontSize: '10px' }}>{m.genre}</span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>{m.durationMinutes} min</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span className="badge badge-rating" style={{ padding: '2px 8px', fontSize: '10px' }}>{m.rating}</span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <button onClick={() => handleEditMovie(m)} className="btn btn-sm" style={{ padding: '6px 12px', marginRight: '8px', fontSize: '12px', background: 'rgba(255,255,255,0.05)' }}>Editar</button>
                        <button onClick={() => handleDeleteMovie(m.id)} className="btn btn-sm" style={{ padding: '6px 12px', fontSize: '12px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}>Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* --- TAB ROOMS --- */}
      {activeTab === 'rooms' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '20px' }}>Listado de Salas</h2>
            {!showRoomForm && (
              <button onClick={() => { clearMessages(); setEditingRoomId(null); setShowRoomForm(true); }} className="btn btn-primary btn-sm">
                + Agregar Sala
              </button>
            )}
          </div>

          {showRoomForm && (
            <div className="summary-card" style={{ marginBottom: '32px', padding: '24px', background: 'var(--bg-card)', borderRadius: 'var(--radius)' }}>
              <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>{editingRoomId ? 'Editar Sala' : 'Crear Sala'}</h3>
              <form onSubmit={handleRoomSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600 }}>Nombre de la Sala</label>
                  <input type="text" required value={rName} onChange={(e) => setRName(e.target.value)} placeholder="Ej. Sala 1 - IMAX" style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px', color: '#fff' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600 }}>Filas (A-Z, max 26)</label>
                    <input type="number" required min={1} max={26} value={rRows} onChange={(e) => setRRows(Number(e.target.value))} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px', color: '#fff' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600 }}>Columnas (max 50)</label>
                    <input type="number" required min={1} max={50} value={rColumns} onChange={(e) => setRColumns(Number(e.target.value))} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px', color: '#fff' }} />
                  </div>
                </div>

                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Capacidad de la sala calculada: <strong style={{ color: 'var(--success)' }}>{rRows * rColumns}</strong> asientos.</p>

                <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                  <button type="submit" className="btn btn-primary btn-sm">Guardar Sala</button>
                  <button type="button" onClick={() => { setShowRoomForm(false); setEditingRoomId(null); }} className="btn btn-sm" style={{ background: 'transparent', border: '1px solid var(--border)' }}>Cancelar</button>
                </div>
              </form>
            </div>
          )}

          {rooms.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No hay salas creadas en el sistema.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--text-h)' }}>ID</th>
                    <th style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--text-h)' }}>Nombre de la Sala</th>
                    <th style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--text-h)' }}>Filas</th>
                    <th style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--text-h)' }}>Columnas</th>
                    <th style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--text-h)' }}>Capacidad</th>
                    <th style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--text-h)', textAlign: 'right' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.map((r) => (
                    <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                      <td style={{ padding: '12px 16px' }}>#{r.id}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-h)' }}>{r.name}</td>
                      <td style={{ padding: '12px 16px' }}>{r.rows}</td>
                      <td style={{ padding: '12px 16px' }}>{r.columns}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--success)' }}>{r.capacity} butacas</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <button onClick={() => handleEditRoom(r)} className="btn btn-sm" style={{ padding: '6px 12px', marginRight: '8px', fontSize: '12px', background: 'rgba(255,255,255,0.05)' }}>Editar</button>
                        <button onClick={() => handleDeleteRoom(r.id)} className="btn btn-sm" style={{ padding: '6px 12px', fontSize: '12px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}>Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* --- TAB SHOWTIMES --- */}
      {activeTab === 'showtimes' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '20px' }}>Listado de Funciones Programadas</h2>
            {!showShowtimeForm && (
              <button
                onClick={() => {
                  clearMessages();
                  setEditingShowtimeId(null);
                  if (movies.length > 0) setSMovieId(movies[0].id.toString());
                  if (rooms.length > 0) setSRoomId(rooms[0].id.toString());
                  setShowShowtimeForm(true);
                }}
                className="btn btn-primary btn-sm"
                disabled={movies.length === 0 || rooms.length === 0}
                title={movies.length === 0 || rooms.length === 0 ? 'Debe tener al menos una película y una sala creadas para programar funciones.' : ''}
              >
                + Programar Función
              </button>
            )}
          </div>

          {showShowtimeForm && (
            <div className="summary-card" style={{ marginBottom: '32px', padding: '24px', background: 'var(--bg-card)', borderRadius: 'var(--radius)' }}>
              <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>{editingShowtimeId ? 'Editar Función' : 'Programar Nueva Función'}</h3>
              <form onSubmit={handleShowtimeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600 }}>Película</label>
                    <select required value={sMovieId} onChange={(e) => setSMovieId(e.target.value)} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px', color: '#fff' }}>
                      {movies.map((m) => (
                        <option key={m.id} value={m.id}>{m.title} ({m.durationMinutes} min)</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600 }}>Sala</label>
                    <select required value={sRoomId} onChange={(e) => setSRoomId(e.target.value)} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px', color: '#fff' }}>
                      {rooms.map((r) => (
                        <option key={r.id} value={r.id}>{r.name} (Capacidad: {r.capacity})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600 }}>Fecha y Hora de Inicio</label>
                    <input type="datetime-local" required value={sStartsAt} onChange={(e) => setSStartsAt(e.target.value)} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px', color: '#fff', fontFamily: 'inherit' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600 }}>Precio de la Entrada (BOB)</label>
                    <input type="number" required min={1} step={0.5} value={sPrice} onChange={(e) => setSPrice(Number(e.target.value))} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px', color: '#fff' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                  <button type="submit" className="btn btn-primary btn-sm">Programar Función</button>
                  <button type="button" onClick={() => { setShowShowtimeForm(false); setEditingShowtimeId(null); }} className="btn btn-sm" style={{ background: 'transparent', border: '1px solid var(--border)' }}>Cancelar</button>
                </div>
              </form>
            </div>
          )}

          {showtimes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No hay funciones programadas en el sistema.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--text-h)' }}>Película</th>
                    <th style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--text-h)' }}>Sala</th>
                    <th style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--text-h)' }}>Fecha / Hora Inicio</th>
                    <th style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--text-h)' }}>Hora Fin (Calculado)</th>
                    <th style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--text-h)' }}>Precio</th>
                    <th style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--text-h)', textAlign: 'right' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {showtimes.map((st) => (
                    <tr key={st.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-h)' }}>
                        {st.movie?.title || `Película #${st.movieId}`}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {st.room?.name || `Sala #${st.roomId}`}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        🕒 {formatLocalDateTime(st.startsAt)}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        🕒 {new Date(st.endsAt).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit', hour12: false })}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--accent-2)' }}>
                        {st.price.toFixed(2)} {st.currency}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <button onClick={() => handleEditShowtime(st)} className="btn btn-sm" style={{ padding: '6px 12px', marginRight: '8px', fontSize: '12px', background: 'rgba(255,255,255,0.05)' }}>Editar</button>
                        <button onClick={() => handleDeleteShowtime(st.id)} className="btn btn-sm" style={{ padding: '6px 12px', fontSize: '12px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}>Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
