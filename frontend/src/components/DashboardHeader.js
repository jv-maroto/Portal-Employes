import React from 'react';
import { LogOut, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export function DashboardHeader() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post('logout/', {});
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.reload();
      navigate('/login');
    } catch (error) {
      // Error silenciado en producción
    }
  }

  const firstName = localStorage.getItem('first_name');
  const lastName = localStorage.getItem('last_name');
  const username = localStorage.getItem('username') || 'Usuario';
  let displayName = (firstName && firstName.trim())
    ? (lastName && lastName.trim() ? `${firstName} ${lastName}` : firstName)
    : username;

  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Buenos días' : hour < 20 ? 'Buenas tardes' : 'Buenas noches';
  const dateStr = now.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="bg-white border-b border-gray-100">
      <div className="px-4 sm:px-6 lg:px-8 py-4 max-w-7xl mx-auto flex items-center justify-between">
        <div>
          <h1 className="text-xl font-heading font-semibold text-gray-900">
            {greeting}, <span className="text-blue-600">{displayName}</span>
          </h1>
          <p className="text-sm text-gray-400 mt-0.5 capitalize flex items-center gap-1.5">
            <Sun className="h-3.5 w-3.5" />
            {dateStr}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-500/10 flex items-center justify-center">
            <span className="text-sm font-semibold text-blue-600">{initials}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </div>
    </div>
  );
}
