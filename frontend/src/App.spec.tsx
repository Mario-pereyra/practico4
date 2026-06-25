import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import App from './App';

test('renders App and shows brand logo and movies page', () => {
  render(<App />);
  
  // Verify brand logo exists by its link role
  const brandLogo = screen.getByRole('link', { name: /CineReservas/i });
  expect(brandLogo).toBeInTheDocument();

  // Verify Navbar navigation is present
  const navMovies = screen.getByRole('link', { name: /Cartelera/i });
  expect(navMovies).toBeInTheDocument();
});
