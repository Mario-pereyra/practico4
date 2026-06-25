import './index.css'
import MoviesPage from './pages/Movies'
import MovieDetailsPage from './pages/MovieDetails'
import SeatsSelectionPage from './pages/SeatsSelection'
import LoginPage from './pages/Login'
import RegisterPage from './pages/Register'
import AdminPage from './pages/Admin'
import MyReservationsPage from './pages/MyReservations'
import ReservationDetailPage from './pages/ReservationDetail'

function Navbar() {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  return (
    <nav className="navbar" id="main-nav" role="navigation" aria-label="Navegación principal">
      <div className="container navbar__inner">
        <a href="/" className="navbar__brand" id="brand-logo">🎬 CineReservas</a>
        <div className="navbar__links" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <a href="/movies" id="nav-movies">Cartelera</a>
          {token && <a href="/my-reservations" id="nav-my-reservations">Mis Reservas</a>}
          {user?.role === 'ADMIN' && <a href="/admin" id="nav-admin" style={{ color: 'var(--accent-2)', fontWeight: 600 }}>Panel Admin</a>}
          {token ? (
            <>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>👤 {user?.email}</span>
              <a href="#" onClick={handleLogout} id="nav-logout" style={{ color: 'var(--danger)' }}>Cerrar sesión</a>
            </>
          ) : (
            <>
              <a href="/login" id="nav-login">Iniciar sesión</a>
              <a href="/register" id="nav-register" style={{ color: 'var(--accent)', fontWeight: 600 }}>Registrarse</a>
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
      <p>© {new Date().getFullYear()} CineReservas · Práctico 4 · Web II</p>
    </footer>
  )
}

export default function App() {
  // Simple client-side routing by pathname
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
      <div className="state-center">
        <span className="icon">🔍</span>
        <p>Página no encontrada</p>
        <a href="/" style={{ color: 'var(--accent)', fontWeight: 600 }}>Ir a la cartelera</a>
      </div>
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


