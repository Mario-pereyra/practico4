import { API_BASE_URL } from './config';

const BASE = API_BASE_URL;

export async function fetchSeatMap(showtimeId: number): Promise<any> {
  const token = localStorage.getItem('token');
  const res = await fetch(`${BASE}/showtimes/${showtimeId}/seats`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    if (res.status === 401) {
      throw new Error('UNAUTHORIZED');
    }
    if (res.status === 409) {
      const errData = await res.json().catch(() => ({}));
      if (errData.code === 'SHOWTIME_NOT_BOOKABLE') {
        throw new Error('SHOWTIME_NOT_BOOKABLE');
      }
    }
    if (res.status === 404) {
      throw new Error('SHOWTIME_NOT_FOUND');
    }
    throw new Error('Error al cargar el mapa de asientos');
  }
  return res.json();
}
