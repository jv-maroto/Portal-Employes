import { useState, useEffect } from 'react';
import { Download, FileText, Loader2, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api';

export default function PayrollList() {
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [payrollData, setPayrollData] = useState([]);
  const [downloadingId, setDownloadingId] = useState(null);
  const [error, setError] = useState(null);

  const username = localStorage.getItem('username');

  const months = {
    "01": "Enero", "02": "Febrero", "03": "Marzo", "04": "Abril",
    "05": "Mayo", "06": "Junio", "07": "Julio", "08": "Agosto",
    "09": "Septiembre", "10": "Octubre", "11": "Noviembre", "12": "Diciembre"
  };

  useEffect(() => {
    const fetchYears = async () => {
      try {
        const res = await api.get('years-nominas/');
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
    if (!selectedYear) return;
    const fetchPayrollData = async () => {
      if (!username) { setError('Usuario no autenticado'); return; }
      try {
        const response = await api.get(`nominas/${username}/${selectedYear}/`, {
          headers: { 'X-Username': username }
        });
        setPayrollData(response.data);
        setError(null);
      } catch (err) {
        if (err.response?.status === 401) {
          setError('Sesión expirada. Recargue la página.');
        } else {
          setError('No se pudieron obtener las nóminas.');
        }
      }
    };
    fetchPayrollData();
  }, [selectedYear, username]);

  const sortedPayrollData = payrollData.sort((a, b) => parseInt(a.month) - parseInt(b.month));

  const handleDownload = async (payrollId, month) => {
    setDownloadingId(payrollId);
    try {
      const response = await api.get(`nominas/${username}/${selectedYear}/${month}/download/`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `nomina_${month}_${selectedYear}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      setError('Error al descargar la nómina.');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <FileText className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <h1 className="text-lg font-heading font-semibold text-gray-900">Mis Nóminas</h1>
              <p className="text-sm text-gray-400">Consulta y descarga tus nóminas</p>
            </div>
          </div>

          <div className="relative">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 cursor-pointer"
            >
              {years.map(year => (
                <option key={year} value={String(year)}>{year}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">{error}</div>
        )}

        {/* Grid de nóminas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {sortedPayrollData.map((payroll, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: idx * 0.03 }}
              key={payroll.id}
              className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md hover:border-gray-200 transition-all group cursor-pointer"
              onClick={() => handleDownload(payroll.id, payroll.month)}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center transition-colors flex-shrink-0">
                  <FileText className="h-5 w-5 text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                    {months[payroll.month]}
                  </p>
                  <p className="text-xs text-gray-400">{selectedYear}</p>
                </div>
                <button
                  className="p-1.5 rounded-lg text-gray-300 group-hover:text-blue-500 group-hover:bg-blue-50 transition-all flex-shrink-0"
                  disabled={downloadingId === payroll.id}
                >
                  {downloadingId === payroll.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                </button>
              </div>
            </motion.div>
          ))}

          {/* Placeholders */}
          {Array.from({ length: Math.max(0, 12 - sortedPayrollData.length) }).map((_, idx) => (
            <div
              key={`ph-${idx}`}
              className="rounded-xl border border-dashed border-gray-200 p-4 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                <FileText className="h-5 w-5 text-gray-300" />
              </div>
              <p className="text-sm text-gray-300 font-medium">Próximamente</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
