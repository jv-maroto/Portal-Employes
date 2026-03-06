import React from 'react';
import { Link } from "react-router-dom";
import { FileText, ChevronRight } from 'lucide-react';
import { usePayslipContext } from "@/contexts/NominasContext";

export function RecentPayslips() {
  const { payrollData, error, loading } = usePayslipContext();

  const months = {
    "01": "Enero", "02": "Febrero", "03": "Marzo", "04": "Abril",
    "05": "Mayo", "06": "Junio", "07": "Julio", "08": "Agosto",
    "09": "Septiembre", "10": "Octubre", "11": "Noviembre", "12": "Diciembre"
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse">
        <div className="h-5 bg-gray-100 rounded w-1/3 mb-4" />
        <div className="space-y-3">
          <div className="h-14 bg-gray-50 rounded-lg" />
          <div className="h-14 bg-gray-50 rounded-lg" />
          <div className="h-14 bg-gray-50 rounded-lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <p className="text-center text-red-500 text-sm">{error}</p>
      </div>
    );
  }

  const realPayslips = payrollData.filter(p => {
    const file = (p.file || '').toLowerCase();
    return !file.includes('vacacion') && !file.includes('vacaciones');
  });

  const recentPayslips = realPayslips
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 3);

  let yearLabel = '';
  if (recentPayslips.length > 0) {
    yearLabel = recentPayslips[0].year || '';
  }

  return (
    <Link to="/nominas" className="block no-underline group">
      <div className="bg-white rounded-xl border border-gray-100 p-5 transition-all duration-200 group-hover:shadow-md group-hover:border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-heading font-semibold text-gray-900">Últimas Nóminas</h3>
          <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
            {yearLabel || new Date().getFullYear()}
          </span>
        </div>

        {recentPayslips.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">No se encontraron nóminas.</p>
        ) : (
          <div className="space-y-2">
            {recentPayslips.map((payslip, index) => {
              let mes = '';
              let year = payslip.year || '';
              if (payslip.month) {
                let mesKey = typeof payslip.month === 'number'
                  ? String(payslip.month).padStart(2, '0')
                  : payslip.month.padStart(2, '0');
                mes = months[mesKey] || '';
              }
              return (
                <div key={index} className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50/80 hover:bg-gray-100/80 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">
                      {mes && year ? `${mes} ${year}` : mes ? mes : 'Nómina'}
                    </p>
                    <p className="text-xs text-gray-400">{payslip.date}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-300 flex-shrink-0" />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Link>
  );
}
