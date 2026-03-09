import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const mockContextValue = {
  vacationData: { total: 30, taken: 12, remaining: 18 },
  daysOffData: { total: 10, taken: 3, remaining: 7 },
  permissionsData: { total: 5, taken: 1, remaining: 4 },
};

jest.mock('../contexts/VacationContext', () => ({
  useVacationContext: () => mockContextValue,
}));

// The component imports from @/contexts/VacationContext which resolves to src/contexts/VacationContext
import { VacationSummary } from '../components/VacationSummary';

const renderComponent = () => {
  return render(
    <MemoryRouter>
      <VacationSummary />
    </MemoryRouter>
  );
};

describe('VacationSummary', () => {
  test('renderiza el titulo del resumen', () => {
    renderComponent();
    expect(screen.getByText('Resumen de Ausencias')).toBeInTheDocument();
  });

  test('muestra las tres categorias de ausencias', () => {
    renderComponent();
    expect(screen.getByText('Vacaciones')).toBeInTheDocument();
    expect(screen.getByText('Días Libres')).toBeInTheDocument();
    expect(screen.getByText('Permisos')).toBeInTheDocument();
  });

  test('muestra los dias correctos para cada categoria', () => {
    renderComponent();
    expect(screen.getByText('12 / 30 días')).toBeInTheDocument();
    expect(screen.getByText('3 / 10 días')).toBeInTheDocument();
    expect(screen.getByText('1 / 5 días')).toBeInTheDocument();
  });

  test('renderiza barras de progreso con porcentajes correctos', () => {
    const { container } = renderComponent();
    const progressBars = container.querySelectorAll('[style*="width"]');
    expect(progressBars.length).toBe(3);
    expect(progressBars[0].style.width).toBe('40%');
    expect(progressBars[1].style.width).toBe('30%');
    expect(progressBars[2].style.width).toBe('20%');
  });

  test('enlaza a la pagina de vacaciones', () => {
    const { container } = renderComponent();
    const link = container.querySelector('a[href="/vacaciones"]');
    expect(link).toBeInTheDocument();
  });
});
