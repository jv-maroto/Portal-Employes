import React from 'react';
import { Link } from "react-router-dom";
import { Calendar, Palmtree, Clock } from 'lucide-react';
import { useVacationContext } from "@/contexts/VacationContext";

export function VacationSummary() {
  const { vacationData, daysOffData, permissionsData } = useVacationContext();

  if (!vacationData || !daysOffData || !permissionsData) {
    return (
      <div className="bg-card rounded-xl border border-border p-5 animate-pulse">
        <div className="h-5 bg-muted rounded w-1/2 mb-4" />
        <div className="space-y-3">
          <div className="h-12 bg-muted rounded-lg" />
          <div className="h-12 bg-muted rounded-lg" />
          <div className="h-12 bg-muted rounded-lg" />
        </div>
      </div>
    );
  }

  const { total: totalVacations, taken: takenVacations } = vacationData;
  const { total: totalDaysOff, taken: takenDaysOff } = daysOffData;
  const { total: totalPermissions, taken: takenPermissions } = permissionsData;

  const items = [
    { label: 'Vacaciones', taken: takenVacations, total: totalVacations, color: 'indigo', icon: Palmtree },
    { label: 'Días Libres', taken: takenDaysOff, total: totalDaysOff, color: 'emerald', icon: Calendar },
    { label: 'Permisos', taken: takenPermissions, total: totalPermissions, color: 'violet', icon: Clock },
  ];

  const colorMap = {
    indigo: { bg: 'bg-indigo-500', light: 'bg-indigo-500/10', text: 'text-indigo-500', track: 'bg-indigo-500/15' },
    emerald: { bg: 'bg-emerald-500', light: 'bg-emerald-500/10', text: 'text-emerald-500', track: 'bg-emerald-500/15' },
    violet: { bg: 'bg-violet-500', light: 'bg-violet-500/10', text: 'text-violet-500', track: 'bg-violet-500/15' },
  };

  return (
    <Link to="/vacaciones" className="block no-underline group">
      <div className="bg-card rounded-xl border border-border p-5 transition-all duration-200 group-hover:shadow-md group-hover:border-primary/20">
        <h3 className="text-sm font-heading font-semibold text-card-foreground mb-4">Resumen de Ausencias</h3>
        <div className="space-y-4">
          {items.map((item) => {
            const pct = item.total > 0 ? (item.taken / item.total) * 100 : 0;
            const c = colorMap[item.color];
            const Icon = item.icon;
            return (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-lg ${c.light} flex items-center justify-center`}>
                      <Icon className={`h-3.5 w-3.5 ${c.text}`} />
                    </div>
                    <span className="text-sm font-medium text-card-foreground">{item.label}</span>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">{item.taken} / {item.total} días</span>
                </div>
                <div className={`h-1.5 rounded-full ${c.track}`}>
                  <div className={`h-full rounded-full ${c.bg} transition-all duration-500`} style={{ width: `${Math.min(pct, 100)}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Link>
  );
}
