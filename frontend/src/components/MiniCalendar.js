import React, { useEffect, useState } from 'react';
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
        const vacRes = await api.get('vacaciones/listar/');
        const vacations = vacRes.data || [];
        const comRes = await api.get('posts/?ordering=-created_at&limit=5');
        const comunicados = comRes.data || [];
        const username = localStorage.getItem('username');
        const year = new Date().getFullYear();
        let nominas = [];
        if (username) {
          try {
            const nomRes = await api.get(`nominas/${username}/${year}/`);
            nominas = nomRes.data || [];
          } catch (err) { nominas = []; }
        }

        const vacEvents = vacations.flatMap(vac => {
          const tipo = vac.motivo === 'Vacaciones' ? 'vacaciones'
            : vac.motivo === 'Días Libres' ? 'dias_libres'
            : vac.motivo === 'Permisos' ? 'permiso' : null;
          if (!tipo) return [];
          const start = new Date(vac.inicio);
          const end = new Date(vac.fin);
          const days = [];
          for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            days.push({ date: d.toISOString().split('T')[0], type: tipo, summary: '' });
          }
          return days;
        });

        const comEvents = comunicados.map(com => ({
          date: com.created_at ? com.created_at.split('T')[0] : null, type: 'comunicado', summary: '',
        })).filter(e => e.date);

        const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
        const nominaEvents = nominas.map(nom => {
          let monthStr = nom.month ? nom.month.toString().padStart(2, '0') : '';
          let idx = monthStr.length === 2 && !isNaN(monthStr) ? parseInt(monthStr, 10) - 1 : -1;
          let mes = (idx >= 0 && idx < 12) ? meses[idx] : '';
          return { date: nom.date ? nom.date.split('T')[0] : `${year}-${monthStr}-01`, type: 'nomina', summary: mes ? `Nómina de ${mes}` : '', rawMonth: nom.month };
        });

        setEvents([...vacEvents, ...comEvents, ...nominaEvents]);
      } catch (err) {
        setError('No se pudieron cargar los eventos.');
      } finally { setLoading(false); }
    }
    fetchAllEvents();
  }, []);

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <h3 className="text-sm font-heading font-semibold text-card-foreground mb-3">Calendario</h3>
      {loading ? (
        <div className="text-center text-muted-foreground text-sm py-8">Cargando calendario...</div>
      ) : error ? (
        <div className="text-center text-destructive text-sm py-8">{error}</div>
      ) : (
        <Calendar events={events} />
      )}
    </div>
  );
}
