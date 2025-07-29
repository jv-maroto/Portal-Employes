import { useState, useEffect } from 'react';
import { Download, Calendar, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion } from 'framer-motion';
import axios from 'axios';

export default function PayrollList() {
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [payrollData, setPayrollData] = useState([]); // State para almacenar las nóminas
  const [downloadingId] = useState(null);
  const [error, setError] = useState(null); // State para manejar errores

  const token = localStorage.getItem('access_token'); // Obtener el token de acceso
  const username = localStorage.getItem('username');  // Suponiendo que guardas el username en el localStorage
  const refreshToken = localStorage.getItem('refresh_token'); // Obtener el refresh_token

  console.log('Token:', token);
  console.log('Username:', username);

  const months = {
    "01": "Enero",
    "02": "Febrero",
    "03": "Marzo",
    "04": "Abril",
    "05": "Mayo",
    "06": "Junio",
    "07": "Julio",
    "08": "Agosto",
    "09": "Septiembre",
    "10": "Octubre",
    "11": "Noviembre",
    "12": "Diciembre"
  };

  useEffect(() => {
    const fetchYears = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const res = await axios.get('http://localhost:8000/api/years-nominas/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setYears(res.data);
        if (res.data.length > 0 && !selectedYear) {
          setSelectedYear(String(res.data[res.data.length - 1]));
        }
      } catch (err) {
        setYears([]);
      }
    };
    fetchYears();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (!selectedYear) return; // <-- No hagas fetch si no hay año seleccionado

    const fetchPayrollData = async () => {
      if (!username || !token) {
        setError('Usuario no autenticado');
        return;
      }
  
      try {
        // Intenta hacer la solicitud con el token
        const response = await axios.get(`http://localhost:8000/api/nominas/${username}/${selectedYear}/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Username': username
          }
        });
  
        // Muestra en consola lo que devuelve el backend
        console.log('Nóminas recibidas del backend:', response.data);
  
        // Si la respuesta es exitosa, actualiza el estado
        setPayrollData(response.data);
      } catch (err) {
        console.error('Error al obtener las nóminas:', err);
        if (err.response && err.response.status === 401) {
          // Si el token está expirado, intenta renovarlo
          if (refreshToken) {
            try {
              const refreshResponse = await axios.post('http://localhost:8000/api/token/refresh/', {
                refresh: refreshToken,
              });
  
              const newAccessToken = refreshResponse.data.access;
              localStorage.setItem('access_token', newAccessToken); // Actualiza el access_token
  
              // Reintenta la solicitud con el nuevo token
              const retryResponse = await axios.get(`http://localhost:8000/api/nominas/${username}/${selectedYear}/`, {
                headers: {
                  'Authorization': `Bearer ${newAccessToken}`,
                }
              });
  
              setPayrollData(retryResponse.data); // Actualiza nóminas
            } catch (refreshError) {
              console.error('Error al renovar el token:', refreshError);
              setError('No se pudo renovar el token. Inicia sesión nuevamente.');
            }
          } else {
            setError('Usuario no autenticado');
          }
        } else {
          setError('No se pudieron obtener las nóminas.');
        }
      }
    };
  
    fetchPayrollData();
  }, [selectedYear, token, username, refreshToken]);

  // Ordena las nóminas por mes
  const sortedPayrollData = payrollData.sort((a, b) => parseInt(a.month) - parseInt(b.month));

  const handleDownload = (payrollId, month) => {
    // Construir la URL de descarga basada en el payrollId y el mes
    const downloadUrl = `http://localhost:8000/media/${username}_${month}_${selectedYear}.pdf`;
    
    // Crear un enlace de descarga
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', `${payrollId}S_${month}_${selectedYear}.pdf`); // Establecer el nombre del archivo
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <TooltipProvider>
      <div
        className="min-h-screen  overflow-hidden bg-gray-50"
        style={{ height: "100vh" }}
      >
        <Card className="w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" />
              Mis Nóminas
            </CardTitle>
            <Select
              value={selectedYear}
              onValueChange={setSelectedYear}
            >
              <SelectTrigger className="w-[180px]">
                <Calendar className="mr-2 h-4 w-4 text-blue-500" />
                <SelectValue placeholder="Seleccionar año" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {years.map(year => (
                  <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            {error && <div className="text-red-500 text-center">{error}</div>}
            <div className="flex flex-col items-center w-full" style={{ height: "calc(100vh - 120px)" }}>
              <div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full custom-scroll"
                style={{
                  maxHeight: "100%",
                  overflowY: "auto",
                  overflowX: "hidden",
                  background: "white",
                  borderRadius: "1rem",
                  boxShadow: "0 2px 8px #0001",
                  padding: "2rem", // Opcional: más espacio alrededor
                }}
              >
                {/* Nóminas reales */}
                {sortedPayrollData?.map((payroll) => (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    key={payroll.id}
                    className="flex flex-row items-center justify-between rounded-lg border p-6 hover:shadow-md hover:border-blue-200 transition-all group bg-white h-24"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-50 rounded-full group-hover:bg-blue-100 transition-colors">
                        <FileText className="h-7 w-7 text-blue-500" />
                      </div>
                      <p className="text-lg group-hover:text-blue-600 transition-colors">
                        {`Nómina del mes de ${months[payroll.month]}`}
                      </p>
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDownload(payroll.id, payroll.month)}
                          className="hover:bg-blue-50 hover:text-blue-500 transition-colors"
                          disabled={downloadingId === payroll.id}
                        >
                          {downloadingId === payroll.id ? (
                            <Loader2 className="h-7 w-7 animate-spin" />
                          ) : (
                            <Download className="h-7 w-7" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Descargar nómina de {months[payroll.month]}</p>
                      </TooltipContent>
                    </Tooltip>
                  </motion.div>
                ))}

                {/* Placeholders "Próximamente" */}
                {Array.from({ length: 12 - sortedPayrollData.length }).map((_, idx) => (
                  <div
                    key={`placeholder-${idx}`}
                    className="flex flex-row items-center justify-between rounded-lg border border-dashed p-6 bg-gray-50 text-gray-400 h-24"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gray-100 rounded-full">
                        <FileText className="h-7 w-7" />
                      </div>
                      <p className="text-lg font-semibold">Próximamente</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
