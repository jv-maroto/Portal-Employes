import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import PrivateRoute from '../components/PrivateRoute';

const renderWithRouter = (initialRoute, token) => {
  if (token) {
    localStorage.setItem('access_token', token);
  } else {
    localStorage.removeItem('access_token');
  }

  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <div>Dashboard Content</div>
            </PrivateRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  );
};

afterEach(() => {
  localStorage.clear();
});

describe('PrivateRoute', () => {
  test('redirige a login si no hay token', () => {
    renderWithRouter('/dashboard', null);
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Dashboard Content')).not.toBeInTheDocument();
  });

  test('renderiza el contenido protegido si hay token', () => {
    renderWithRouter('/dashboard', 'valid-token-123');
    expect(screen.getByText('Dashboard Content')).toBeInTheDocument();
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
  });

  test('redirige si el token es undefined string', () => {
    localStorage.setItem('access_token', '');
    renderWithRouter('/dashboard', null);
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });
});
