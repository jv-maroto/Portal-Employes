'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from './calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';

const meses = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export default function VacationForm({ onCreated, onClose, vacations = [] }) {
  const [formData, setFormData] = useState({
    dni: '',
    startDate: null,
    endDate: null,
    type: 'Vacaciones',
    email: '',
    signature: null,
  });

  // Helper: get all taken vacation days (for type 'Vacaciones')
  function getTakenDays() {
    return vacations
      .filter((v) => v.motivo === 'Vacaciones')
      .flatMap((v) => {
        const start = new Date(v.inicio);
        const end = new Date(v.fin);
        const days = [];
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          days.push(new Date(d).toISOString().split('T')[0]);
        }
        return days;
      });
  }

  function getTakenDaysCount() {
    return vacations
      .filter((v) => v.motivo === 'Vacaciones')
      .reduce((sum, v) => {
        const start = new Date(v.inicio);
        const end = new Date(v.fin);
        return sum + (Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1);
      }, 0);
  }

  function getTakenPermisoDays() {
    return vacations
      .filter((v) => v.motivo === 'Permisos')
      .reduce((sum, v) => {
        const start = new Date(v.inicio);
        const end = new Date(v.fin);
        return sum + (Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1);
      }, 0);
  }

  function getTakenVacacionesDays() {
    return vacations
      .filter((v) => v.motivo === 'Vacaciones')
      .reduce((sum, v) => {
        const start = new Date(v.inicio);
        const end = new Date(v.fin);
        return sum + (Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1);
      }, 0);
  }

  function getTakenLibresDays() {
    return vacations
      .filter((v) => v.motivo === 'Días Libres')
      .reduce((sum, v) => {
        const start = new Date(v.inicio);
        const end = new Date(v.fin);
        return sum + (Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1);
      }, 0);
  }

  const [loading, setLoading] = useState(false); // Para mostrar un estado de carga
  const [message, setMessage] = useState(null); // Para mostrar mensajes de éxito o error
  const sigCanvasRef = useRef(null);


  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación frontend de campos requeridos
    if (!formData.dni) {
      setMessage({ type: 'error', text: 'El campo DNI es requerido.' });
      return;
    }
    if (!formData.startDate) {
      setMessage({ type: 'error', text: 'La fecha de inicio es requerida.' });
      return;
    }
    if (!formData.endDate) {
      setMessage({ type: 'error', text: 'La fecha de fin es requerida.' });
      return;
    }
    if (!formData.email || !formData.email.trim()) {
      setMessage({ type: 'error', text: 'El correo electrónico es requerido.' });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setMessage({ type: 'error', text: 'Introduce un correo electrónico válido.' });
      return;
    }
    const signatureData = sigCanvasRef.current?.toDataURL();
    if (!signatureData) {
      setMessage({ type: 'error', text: 'La firma es requerida.' });
      return;
    }

    // Validación de días máximos según el tipo
    if (formData.type === 'Permisos') {
      const usados = getTakenPermisoDays();
      const nuevos = formData.startDate && formData.endDate
        ? (Math.ceil((formData.endDate - formData.startDate) / (1000 * 60 * 60 * 24)) + 1)
        : 0;
      if (usados + nuevos > 5) {
        setMessage({ type: 'error', text: 'No se ha podido registrar por exceso de días de Permisos.' });
        return;
      }
    }
    if (formData.type === 'Vacaciones') {
      const usados = getTakenVacacionesDays();
      const nuevos = formData.startDate && formData.endDate
        ? (Math.ceil((formData.endDate - formData.startDate) / (1000 * 60 * 60 * 24)) + 1)
        : 0;
      if (usados + nuevos > 30) {
        setMessage({ type: 'error', text: 'No se ha podido registrar por exceso de días de Vacaciones.' });
        return;
      }
    }
    if (formData.type === 'Días Libres') {
      const usados = getTakenLibresDays();
      const nuevos = formData.startDate && formData.endDate
        ? (Math.ceil((formData.endDate - formData.startDate) / (1000 * 60 * 60 * 24)) + 1)
        : 0;
      if (usados + nuevos > 10) {
        setMessage({ type: 'error', text: 'No se ha podido registrar por exceso de días de Días Libres.' });
        return;
      }
    }

    const payload = {
      inicio: formData.startDate.toISOString().split('T')[0],
      fin: formData.endDate.toISOString().split('T')[0],
      motivo: formData.type,
      email: formData.email.trim(),
      firma: signatureData,
      year: formData.startDate ? new Date(formData.startDate).getFullYear() : null,
      month: formData.startDate
        ? meses[new Date(formData.startDate).getMonth()]
        : null,
      dni: formData.dni,
    };

    try {
      setLoading(true);
      setMessage(null);

      const response = await fetch('http://localhost:8000/api/vacaciones/registrar/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errorText = '';
        try {
          const errorData = await response.json();
          // Si el backend devuelve errores de campos requeridos, los mostramos de forma específica
          if (typeof errorData === 'object' && errorData !== null) {
            // Busca el primer campo requerido
            const requiredField = Object.keys(errorData).find(
              key => errorData[key].some(msg => msg.includes('requerido') || msg.includes('required'))
            );
            if (requiredField) {
              errorText = `El campo "${requiredField}" es requerido.`;
            } else {
              errorText = Object.values(errorData).flat().join(' ');
            }
          } else {
            errorText = errorData.error || JSON.stringify(errorData) || '';
          }
        } catch {
          errorText = 'Error desconocido';
        }

        // Personaliza el mensaje según el motivo y el error recibido
        if (errorText.includes('exceso') || errorText.includes('límite')) {
          if (formData.type === 'Vacaciones') {
            throw new Error('No se ha podido registrar por exceso de días de Vacaciones.');
          } else if (formData.type === 'Permisos') {
            throw new Error('No se ha podido registrar por exceso de días de Permisos.');
          } else if (formData.type === 'Días Libres') {
            throw new Error('No se ha podido registrar por exceso de días de Días Libres.');
          }
        } else if (formData.type === 'Permisos') {
          throw new Error(errorText || 'Error al registrar el permiso.');
        } else if (formData.type === 'Días Libres') {
          throw new Error(errorText || 'Error al registrar los días libres.');
        } else {
          throw new Error(errorText || 'Error al registrar la vacación.');
        }
      }

      const responseData = await response.json();
      setMessage({ type: 'success', text: responseData.message });

      if (onCreated) onCreated();
      if (onClose) {
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const clearSignature = () => {
    sigCanvasRef.current?.clear();
    setFormData((prev) => ({ ...prev, signature: null }));
  };

  useEffect(() => {
    if (getTakenPermisoDays() >= 5 && formData.type === 'Permisos') {
      setFormData((prev) => ({ ...prev, type: 'Vacaciones' }));
    }
    if (getTakenVacacionesDays() >= 30 && formData.type === 'Vacaciones') {
      setFormData((prev) => ({ ...prev, type: 'Permisos' }));
    }
    if (getTakenLibresDays() >= 10 && formData.type === 'Días Libres') {
      setFormData((prev) => ({ ...prev, type: 'Vacaciones' }));
    }
  }, [vacations, formData.type, getTakenVacacionesDays, getTakenLibresDays, getTakenPermisoDays]);

  return (
    <Card className="w-full">
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* DNI Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="dni">
              DNI
            </label>
            <input
              id="dni"
              name="dni"
              type="text"
              required
              className="w-full p-2 border rounded-lg"
              value={formData.dni}
              onChange={handleInputChange}
            />
          </div>

          {/* Motivo Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="type">
              Motivo
            </label>
            <select
              id="type"
              name="type"
              className="w-full p-2 border rounded-lg"
              value={formData.type}
              onChange={handleInputChange}
            >
              <option value="Vacaciones" disabled={getTakenVacacionesDays() >= 30}>
                Vacaciones
              </option>
              <option value="Días Libres" disabled={getTakenLibresDays() >= 10}>
                Días Libres
              </option>
              <option value="Permisos" disabled={getTakenPermisoDays() >= 5}>
                Permisos
              </option>
            </select>
          </div>

          {/* Date Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Fecha de inicio</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.startDate
                      ? format(formData.startDate, 'dd MMMM yyyy', { locale: es })
                      : 'Seleccionar fecha'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent side="bottom" align="start" className="w-auto p-0">
                  <Calendar
                    selectedDate={formData.startDate}
                    onDateChange={(date) =>
                      setFormData((prev) => ({ ...prev, startDate: date }))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Fecha de fin</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.endDate
                      ? format(formData.endDate, 'dd MMMM yyyy', { locale: es })
                      : 'Seleccionar fecha'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent side="bottom" align="start" className="w-auto p-0">
                  <Calendar
                    selectedDate={formData.endDate}
                    onDateChange={(date) =>
                      setFormData((prev) => ({ ...prev, endDate: date }))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Signature Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Firma</label>
            <div className="border rounded-lg p-4 flex flex-col items-center justify-center">
              <div className="w-full overflow-hidden">
                <SignatureCanvas
                  ref={sigCanvasRef}
                  penColor="black"
                  canvasProps={{
                    className: 'sigCanvas w-full max-w-[600px] h-[200px] mx-auto',
                  }}
                />
              </div>
              <div className="flex justify-center mt-4">
                <Button variant="outline" onClick={clearSignature}>
                  Limpiar Firma
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="email">
              Correo electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full p-2 border rounded-lg"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Para recibir una copia de la solicitud"
            />
          </div>

          {message && (
            <p className={`text-sm mt-2 ${message.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
              {message.text}
            </p>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={!formData.startDate || !formData.endDate || loading}
          >
            {loading ? 'Enviando...' : 'Enviar solicitud'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
