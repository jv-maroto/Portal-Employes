import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PayrollList from '../pages/Nominas';
import api from '../api';

jest.mock('../api');
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => {
      const { initial, animate, transition, whileHover, whileTap, ...validProps } = props;
      return <div {...validProps}>{children}</div>;
    },
  },
  AnimatePresence: ({ children }) => children,
}));

beforeEach(() => {
  localStorage.setItem('username', 'testuser');
  localStorage.setItem('access_token', 'token-123');
});

afterEach(() => {
  localStorage.clear();
  jest.restoreAllMocks();
});

const mockPayrollData = [
  { id: 1, month: '01', year: 2025, date: '2025-01-31', file: 'nomina_01_2025.pdf' },
  { id: 2, month: '02', year: 2025, date: '2025-02-28', file: 'nomina_02_2025.pdf' },
  { id: 3, month: '03', year: 2025, date: '2025-03-31', file: 'nomina_03_2025.pdf' },
];

describe('PayrollList (Nominas)', () => {
  test('renderiza el titulo y selector de año', async () => {
    api.get.mockImplementation((url) => {
      if (url.includes('years-nominas')) return Promise.resolve({ data: [2024, 2025] });
      return Promise.resolve({ data: mockPayrollData });
    });

    render(<MemoryRouter><PayrollList /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByText('Mis Nóminas')).toBeInTheDocument();
      expect(screen.getByText('Consulta y descarga tus nóminas')).toBeInTheDocument();
    });
  });

  test('muestra las nominas cargadas por mes', async () => {
    api.get.mockImplementation((url) => {
      if (url.includes('years-nominas')) return Promise.resolve({ data: [2025] });
      return Promise.resolve({ data: mockPayrollData });
    });

    render(<MemoryRouter><PayrollList /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByText('Enero')).toBeInTheDocument();
      expect(screen.getByText('Febrero')).toBeInTheDocument();
      expect(screen.getByText('Marzo')).toBeInTheDocument();
    });
  });

  test('muestra placeholders para meses sin nomina', async () => {
    api.get.mockImplementation((url) => {
      if (url.includes('years-nominas')) return Promise.resolve({ data: [2025] });
      return Promise.resolve({ data: mockPayrollData }); // 3 nominas = 9 placeholders
    });

    render(<MemoryRouter><PayrollList /></MemoryRouter>);

    await waitFor(() => {
      const placeholders = screen.getAllByText('Próximamente');
      expect(placeholders.length).toBe(9);
    });
  });

  test('muestra error si el usuario no esta autenticado', async () => {
    localStorage.removeItem('username');
    api.get.mockImplementation((url) => {
      if (url.includes('years-nominas')) return Promise.resolve({ data: [2025] });
      return Promise.resolve({ data: [] });
    });

    render(<MemoryRouter><PayrollList /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByText('Usuario no autenticado')).toBeInTheDocument();
    });
  });

  test('muestra error de sesion expirada en 401', async () => {
    api.get.mockImplementation((url) => {
      if (url.includes('years-nominas')) return Promise.resolve({ data: [2025] });
      return Promise.reject({ response: { status: 401 } });
    });

    render(<MemoryRouter><PayrollList /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByText('Sesión expirada.')).toBeInTheDocument();
    });
  });

  test('descarga nomina al hacer click', async () => {
    const mockBlob = new Blob(['pdf content'], { type: 'application/pdf' });
    const createObjectURL = jest.fn(() => 'blob:test-url');
    const revokeObjectURL = jest.fn();
    window.URL.createObjectURL = createObjectURL;
    window.URL.revokeObjectURL = revokeObjectURL;

    api.get.mockImplementation((url) => {
      if (url.includes('years-nominas')) return Promise.resolve({ data: [2025] });
      if (url.includes('download')) return Promise.resolve({ data: mockBlob });
      return Promise.resolve({ data: mockPayrollData });
    });

    render(<MemoryRouter><PayrollList /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByText('Enero')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Enero').closest('[class*="bg-card"]'));

    await waitFor(() => {
      expect(createObjectURL).toHaveBeenCalled();
      expect(revokeObjectURL).toHaveBeenCalled();
    });
  });

  test('permite cambiar de año en el selector', async () => {
    api.get.mockImplementation((url) => {
      if (url.includes('years-nominas')) return Promise.resolve({ data: [2024, 2025] });
      return Promise.resolve({ data: mockPayrollData });
    });

    render(<MemoryRouter><PayrollList /></MemoryRouter>);

    await waitFor(() => {
      expect(screen.getByDisplayValue('2025')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByDisplayValue('2025'), { target: { value: '2024' } });

    await waitFor(() => {
      expect(screen.getByDisplayValue('2024')).toBeInTheDocument();
    });
  });
});
