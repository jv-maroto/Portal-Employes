"use client"
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const daysOfWeek = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export function Calendar({ events = [], onSelectDate }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hoveredDay, setHoveredDay] = useState(null);

  const getEventsForDate = (date) => events.filter(event => {
    const ed = new Date(event.date);
    return ed.getFullYear() === date.getFullYear() && ed.getMonth() === date.getMonth() && ed.getDate() === date.getDate();
  });

  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) => {
    const day = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const eventTypeColors = {
    'vacaciones': 'bg-indigo-500',
    'dias_libres': 'bg-emerald-500',
    'permiso': 'bg-violet-500',
    'comunicado': 'bg-amber-500',
    'nomina': 'bg-slate-400',
  };

  const eventTypeLabels = {
    'vacaciones': 'Vacaciones',
    'dias_libres': 'Día Libre',
    'permiso': 'Permiso',
    'comunicado': 'Comunicado',
    'nomina': 'Nómina',
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    for (let i = 0; i < firstDay; i++) days.push(<div key={`empty-${i}`} />);

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const isToday = date.toDateString() === new Date().toDateString();
      const dayEvents = getEventsForDate(date);

      days.push(
        <div key={day}
          className={`relative flex flex-col items-center justify-start py-1 rounded-lg cursor-pointer transition-colors text-sm
            ${isToday ? 'bg-primary text-primary-foreground font-semibold' : 'hover:bg-muted'}
            ${dayEvents.length > 0 && !isToday ? 'font-medium' : ''}
          `}
          onClick={() => onSelectDate && onSelectDate(date)}
          onMouseEnter={() => setHoveredDay(day)}
          onMouseLeave={() => setHoveredDay(null)}
        >
          <span>{day}</span>
          {dayEvents.length > 0 && (
            <div className="flex gap-0.5 mt-0.5">
              {dayEvents.slice(0, 3).map((event, idx) => (
                <span key={idx} className={`w-1.5 h-1.5 rounded-full ${isToday ? 'bg-primary-foreground/70' : (eventTypeColors[event.type] || 'bg-slate-400')}`} />
              ))}
            </div>
          )}
          {hoveredDay === day && dayEvents.length > 0 && (
            <div className="absolute z-30 left-1/2 -translate-x-1/2 top-full mt-1 bg-popover border border-border shadow-lg rounded-lg p-2.5 text-xs min-w-[150px] pointer-events-none animate-fade-in">
              {dayEvents.map((event, idx) => (
                <div key={idx} className="flex items-center gap-2 mb-1 last:mb-0">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${eventTypeColors[event.type] || 'bg-slate-400'}`} />
                  <span className="text-popover-foreground font-medium">{eventTypeLabels[event.type] || event.type}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
    return days;
  };

  const changeMonth = (inc) => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + inc, 1));
  const monthName = currentDate.toLocaleString('es-ES', { month: 'long' });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => changeMonth(-1)} className="p-1 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h4 className="text-sm font-semibold text-card-foreground capitalize">{monthName} {currentDate.getFullYear()}</h4>
        <button onClick={() => changeMonth(1)} className="p-1 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {daysOfWeek.map(day => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground py-1">{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">{renderCalendarDays()}</div>
      <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-border">
        {Object.entries(eventTypeLabels).map(([type, label]) => (
          <div key={type} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${eventTypeColors[type]}`} />
            <span className="text-[11px] text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
