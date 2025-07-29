"use client"
import React, { useState } from 'react';
const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export function Calendar({ events = [], onSelectDate }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hoveredDay, setHoveredDay] = useState(null);

  // Helper: get all events for a given date
  const getEventsForDate = (date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getFullYear() === date.getFullYear() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getDate() === date.getDate()
      );
    });
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const eventTypeStyles = {
    'vacaciones': { color: 'bg-blue-500', symbol: '●', label: 'Vacaciones' },
    'dias_libres': { color: 'bg-green-500', symbol: '●', label: 'Día Libre' },
    'permiso': { color: 'bg-purple-500', symbol: '●', label: 'Permiso' },
    'comunicado': { color: 'bg-black', symbol: '★', label: 'Comunicado' },
    'nomina': { color: 'bg-gray-400', symbol: '●', label: 'Nómina' },
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDayOfMonth = getFirstDayOfMonth(currentDate);
    const days = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const isToday = date.toDateString() === new Date().toDateString();
      const dayEvents = getEventsForDate(date);

      days.push(
        <div
          key={day}
          className={`calendar-day relative ${isToday ? 'today' : ''} ${dayEvents.length ? 'has-event' : ''}`}
          onClick={() => onSelectDate && onSelectDate(date)}
          onMouseEnter={() => setHoveredDay(day)}
          onMouseLeave={() => setHoveredDay(null)}
        >
          <div className="flex flex-col items-center">
            <span>{day}</span>
            <div className="flex gap-0.5 mt-0.5 items-center min-h-[16px]">
              {dayEvents.slice(0, 3).map((event, idx) => {
                const style = eventTypeStyles[event.type] || { color: 'bg-gray-400', symbol: '●' };
                return (
                  <span
                    key={idx}
                    className={`inline-block w-3 h-3 rounded-full ${style.color} text-xs text-white flex items-center justify-center`}
                    title={style.label}
                  >{style.symbol}</span>
                );
              })}
              {dayEvents.length > 3 && (
                <span className="ml-1 px-1 rounded bg-gray-200 text-gray-700 text-[10px] font-bold align-middle" title={`+${dayEvents.length - 3} más`}>
                  +{dayEvents.length - 3}
                </span>
              )}
            </div>
          </div>
          {/* Tooltip flotante */}
          {hoveredDay === day && dayEvents.length > 0 && (
            <div className="absolute z-20 left-1/2 -translate-x-1/2 top-10 bg-white border border-gray-300 shadow-lg rounded p-2 text-xs min-w-[160px] max-w-[220px] pointer-events-none animate-fade-in">
              <div className="font-semibold mb-1">Eventos:</div>
              {dayEvents.map((event, idx) => {
                const style = eventTypeStyles[event.type] || { color: 'bg-gray-400', label: event.type };
                return (
                  <div key={idx} className="flex items-center gap-2 mb-1 last:mb-0">
                    <span className={`inline-block w-2 h-2 rounded-full ${style.color}`}></span>
                    <span className="font-medium">{style.label}</span>
                    <span className="text-gray-600">{event.summary || event.description || ''}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  const changeMonth = (increment) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + increment, 1));
  };

  return (
    <div className="calendar mx-auto p-4 w-full max-w-lg bg-white shadow rounded">
      <div className="calendar-header flex items-center justify-between mb-2">
        <button onClick={() => changeMonth(-1)} className="px-2 py-1 text-lg">&#10094;</button>
        <h2 className="text-xl md:text-2xl font-semibold text-center capitalize">
          {currentDate.toLocaleString('default', { month: 'long' }).replace(/^./, (str) => str.toUpperCase())} {currentDate.getFullYear()}
        </h2>
        <button onClick={() => changeMonth(1)} className="px-2 py-1 text-lg">&#10095;</button>
      </div>
      <div className="calendar-weekdays grid grid-cols-7 mb-1">
        {daysOfWeek.map(day => <div key={day} className="weekday text-center font-semibold text-gray-600">{day}</div>)}
      </div>
      <div className="calendar-days grid grid-cols-7 gap-1">
        {renderCalendarDays()}
      </div>
    </div>
  );
}
