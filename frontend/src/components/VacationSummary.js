import React from 'react';
import { Link } from "react-router-dom"; 
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useVacationContext } from "@/contexts/VacationContext"; 

export function VacationSummary() {
  const { vacationData, daysOffData, permissionsData } = useVacationContext();

  if (!vacationData || !daysOffData || !permissionsData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Resumen de Ausencias</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-gray-500">Cargando datos...</p>
        </CardContent>
      </Card>
    );
  }

  const { total: totalVacations, taken: takenVacations } = vacationData;
  const { total: totalDaysOff, taken: takenDaysOff } = daysOffData;
  const { total: totalPermissions, taken: takenPermissions } = permissionsData;

  const progressVacations = (takenVacations / totalVacations) * 100;
  const progressDaysOff = (takenDaysOff / totalDaysOff) * 100;
  const progressPermissions = (takenPermissions / totalPermissions) * 100;

  return (
    <Link to="/vacaciones" className="block no-underline"> 
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
          <CardTitle>Resumen de Ausencias</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex justify-between mb-2">
              <span className="font-semibold text-blue-800">Vacaciones Totales</span>
              <span>{takenVacations} / {totalVacations} días</span>
            </div>
            <div className="relative h-2 bg-gray-200 rounded-full">
              <div
                className="absolute h-full rounded-full bg-blue-500"
                style={{ width: `${progressVacations}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span className="font-semibold text-teal-800">Días Libres</span>
              <span>{takenDaysOff} / {totalDaysOff} días</span>
            </div>
            <div className="relative h-2 bg-gray-200 rounded-full">
              <div
                className="absolute h-full rounded-full bg-teal-500"
                style={{ width: `${progressDaysOff}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span className="font-semibold text-purple-800">Permisos</span>
              <span>{takenPermissions} / {totalPermissions} días</span>
            </div>
            <div className="relative h-2 bg-gray-200 rounded-full">
              <div
                className="absolute h-full rounded-full bg-purple-500"
                style={{ width: `${progressPermissions}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
