import { useEffect, useState } from 'react';
import { fetchSeatMap } from '../api/showtimes';
import { createReservation } from '../api/reservations';

interface Seat {
  id: number;
  roomId: number;
  rowLabel: string;
  columnNumber: number;
  code: string;
  status: 'AVAILABLE' | 'RESERVED';
}

interface ShowtimeSeatMap {
  showtimeId: number;
  movie: {
    id: number;
    title: string;
    genre: string;
    durationMinutes: number;
    rating: string;
    posterUrl?: string;
  };
  room: {
    id: number;
    name: string;
    rows: number;
    columns: number;
    capacity: number;
  };
  startsAt: string;
  endsAt: string;
  price: number;
  currency: string;
  seats: Seat[];
}

interface SeatsSelectionPageProps {
  showtimeId: number;
}

export default function SeatsSelectionPage({ showtimeId }: SeatsSelectionPageProps) {
  const [data, setData] = useState<ShowtimeSeatMap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [confirming, setConfirming] = useState(false);
  const [reservationSuccess, setReservationSuccess] = useState<any | null>(null);

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
        const result = await fetchSeatMap(showtimeId);
        setData(result);
      } catch (err: any) {
        if (err.message === 'UNAUTHORIZED') {
          localStorage.removeItem('token');
          window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
        } else if (err.message === 'SHOWTIME_NOT_BOOKABLE') {
          setError('Esta función ya inició o no admite más reservas.');
        } else if (err.message === 'SHOWTIME_NOT_FOUND') {
          setError('La función solicitada no existe.');
        } else {
          setError('No se pudo cargar el mapa de asientos. Intente de nuevo.');
        }
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [showtimeId]);

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

  const handleSeatClick = (seat: Seat) => {
    if (seat.status === 'RESERVED') return;

    if (selectedSeats.some((s) => s.id === seat.id)) {
      setSelectedSeats(selectedSeats.filter((s) => s.id !== seat.id));
    } else {
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const handleConfirmReservation = async () => {
    if (selectedSeats.length === 0) return;
    setConfirming(true);
    setError(null);

    try {
      const seatIds = selectedSeats.map((s) => s.id);
      const res = await createReservation(showtimeId, seatIds);
      setReservationSuccess(res);
    } catch (err: any) {
      if (err.message === 'UNAUTHORIZED') {
        localStorage.removeItem('token');
        window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
      } else if (err.message === 'SEAT_ALREADY_RESERVED') {
        setError('Uno o más asientos acaban de ser reservados por otro usuario. Por favor selecciona otros asientos.');
        // Reload seat map to show new state
        const freshMap = await fetchSeatMap(showtimeId).catch(() => null);
        if (freshMap) setData(freshMap);
        setSelectedSeats([]);
      } else {
        setError(err.message || 'No se pudo confirmar la reserva. Intenta nuevamente.');
      }
    } finally {
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <main className="container">
        <div className="state-center">
          <div className="spinner" role="status" aria-label="Cargando..." />
          <p>Cargando mapa de asientos...</p>
        </div>
      </main>
    );
  }

  if (reservationSuccess) {
    return (
      <main className="container" style={{ padding: '80px 24px', display: 'flex', justifyContent: 'center' }}>
        <div className="summary-card" style={{ width: '100%', maxWidth: '500px', alignSelf: 'center', textAlign: 'center' }}>
          <span style={{ fontSize: '48px', color: 'var(--success)' }}>✓</span>
          <h1 className="summary-title" style={{ fontSize: '24px', borderBottom: 'none', paddingBottom: 0, marginBottom: '8px' }}>
            ¡Reserva Confirmada!
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
            Tu reserva con código #{reservationSuccess.id} se ha registrado exitosamente.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'var(--bg)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', textAlign: 'left', marginBottom: '24px' }}>
            <div className="summary-detail">
              <span>Película:</span>
              <span>{reservationSuccess.showtime.movieTitle}</span>
            </div>
            <div className="summary-detail">
              <span>Sala:</span>
              <span>{reservationSuccess.showtime.roomName}</span>
            </div>
            <div className="summary-detail">
              <span>Fecha y Hora:</span>
              <span>{formatTime(reservationSuccess.showtime.startsAt)} ({formatDate(reservationSuccess.showtime.startsAt)})</span>
            </div>
            <div className="summary-detail">
              <span>Asientos:</span>
              <span>{reservationSuccess.seats.map((s: any) => s.code).join(', ')}</span>
            </div>
            <div className="summary-detail" style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', marginTop: '4px' }}>
              <span>Total pagado:</span>
              <span style={{ color: 'var(--accent-2)', fontWeight: 700 }}>
                {reservationSuccess.total.toFixed(2)} {reservationSuccess.currency}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <a href="/movies" className="btn btn-secondary" style={{ flex: 1, padding: '12px' }}>
              Volver a la cartelera
            </a>
            <a href="/my-reservations" className="btn btn-primary" style={{ flex: 1, padding: '12px' }}>
              Mis Reservas
            </a>
          </div>
        </div>
      </main>
    );
  }

  if (error && !data) {
    return (
      <main className="container">
        <div className="state-center">
          <span className="icon">⚠️</span>
          <p>{error}</p>
          <a href="/movies" className="btn btn-primary" style={{ marginTop: '12px' }}>
            Volver a la cartelera
          </a>
        </div>
      </main>
    );
  }

  const dataNonNull = data!;

  // Group seats by rowLabel
  const groupedSeats: Record<string, Seat[]> = {};
  dataNonNull.seats.forEach((seat) => {
    if (!groupedSeats[seat.rowLabel]) {
      groupedSeats[seat.rowLabel] = [];
    }
    groupedSeats[seat.rowLabel].push(seat);
  });

  // Sort rows and columns
  const sortedRowKeys = Object.keys(groupedSeats).sort();
  sortedRowKeys.forEach((rowKey) => {
    groupedSeats[rowKey].sort((a, b) => a.columnNumber - b.columnNumber);
  });

  const totalToPay = selectedSeats.length * dataNonNull.price;

  return (
    <main className="container" style={{ padding: '40px 24px 80px' }}>
      <div style={{ marginBottom: '24px' }}>
        <a href={`/movies/${dataNonNull.movie.id}`} className="back-link">
          ← Volver al detalle de la película
        </a>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Selección de Asientos</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          {dataNonNull.movie.title} · {dataNonNull.room.name} · {formatDate(dataNonNull.startsAt)} a las {formatTime(dataNonNull.startsAt)}
        </p>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.25)', color: '#fca5a5', borderRadius: 'var(--radius-sm)', fontSize: '14px', marginBottom: '24px' }}>
          {error}
        </div>
      )}

      <div className="seat-layout">
        {/* Seating Map */}
        <div className="seating-area">
          <div className="screen-container">
            <div className="screen-line" />
            <div className="screen-text">Pantalla</div>
          </div>

          <div className="seating-grid">
            {sortedRowKeys.map((rowKey) => (
              <div key={rowKey} className="seating-row">
                <span className="row-label">{rowKey}</span>
                <div className="seats-list">
                  {groupedSeats[rowKey].map((seat) => {
                    const isSelected = selectedSeats.some((s) => s.id === seat.id);
                    const isReserved = seat.status === 'RESERVED';
                    const seatClass = isSelected
                      ? 'selected'
                      : isReserved
                      ? 'reserved'
                      : 'available';

                    return (
                      <button
                        key={seat.id}
                        onClick={() => handleSeatClick(seat)}
                        disabled={isReserved}
                        className={`seat-btn ${seatClass}`}
                        aria-label={`Asiento ${seat.code}, ${isReserved ? 'Reservado' : isSelected ? 'Seleccionado' : 'Disponible'}`}
                        title={`Asiento ${seat.code}`}
                      >
                        {seat.columnNumber}
                      </button>
                    );
                  })}
                </div>
                <span className="row-label">{rowKey}</span>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="legend">
            <div className="legend-item">
              <div className="legend-box available" />
              <span>Disponible</span>
            </div>
            <div className="legend-item">
              <div className="legend-box selected" />
              <span>Seleccionado</span>
            </div>
            <div className="legend-item">
              <div className="legend-box reserved" />
              <span>Ocupado</span>
            </div>
          </div>
        </div>

        {/* Purchase Summary */}
        <div className="summary-card">
          <h2 className="summary-title">Resumen de Compra</h2>
          
          <div className="summary-detail">
            <span>Película:</span>
            <span>{dataNonNull.movie.title}</span>
          </div>
          
          <div className="summary-detail">
            <span>Sala:</span>
            <span>{dataNonNull.room.name}</span>
          </div>

          <div className="summary-detail">
            <span>Fecha y Hora:</span>
            <span>{formatTime(dataNonNull.startsAt)} ({formatDate(dataNonNull.startsAt).split(' ')[1] + ' ' + formatDate(dataNonNull.startsAt).split(' ')[2]})</span>
          </div>

          <div className="summary-detail">
            <span>Precio Unitario:</span>
            <span>{dataNonNull.price.toFixed(2)} {dataNonNull.currency}</span>
          </div>

          <div className="summary-detail" style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
            <span>Asientos elegidos:</span>
            <span>
              {selectedSeats.length > 0
                ? selectedSeats.map((s) => s.code).join(', ')
                : 'Ninguno'}
            </span>
          </div>

          <div className="summary-total">
            <span>Total a pagar:</span>
            <span>{totalToPay.toFixed(2)} {dataNonNull.currency}</span>
          </div>

          <button
            onClick={handleConfirmReservation}
            disabled={selectedSeats.length === 0 || confirming}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '8px' }}
          >
            {confirming ? 'Reservando...' : 'Confirmar Reserva'}
          </button>
        </div>
      </div>
    </main>
  );
}
