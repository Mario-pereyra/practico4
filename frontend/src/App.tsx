import MoviesPage from './pages/Movies'
import MovieDetailsPage from './pages/MovieDetails'
import SeatsSelectionPage from './pages/SeatsSelection'
import LoginPage from './pages/Login'
import RegisterPage from './pages/Register'
import AdminPage from './pages/Admin'
import MyReservationsPage from './pages/MyReservations'
import ReservationDetailPage from './pages/ReservationDetail'

interface StoredUser {
  email?: string;
  role?: string;
}

function getStoredUser(): StoredUser | null {
  const rawUser = localStorage.getItem('user');
  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser) as StoredUser;
  } catch {
    localStorage.removeItem('user');
    return null;
  }
}

function isActivePath(path: string, target: string) {
  if (target === '/movies') return path === '/' || path.startsWith('/movies');
  return path === target || path.startsWith(`${target}/`);
}

function Navbar() {
  const currentPath = window.location.pathname;
  const token = localStorage.getItem('token');
  const user = getStoredUser();

  const handleLogout = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  return (
    <nav className="navbar" id="main-nav" role="navigation" aria-label="Navegación principal">
      <div className="container navbar__inner">
        <a href="/" className="navbar__brand" id="brand-logo" aria-label="CineReservas - Inicio">
          <span className="navbar__brand-icon" aria-hidden="true">🎬</span>
          <span>CineReservas</span>
        </a>

        <div className="navbar__links">
          <a
            href="/movies"
            id="nav-movies"
            className={isActivePath(currentPath, '/movies') ? 'active' : undefined}
          >
            Cartelera
          </a>

          {token && (
            <a
              href="/my-reservations"
              id="nav-my-reservations"
              className={isActivePath(currentPath, '/my-reservations') ? 'active' : undefined}
            >
              Mis Reservas
            </a>
          )}

          {user?.role === 'ADMIN' && (
            <a
              href="/admin"
              id="nav-admin"
              className={`navbar__admin-link ${isActivePath(currentPath, '/admin') ? 'active' : ''}`}
            >
              Panel Admin
            </a>
          )}

          {token ? (
            <>
              {user?.email && <span className="navbar__user">👤 {user.email}</span>}
              <a href="/" onClick={handleLogout} id="nav-logout" className="navbar__logout">
                Cerrar sesión
              </a>
            </>
          ) : (
            <>
              <a
                href="/login"
                id="nav-login"
                className={isActivePath(currentPath, '/login') ? 'active' : undefined}
              >
                Iniciar sesión
              </a>
              <a href="/register" id="nav-register" className="navbar__cta">
                Registrarse
              </a>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

function Footer() {
  return (
    <footer className="footer" id="main-footer">
      <div className="container footer__inner">
        <p>© {new Date().getFullYear()} CineReservas · Práctico 4 · Web II</p>
        <span>Reservas claras, rápidas y seguras</span>
      </div>
    </footer>
  )
}

export default function App() {
  const path = window.location.pathname
  const movieDetailMatch = path.match(/^\/movies\/(\d+)$/)
  const seatsMatch = path.match(/^\/showtimes\/(\d+)\/seats$/)
  const reservationDetailMatch = path.match(/^\/my-reservations\/(\d+)$/)

  let page: React.ReactNode
  if (movieDetailMatch) {
    const movieId = parseInt(movieDetailMatch[1], 10)
    page = <MovieDetailsPage movieId={movieId} />
  } else if (seatsMatch) {
    const showtimeId = parseInt(seatsMatch[1], 10)
    page = <SeatsSelectionPage showtimeId={showtimeId} />
  } else if (reservationDetailMatch) {
    const reservationId = parseInt(reservationDetailMatch[1], 10)
    page = <ReservationDetailPage reservationId={reservationId} />
  } else if (path === '/my-reservations') {
    page = <MyReservationsPage />
  } else if (path === '/login') {
    page = <LoginPage />
  } else if (path === '/register') {
    page = <RegisterPage />
  } else if (path === '/admin') {
    page = <AdminPage />
  } else if (path === '/' || path === '/movies') {
    page = <MoviesPage />
  } else {
    page = (
      <main className="container">
        <div className="state-center state-center--card">
          <span className="icon">🔍</span>
          <h1>Página no encontrada</h1>
          <p>La ruta solicitada no existe dentro del sistema.</p>
          <a href="/" className="btn btn-primary">Ir a la cartelera</a>
        </div>
      </main>
    )
  }

  return (
    <>
      <Navbar />
      {page}
      <Footer />
    </>
  )
}
