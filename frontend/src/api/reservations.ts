const BASE = '/api/v1';

export async function createReservation(showtimeId: number, seatIds: number[]): Promise<any> {
  const token = localStorage.getItem('token');
  const res = await fetch(`${BASE}/reservations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ showtimeId, seatIds }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error('UNAUTHORIZED');
    }
    if (data.code === 'SEAT_ALREADY_RESERVED') {
      throw new Error('SEAT_ALREADY_RESERVED');
    }
    if (data.code === 'SHOWTIME_NOT_BOOKABLE') {
      throw new Error('SHOWTIME_NOT_BOOKABLE');
    }
    if (data.code === 'SHOWTIME_OR_SEAT_NOT_FOUND') {
      throw new Error('SHOWTIME_OR_SEAT_NOT_FOUND');
    }
    throw new Error(data.message || 'Error al procesar la reserva');
  }

  return data;
}

export async function fetchMyReservations(page = 1, limit = 20): Promise<any> {
  const token = localStorage.getItem('token');
  const res = await fetch(`${BASE}/reservations/my?page=${page}&limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    if (res.status === 401) {
      throw new Error('UNAUTHORIZED');
    }
    throw new Error('Error al cargar el historial de reservas');
  }
  return res.json();
}

export async function fetchReservationDetail(reservationId: number): Promise<any> {
  const token = localStorage.getItem('token');
  const res = await fetch(`${BASE}/reservations/${reservationId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    if (res.status === 401) {
      throw new Error('UNAUTHORIZED');
    }
    if (res.status === 404) {
      throw new Error('RESERVATION_NOT_FOUND');
    }
    throw new Error('Error al cargar los detalles de la reserva');
  }
  return res.json();
}
