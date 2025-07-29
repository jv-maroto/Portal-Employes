import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Calendar } from "../components/ui/calendar2";
import api from '../api';

export function MiniCalendar() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchAllEvents() {
      setLoading(true);
      setError(null);
      try {
        // 1. Vacaciones, días libres, permisos
        const vacRes = await api.get('vacaciones/listar/');
        const vacations = vacRes.data || [];
        // 2. Comunicados recientes
        const comRes = await api.get('posts/?ordering=-created_at&limit=5');
        const comunicados = comRes.data || [];
        // 3. Nóminas del usuario para el año actual
        const username = localStorage.getItem('username');
        const year = new Date().getFullYear();
        let nominas = [];
        if (username) {
          try {
            const nomRes = await api.get(`nominas/${username}/${year}/`);
            nominas = nomRes.data || [];
          } catch (err) {
            // Si no hay nóminas, no es error fatal
            nominas = [];
          }
        }

        // Mapear vacaciones, días libres, permisos (sin descripción, solo tipo)
        const vacEvents = vacations.flatMap(vac => {
          const tipo = vac.motivo === 'Vacaciones' ? 'vacaciones'
            : vac.motivo === 'Días Libres' ? 'dias_libres'
            : vac.motivo === 'Permisos' ? 'permiso'
            : null;
          if (!tipo) return [];
          // Un evento por cada día del rango
          const start = new Date(vac.inicio);
          const end = new Date(vac.fin);
          const days = [];
          for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            days.push({
              date: d.toISOString().split('T')[0],
              type: tipo,
              summary: '', // Sin descripción
            });
          }
          return days;
        });

        // Comunicados: solo marcar el día, sin descripción
        const comEvents = comunicados.map(com => ({
          date: com.created_at ? com.created_at.split('T')[0] : null,
          type: 'comunicado',
          summary: '',
        })).filter(e => e.date);

        // Nóminas: solo marcar el día, sin descripción
        // Nóminas: mostrar "Nómina de {mes}" como summary
        const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        console.log('Nóminas recibidas:', nominas);
        const nominaEvents = nominas.map(nom => {
          let mes = '';
          // Aseguramos que month sea string de dos dígitos
          let monthStr = nom.month ? nom.month.toString().padStart(2, '0') : '';
          let idx = -1;
          if (monthStr.length === 2 && !isNaN(monthStr)) {
            idx = parseInt(monthStr, 10) - 1;
          }
          mes = (idx >= 0 && idx < 12) ? meses[idx] : '';
          return {
            date: nom.date ? nom.date.split('T')[0] : `${year}-${monthStr}-01`,
            type: 'nomina',
            summary: mes ? `Nómina de ${mes}` : '',
            rawMonth: nom.month,
          };
        });

        setEvents([...vacEvents, ...comEvents, ...nominaEvents]);
      } catch (err) {
        setError('No se pudieron cargar los eventos del calendario.');
      } finally {
        setLoading(false);
      }
    }
    fetchAllEvents();
  }, []);

  const handleSelectDate = (date) => {
    // Aquí puedes manejar la selección de fecha, por ejemplo, mostrar eventos para ese día
    console.log('Fecha seleccionada:', date);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calendario</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center text-gray-400 text-sm">Cargando calendario...</div>
        ) : error ? (
          <div className="text-center text-red-500 text-sm">{error}</div>
        ) : (
          <Calendar 
            events={events}
            onSelectDate={handleSelectDate}
          />
        )}
      </CardContent>
    </Card>
  );
}

