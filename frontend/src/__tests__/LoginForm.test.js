import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from '../components/auth/login-form';
import api from '../api';

jest.mock('../api');

const renderLogin = (onLogin = jest.fn()) => {
  return render(
    <MemoryRouter>
      <LoginPage onLogin={onLogin} />
    </MemoryRouter>
  );
};

afterEach(() => {
  localStorage.clear();
  jest.restoreAllMocks();
});

describe('LoginPage', () => {
  test('renderiza el formulario de login correctamente', () => {
    renderLogin();
    expect(screen.getByText('Portal Empleados')).toBeInTheDocument();
    expect(screen.getByLabelText('DNI')).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar sesion/i })).toBeInTheDocument();
  });

  test('permite escribir en los campos de DNI y contraseña', () => {
    renderLogin();
    const dniInput = screen.getByLabelText('DNI');
    const passwordInput = screen.getByLabelText('Contraseña');

    fireEvent.change(dniInput, { target: { value: '12345678A', name: 'dni' } });
    fireEvent.change(passwordInput, { target: { value: 'miPassword', name: 'password' } });

    expect(dniInput.value).toBe('12345678A');
    expect(passwordInput.value).toBe('miPassword');
  });

  test('muestra error con credenciales incorrectas', async () => {
    api.post.mockRejectedValueOnce(new Error('Unauthorized'));
    renderLogin();

    fireEvent.change(screen.getByLabelText('DNI'), { target: { value: '00000000X', name: 'dni' } });
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'wrong', name: 'password' } });
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesion/i }));

    await waitFor(() => {
      expect(screen.getByText('DNI o contraseña incorrectos')).toBeInTheDocument();
    });
  });

  test('login exitoso almacena tokens y llama onLogin', async () => {
    const onLogin = jest.fn();
    api.post.mockResolvedValueOnce({
      data: {
        access: 'access-token-123',
        refresh: 'refresh-token-456',
        username: 'testuser',
        first_name: 'Juan',
        last_name: 'Perez',
      },
    });

    renderLogin(onLogin);

    fireEvent.change(screen.getByLabelText('DNI'), { target: { value: '12345678A', name: 'dni' } });
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'correcta', name: 'password' } });
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesion/i }));

    await waitFor(() => {
      expect(localStorage.getItem('access_token')).toBe('access-token-123');
      expect(localStorage.getItem('refresh_token')).toBe('refresh-token-456');
      expect(localStorage.getItem('username')).toBe('testuser');
      expect(localStorage.getItem('first_name')).toBe('Juan');
      expect(localStorage.getItem('last_name')).toBe('Perez');
      expect(onLogin).toHaveBeenCalledTimes(1);
    });
  });

  test('muestra spinner durante la carga', async () => {
    api.post.mockImplementation(() => new Promise(() => {})); // never resolves
    renderLogin();

    fireEvent.change(screen.getByLabelText('DNI'), { target: { value: '12345678A', name: 'dni' } });
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'test', name: 'password' } });
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesion/i }));

    await waitFor(() => {
      expect(screen.getByText('Verificando...')).toBeInTheDocument();
    });
  });

  test('toggle de visibilidad de contraseña funciona', () => {
    renderLogin();
    const passwordInput = screen.getByLabelText('Contraseña');
    expect(passwordInput.type).toBe('password');

    const toggleButton = passwordInput.closest('div').querySelector('button');
    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe('text');

    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe('password');
  });
});
