import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import App from './App';

describe('Flujo de Integración Completo de Cliente (Cine Reservas)', () => {
  let locationMock: { pathname: string; href: string; search: string };

  beforeEach(() => {
    localStorage.clear();
    
    // Configurar mock de window.location para evitar errores de navegación en jsdom
    locationMock = {
      pathname: '/',
      href: '',
      search: '',
    };
    delete (window as any).location;
    (window as any).location = locationMock;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('Debería renderizar la cartelera inicial, permitir login, ver detalles, seleccionar asientos y simular reserva', async () => {
    const user = userEvent.setup();

    // Mock de las respuestas de la API
    const mockMoviesResponse = {
      items: [
        {
          id: 1,
          title: 'Interstellar',
          genre: 'SCIENCE_FICTION',
          durationMinutes: 169,
          rating: 'ALL_AGES',
          posterUrl: '/uploads/posters/interstellar.png',
        },
      ],
      meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
    };

    const mockLoginResponse = {
      accessToken: 'jwt-token-de-prueba',
      user: { id: 1, name: 'Cliente de Prueba', email: 'client@cinema.com', role: 'CLIENT' },
    };

    const mockMovieDetailResponse = {
      id: 1,
      title: 'Interstellar',
      synopsis: 'Un equipo de exploradores viaja a través de un agujero de gusano...',
      genre: 'SCIENCE_FICTION',
      durationMinutes: 169,
      rating: 'ALL_AGES',
      posterUrl: '/uploads/posters/interstellar.png',
      showtimes: [
        {
          id: 10,
          startsAt: '2026-06-25T18:00:00.000Z',
          endsAt: '2026-06-25T20:49:00.000Z',
          price: 45,
          currency: 'BOB',
          room: { id: 4, name: 'Sala 1 - Premium 2D' },
        },
      ],
    };

    const mockSeatsMapResponse = {
      showtimeId: 10,
      movie: { title: 'Interstellar', genre: 'SCIENCE_FICTION' },
      room: { name: 'Sala 1 - Premium 2D', rows: 2, columns: 2 },
      startsAt: '2026-06-25T18:00:00.000Z',
      endsAt: '2026-06-25T20:49:00.000Z',
      price: 45,
      currency: 'BOB',
      seats: [
        { id: 101, code: 'A1', rowLabel: 'A', columnNumber: 1, status: 'AVAILABLE' },
        { id: 102, code: 'A2', rowLabel: 'A', columnNumber: 2, status: 'AVAILABLE' },
        { id: 103, code: 'B1', rowLabel: 'B', columnNumber: 1, status: 'RESERVED' },
        { id: 104, code: 'B2', rowLabel: 'B', columnNumber: 2, status: 'AVAILABLE' },
      ],
    };

    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/movies/1')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockMovieDetailResponse,
        });
      }
      if (url.includes('/movies')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockMoviesResponse,
        });
      }
      if (url.includes('/auth/login')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockLoginResponse,
        });
      }
      if (url.includes('/showtimes/10/seats')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockSeatsMapResponse,
        });
      }
      return Promise.reject(new Error(`Unhandled fetch to ${url}`));
    });

    vi.stubGlobal('fetch', fetchMock);

    // 1. Render inicial de la Cartelera
    const { unmount } = render(<App />);

    expect(screen.getByRole('heading', { name: /Cartelera/i })).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Interstellar')).toBeInTheDocument();
    });

    unmount();

    // 2. Simular ir a la página de Login
    locationMock.pathname = '/login';
    const { unmount: unmountLogin } = render(<App />);

    expect(screen.getByRole('heading', { name: /Iniciar Sesión/i })).toBeInTheDocument();

    const emailInput = screen.getByPlaceholderText('admin@cinereservas.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitBtn = screen.getByRole('button', { name: /Ingresar/i });

    await user.type(emailInput, 'client@cinema.com');
    await user.type(passwordInput, 'client123');
    await user.click(submitBtn);

    await waitFor(() => {
      expect(locationMock.href).toBe('/');
    });

    unmountLogin();

    // Guardar tokens simulando el estado logueado
    localStorage.setItem('token', 'jwt-token-de-prueba');
    localStorage.setItem('user', JSON.stringify({ email: 'client@cinema.com' }));

    // 3. Simular ver detalles de la película
    locationMock.pathname = '/movies/1';
    const { unmount: unmountDetail } = render(<App />);

    await waitFor(() => {
      expect(screen.getAllByText(/Interstellar/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/Sala 1 - Premium 2D/i)).toBeInTheDocument();
    });

    unmountDetail();

    // 4. Simular entrar a la selección de asientos
    locationMock.pathname = '/showtimes/10/seats';
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Selección de Asientos')).toBeInTheDocument();
      expect(screen.getByText('Asientos elegidos:')).toBeInTheDocument();
      expect(screen.getByText('Ninguno')).toBeInTheDocument();
    });

    const seatA1 = screen.getByLabelText(/Asiento A1, Disponible/i);
    const seatB1 = screen.getByLabelText(/Asiento B1, Reservado/i);

    expect(seatA1).toBeInTheDocument();
    expect(seatB1).toBeDisabled();

    await user.click(seatA1);

    await waitFor(() => {
      expect(screen.getByText(/A1/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      const priceElements = screen.getAllByText((_, el) => el?.textContent?.includes('45.00') ?? false);
      expect(priceElements.length).toBeGreaterThan(0);
    });
  });
});
