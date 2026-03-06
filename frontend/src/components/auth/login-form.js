import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Building2 } from 'lucide-react';
import api from '../../api';

export default function LoginPage({ onLogin }) {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ dni: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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
    <div className="min-h-screen flex">
      {/* Panel izquierdo - Branding */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-gradient-to-br from-[hsl(224,30%,10%)] via-[hsl(234,25%,16%)] to-[hsl(234,40%,22%)]">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-16 w-64 h-64 bg-[hsl(234,62%,56%)]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-32 right-16 w-80 h-80 bg-[hsl(234,62%,56%)]/5 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-11 h-11 bg-[hsl(234,62%,56%)] rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-heading font-bold tracking-tight">Portal Corp</span>
          </div>
          <h1 className="text-3xl font-heading font-bold leading-tight mb-4">
            Portal del<br />Empleado
          </h1>
          <p className="text-base text-slate-400 max-w-sm leading-relaxed">
            Gestiona tus nóminas, vacaciones y comunicados desde un solo lugar.
          </p>
          <div className="mt-14 grid grid-cols-3 gap-6 text-sm">
            <div className="bg-white/5 rounded-lg p-4 border border-white/5">
              <div className="text-lg font-bold text-white mb-0.5">Nóminas</div>
              <div className="text-slate-400 text-xs">Consulta y descarga</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4 border border-white/5">
              <div className="text-lg font-bold text-white mb-0.5">Vacaciones</div>
              <div className="text-slate-400 text-xs">Solicita y gestiona</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4 border border-white/5">
              <div className="text-lg font-bold text-white mb-0.5">Comunicados</div>
              <div className="text-slate-400 text-xs">Mantente al día</div>
            </div>
          </div>
        </div>
      </div>

      {/* Panel derecho - Formulario */}
      <div className="w-full lg:w-[55%] flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-heading font-bold text-foreground">Portal Corp</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-heading font-bold text-foreground">Bienvenido</h2>
            <p className="mt-2 text-muted-foreground">Introduce tus credenciales para acceder</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="dni" className="block text-sm font-medium text-foreground mb-1.5">DNI</label>
              <input
                id="dni" name="dni" placeholder="Ej: 12345678A"
                value={formData.dni} onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-foreground">Contraseña</label>
                <a href="/recuperar" className="text-sm text-primary hover:text-primary/80 transition-colors">¿Olvidaste tu contraseña?</a>
              </div>
              <div className="relative">
                <input
                  id="password" name="password" type={showPassword ? 'text' : 'password'} placeholder="Tu contraseña"
                  value={formData.password} onChange={handleChange}
                  className="w-full px-4 py-3 pr-12 rounded-lg border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1">
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">{error}</div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3 px-4 bg-primary hover:bg-primary/90 disabled:opacity-40 text-primary-foreground font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98]">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Iniciando sesión...
                </span>
              ) : 'Iniciar Sesión'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
