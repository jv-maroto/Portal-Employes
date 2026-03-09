import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const mockPayrollData = [
  { id: 1, month: '01', year: 2025, date: '2025-01-31', file: 'nomina_01.pdf' },
  { id: 2, month: '02', year: 2025, date: '2025-02-28', file: 'nomina_02.pdf' },
  { id: 3, month: '03', year: 2025, date: '2025-03-31', file: 'nomina_03.pdf' },
  { id: 4, month: '04', year: 2025, date: '2025-04-30', file: 'nomina_04.pdf' },
];

let mockContextValue = {
  payrollData: mockPayrollData,
  error: null,
  loading: false,
};

jest.mock('../contexts/NominasContext', () => ({
  usePayslipContext: () => mockContextValue,
}));

import { RecentPayslips } from '../components/RecentPayslips';

const renderComponent = () => {
  return render(
    <MemoryRouter>
      <RecentPayslips />
    </MemoryRouter>
  );
};

describe('RecentPayslips', () => {
  beforeEach(() => {
    mockContextValue = {
      payrollData: mockPayrollData,
      error: null,
      loading: false,
    };
  });

  test('renderiza el titulo', () => {
    renderComponent();
    expect(screen.getByText('Últimas Nóminas')).toBeInTheDocument();
  });

  test('muestra solo las 3 nominas mas recientes', () => {
    renderComponent();
    const items = screen.getAllByText(/^(Enero|Febrero|Marzo|Abril) 2025$/);
    expect(items.length).toBe(3);
  });

  test('filtra nominas de vacaciones', () => {
    mockContextValue = {
      payrollData: [
        { id: 1, month: '01', year: 2025, date: '2025-01-31', file: 'nomina_01.pdf' },
        { id: 2, month: '06', year: 2025, date: '2025-06-15', file: 'vacaciones_verano.pdf' },
      ],
      error: null,
      loading: false,
    };

    renderComponent();
    expect(screen.getByText('Enero 2025')).toBeInTheDocument();
    expect(screen.queryByText('Junio 2025')).not.toBeInTheDocument();
  });

  test('muestra estado de carga con skeleton', () => {
    mockContextValue = { payrollData: [], error: null, loading: true };
    const { container } = renderComponent();
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  test('muestra mensaje de error', () => {
    mockContextValue = { payrollData: [], error: 'Error de conexion', loading: false };
    renderComponent();
    expect(screen.getByText('Error de conexion')).toBeInTheDocument();
  });

  test('muestra mensaje cuando no hay nominas', () => {
    mockContextValue = { payrollData: [], error: null, loading: false };
    renderComponent();
    expect(screen.getByText('No se encontraron nóminas.')).toBeInTheDocument();
  });

  test('enlaza a la pagina de nominas', () => {
    const { container } = renderComponent();
    const link = container.querySelector('a[href="/nominas"]');
    expect(link).toBeInTheDocument();
  });
});
