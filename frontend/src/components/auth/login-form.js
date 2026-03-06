import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Lock, LogIn, Users } from 'lucide-react';
import api from '../../api';

export default function LoginPage({ onLogin }) {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ dni: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api.post('token/', { username: formData.dni, password: formData.password });
      if (response.data.access) {
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);
        localStorage.setItem('username', response.data.username);
        localStorage.setItem('first_name', response.data.first_name ?? '');
        localStorage.setItem('last_name', response.data.last_name ?? '');
        onLogin();
        navigate('/dashboard');
      } else {
        setError('No se recibió token de autenticación');
      }
    } catch (err) {
      setError('DNI o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-indigo-600/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-slate-800/30 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Tarjeta principal */}
        <div className="bg-slate-900 rounded-2xl shadow-2xl shadow-black/40 border border-slate-800 p-8 sm:p-10">
          {/* Logo y marca */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-5 shadow-lg shadow-blue-500/20">
              <Users className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">Portal Empleados</h1>
          </div>

          {/* Separador */}
          <div className="flex items-center gap-3 mb-7">
            <div className="flex-1 h-px bg-slate-800" />
            <span className="text-xs font-medium text-slate-500">Acceso al sistema</span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campo DNI */}
            <div>
              <label htmlFor="dni" className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">DNI</label>
              <div className={`relative flex items-center rounded-lg border transition-all duration-200 ${
                focusedField === 'dni'
                  ? 'border-blue-500 bg-slate-800/80 ring-4 ring-blue-500/10'
                  : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
              }`}>
                <div className="pl-3.5">
                  <User className={`w-4 h-4 transition-colors duration-200 ${focusedField === 'dni' ? 'text-blue-400' : 'text-slate-500'}`} />
                </div>
                <input
                  id="dni" name="dni" placeholder="12345678A"
                  value={formData.dni} onChange={handleChange}
                  onFocus={() => setFocusedField('dni')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full pl-3 pr-4 py-3 bg-transparent text-white placeholder:text-slate-600 focus:outline-none text-sm"
                  required
                />
              </div>
            </div>

            {/* Campo Contraseña */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-xs font-semibold text-slate-400 uppercase tracking-wide">Contraseña</label>
                <a href="/recuperar" className="text-xs text-slate-500 hover:text-blue-400 transition-colors">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <div className={`relative flex items-center rounded-lg border transition-all duration-200 ${
                focusedField === 'password'
                  ? 'border-blue-500 bg-slate-800/80 ring-4 ring-blue-500/10'
                  : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
              }`}>
                <div className="pl-3.5">
                  <Lock className={`w-4 h-4 transition-colors duration-200 ${focusedField === 'password' ? 'text-blue-400' : 'text-slate-500'}`} />
                </div>
                <input
                  id="password" name="password" type={showPassword ? 'text' : 'password'} placeholder="Tu contraseña"
                  value={formData.password} onChange={handleChange}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full pl-3 pr-2 py-3 bg-transparent text-white placeholder:text-slate-600 focus:outline-none text-sm"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="pr-3.5 text-slate-500 hover:text-slate-300 transition-colors">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Botón */}
            <button type="submit" disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 active:scale-[0.98] flex items-center justify-center gap-2 mt-1">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Verificando...
                </span>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Iniciar Sesion
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-slate-600 flex items-center justify-center gap-4">
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3" />
            Conexion segura
          </span>
          <span>&copy; {new Date().getFullYear()} Portal Empleados</span>
        </div>
      </div>
    </div>
  );
}
