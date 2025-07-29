import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserIcon, KeyIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import axios from 'axios';

export default function LoginPage({ onLogin }) {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    dni: '',  // Usamos el DNI como 'username'
    password: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    console.log('Sending login request…', formData);
    const response = await axios.post('http://localhost:8000/api/login/', {
      dni: formData.dni,
      password: formData.password,
    });

    console.log('Response from backend:', response);

    if (response.data.access) {
      // ↓ Guarda los tokens en localStorage:
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      localStorage.setItem('username', response.data.username);
      localStorage.setItem('first_name', response.data.first_name ?? '');
      localStorage.setItem('last_name', response.data.last_name ?? '');
      console.log('✅ Token guardado:', localStorage.getItem('accessToken'));
      onLogin();
      navigate('/dashboard');
    } else {
      // Manejo de error si no hay access
      console.error('No access token in response');
      setError('No se recibió token de autenticación');
    }
  } catch (err) {
    console.error('Error during login:', err);
    setError('Credenciales inválidas');
  }
};


  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(''); // Limpia el mensaje de error
  };

  return (
    <div className="login-container min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="w-full max-w-md space-y-8 p-8 bg-gray-800/50 rounded-2xl backdrop-blur-sm border border-gray-700">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white">Bienvenido</h2>
          <p className="mt-2 text-gray-400">Ingresa a tu cuenta</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="dni" className="text-gray-300">
                DNI
              </Label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-gray-500" />
                </div>
                <Input
                  id="dni"
                  name="dni"
                  placeholder="Ingresa tu DNI"
                  value={formData.dni}
                  onChange={handleChange}
                  className="pl-10 bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-gray-300">
                  Contraseña
                </Label>
                <a
                  href="/recuperar"
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyIcon className="h-5 w-5 text-gray-500" />
                </div>
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Ingresa tu contraseña"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute inset-y-0 right-0 pr-3 text-gray-400 hover:text-gray-300"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </Button>
              </div>
            </div>
          </div>

          {error && <div className="text-red-400 text-sm text-center">{error}</div>}

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg transition-colors"
          >
            Iniciar Sesión
          </Button>
        </form>
      </div>
    </div>
  );
}
