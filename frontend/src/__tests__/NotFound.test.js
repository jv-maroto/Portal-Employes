import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NotFound from '../pages/NotFound';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

afterEach(() => {
  mockNavigate.mockClear();
});

describe('NotFound (404)', () => {
  test('renderiza el codigo 404', () => {
    render(<MemoryRouter><NotFound /></MemoryRouter>);
    expect(screen.getByText('404')).toBeInTheDocument();
  });

  test('muestra mensaje de pagina no encontrada', () => {
    render(<MemoryRouter><NotFound /></MemoryRouter>);
    expect(screen.getByText('Página no encontrada')).toBeInTheDocument();
    expect(screen.getByText('La página que buscas no existe o ha sido movida.')).toBeInTheDocument();
  });

  test('boton volver navega hacia atras', () => {
    render(<MemoryRouter><NotFound /></MemoryRouter>);
    fireEvent.click(screen.getByText('Volver'));
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  test('boton ir al inicio navega al dashboard', () => {
    render(<MemoryRouter><NotFound /></MemoryRouter>);
    fireEvent.click(screen.getByText('Ir al inicio'));
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });
});
