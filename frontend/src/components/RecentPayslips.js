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
      <div className="bg-card rounded-xl border border-border p-5 animate-pulse">
        <div className="h-5 bg-muted rounded w-1/3 mb-4" />
        <div className="space-y-3">
          <div className="h-14 bg-muted rounded-lg" />
          <div className="h-14 bg-muted rounded-lg" />
          <div className="h-14 bg-muted rounded-lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card rounded-xl border border-border p-5">
        <p className="text-center text-destructive text-sm">{error}</p>
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

  let yearLabel = recentPayslips.length > 0 ? recentPayslips[0].year || '' : '';

  return (
    <Link to="/nominas" className="block no-underline group">
      <div className="bg-card rounded-xl border border-border p-5 transition-all duration-200 group-hover:shadow-md group-hover:border-primary/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-heading font-semibold text-card-foreground">Últimas Nóminas</h3>
          <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {yearLabel || new Date().getFullYear()}
          </span>
        </div>

        {recentPayslips.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-4">No hay nóminas disponibles.</p>
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
                <div key={index} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-card-foreground truncate">
                      {mes && year ? `${mes} ${year}` : mes ? mes : 'Nómina'}
                    </p>
                    <p className="text-xs text-muted-foreground">{payslip.date}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/50 flex-shrink-0" />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Link>
  );
}
