import { useEffect, useState } from 'react';
import { fetchMyReservations } from '../api/reservations';

interface ReservationItem {
  id: number;
  showtime: {
    id: number;
    movieId: number;
    movieTitle: string;
    roomId: number;
    roomName: string;
    startsAt: string;
    endsAt: string;
    price: number;
    currency: string;
  };
  seats: {
    seatId: number;
    rowLabel: string;
    columnNumber: number;
    code: string;
    unitPrice: number;
  }[];
  reservedAt: string;
  total: number;
  currency: string;
}

export default function MyReservationsPage() {
  const [reservations, setReservations] = useState<ReservationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
      return;
    }

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchMyReservations();
        setReservations(data.items);
      } catch (err: any) {
        if (err.message === 'UNAUTHORIZED') {
          localStorage.removeItem('token');
          window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
        } else {
          setError('No se pudo cargar el historial de reservas. Intente de nuevo.');
        }
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const formatted = new Intl.DateTimeFormat('es-BO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }).format(date);
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
          <p>Cargando tus reservas...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="container" style={{ padding: '40px 24px 80px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Mis Reservas</h1>
        <p style={{ color: 'var(--text-muted)' }}>Historial de entradas compradas</p>
      </div>

      {error && (
        <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.25)', color: '#fca5a5', borderRadius: 'var(--radius)', fontSize: '14px', marginBottom: '24px' }}>
          {error}
        </div>
      )}

      {reservations.length === 0 ? (
        <div className="state-center" style={{ padding: '80px 24px', background: 'var(--bg-card)', border: '1px dashed var(--border)', borderRadius: 'var(--radius)' }}>
          <span style={{ fontSize: '48px' }}>🎟️</span>
          <p style={{ marginTop: '16px', marginBottom: '20px' }}>Aún no has realizado ninguna reserva.</p>
          <a href="/movies" className="btn btn-primary">
            Explorar Cartelera
          </a>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {reservations.map((res) => (
            <div key={res.id} className="showtime-card" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center' }}>
              <div style={{ flex: 1, minWidth: '240px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Código #{res.id}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Reservado el {new Date(res.reservedAt).toLocaleDateString('es-BO')}
                  </span>
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-h)', marginBottom: '8px' }}>
                  {res.showtime.movieTitle}
                </h3>
                <div className="showtime-card__time-room">
                  <span>🗓 {formatDate(res.showtime.startsAt)}</span>
                  <span>·</span>
                  <span>🕒 {formatTime(res.showtime.startsAt)} - {formatTime(res.showtime.endsAt)}</span>
                  <span>·</span>
                  <span style={{ color: 'var(--accent-2)' }}>🚪 {res.showtime.roomName}</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'left', minWidth: '100px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Asientos ({res.seats.length})</div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-h)', marginTop: '2px' }}>
                    {res.seats.map((s) => s.code).join(', ')}
                  </div>
                </div>

                <div style={{ textAlign: 'left', minWidth: '120px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Total Pagado</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--success)', marginTop: '2px' }}>
                    {res.total.toFixed(2)} {res.currency}
                  </div>
                </div>

                <a href={`/my-reservations/${res.id}`} className="btn btn-secondary btn-sm" style={{ padding: '10px 16px' }}>
                  Ver Detalle
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
