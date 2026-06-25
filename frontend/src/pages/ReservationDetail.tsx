import { useEffect, useState } from 'react';
import { fetchReservationDetail } from '../api/reservations';

interface ReservationDetail {
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

interface ReservationDetailPageProps {
  reservationId: number;
}

export default function ReservationDetailPage({ reservationId }: ReservationDetailPageProps) {
  const [reservation, setReservation] = useState<ReservationDetail | null>(null);
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
        const data = await fetchReservationDetail(reservationId);
        setReservation(data);
      } catch (err: any) {
        if (err.message === 'UNAUTHORIZED') {
          localStorage.removeItem('token');
          window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
        } else if (err.message === 'RESERVATION_NOT_FOUND') {
          setError('La reserva solicitada no existe o no pertenece a tu usuario.');
        } else {
          setError('No se pudo cargar el detalle de la reserva. Intente de nuevo.');
        }
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [reservationId]);

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
          <p>Cargando detalles de tu reserva...</p>
        </div>
      </main>
    );
  }

  if (error || !reservation) {
    return (
      <main className="container">
        <div className="state-center">
          <span className="icon">⚠️</span>
          <p>{error || 'Reserva no encontrada'}</p>
          <a href="/my-reservations" className="btn btn-primary" style={{ marginTop: '12px' }}>
            Volver a mis reservas
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="container" style={{ padding: '40px 24px 80px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: '100%', maxWidth: '600px', alignSelf: 'center', marginBottom: '24px' }}>
        <a href="/my-reservations" className="back-link">
          ← Volver a mis reservas
        </a>
      </div>

      <div className="summary-card" style={{ width: '100%', maxWidth: '600px', alignSelf: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '16px' }}>
          <div>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 600, letterSpacing: '1px' }}>
              Reserva Confirmada
            </span>
            <h1 style={{ fontSize: '24px', fontWeight: 800, marginTop: '4px' }}>Ticket #{reservation.id}</h1>
          </div>
          <div style={{ textAlign: 'right', fontSize: '12px', color: 'var(--text-muted)' }}>
            <div>Fecha de compra</div>
            <div style={{ fontWeight: 600, color: 'var(--text-h)', marginTop: '2px' }}>
              {new Date(reservation.reservedAt).toLocaleDateString('es-BO')}
            </div>
          </div>
        </div>

        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-h)', marginBottom: '4px' }}>
            {reservation.showtime.movieTitle}
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
            Función programada en {reservation.showtime.roomName}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: 'var(--bg)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginBottom: '24px' }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Fecha</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-h)', marginTop: '4px' }}>
                🗓 {formatDate(reservation.showtime.startsAt)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Horario</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-h)', marginTop: '4px' }}>
                🕒 {formatTime(reservation.showtime.startsAt)} - {formatTime(reservation.showtime.endsAt)}
              </div>
            </div>
          </div>

          <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-h)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Detalle de Asientos
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
            {reservation.seats.map((seat) => (
              <div key={seat.seatId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-h)' }}>
                  Asiento {seat.code} (Fila {seat.rowLabel}, Columna {seat.columnNumber})
                </span>
                <span>
                  {seat.unitPrice.toFixed(2)} {reservation.currency}
                </span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '20px', marginBottom: '12px' }}>
            <span style={{ fontSize: '16px', fontWeight: 600 }}>Total pagado:</span>
            <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--success)' }}>
              {reservation.total.toFixed(2)} {reservation.currency}
            </span>
          </div>
        </div>

        <button
          onClick={() => window.print()}
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '12px', padding: '12px' }}
        >
          🖨️ Imprimir Ticket / PDF
        </button>
      </div>
    </main>
  );
}
