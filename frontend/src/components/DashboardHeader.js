import React from 'react';
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';  // Asegúrate de importar useNavigate
import axios from 'axios';  // Asegúrate de importar axios

export function DashboardHeader() {
  const navigate = useNavigate();  // Usa el hook useNavigate

  const handleLogout = async () => {
    try {
      // Hacer solicitud POST al backend para cerrar sesión
      await axios.post('http://localhost:8000/api/logout/', {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        }
      });

      // Eliminar token del localStorage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');

      // Forzar un "F5" (recarga la página)
      window.location.reload();  // Esto recargará toda la página

      // Redirigir a la página de login usando useNavigate
      navigate('/login');  // Cambia la redirección por navigate
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }
  // Obtener el nombre y apellido del usuario del localStorage, si no existen usa el username
  const firstName = localStorage.getItem('first_name');
  const lastName = localStorage.getItem('last_name');
  const username = localStorage.getItem('username') || 'Usuario';
  // Mostrar nombre y apellido si existen, si no, mostrar username
  let displayName = (firstName && firstName.trim())
    ? (lastName && lastName.trim() ? `${firstName} ${lastName}` : firstName)
    : username;
 
  return (
    <div className="flex items-center justify-end p-4 bg-white dark:bg-gray-800 border-b">
      <div className="flex items-center gap-4">
        <div className="text-right">
          <h1 className="text-2xl font-semibold">{displayName}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Avatar>
          <img src="/logo.png" alt={displayName} className="w-full h-full object-cover" />
        </Avatar>
        <Button
          variant="outline"
          onClick={handleLogout}
          className="flex items-center gap-1 ml-4 h-7 px-2 text-xs"
        >
          <LogOut className="h-3 w-3" />
          <span>Salir</span>
        </Button>
      </div>
    </div>
  );
}
