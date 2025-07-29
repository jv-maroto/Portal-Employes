import React from 'react';
import { Link } from "react-router-dom"; // Importa Link
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from 'lucide-react';
import { usePayslipContext } from "@/contexts/NominasContext";

export function RecentPayslips() {
  const { payrollData, error, loading } = usePayslipContext();

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

  if (loading) {
    return <p className="text-center text-gray-500">Cargando nóminas...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  // Filtrar solo nóminas reales: que el archivo no contenga 'vacacion' ni 'vacaciones' en la ruta o nombre
  const realPayslips = payrollData.filter(p => {
    const file = (p.file || '').toLowerCase();
    return !file.includes('vacacion') && !file.includes('vacaciones');
  });

  // Ordenar y mostrar solo las 3 más recientes
  const recentPayslips = realPayslips
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 3);

  // Determinar el año de las nóminas más recientes (si hay)
  let yearLabel = '';
  if (recentPayslips.length > 0) {
    // Tomar el año de la nómina más reciente
    yearLabel = recentPayslips[0].year || '';
  }

  if (recentPayslips.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Últimas Nóminas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-100 rounded p-2 text-center text-gray-600 font-semibold mb-2">
            Nóminas año {new Date().getFullYear()}
          </div>
          <p className="text-gray-500 text-center">No se encontraron nóminas disponibles.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Link to="/nominas" className="block no-underline"> {/* Envuelve el panel en un enlace */}
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
          <CardTitle>Últimas Nóminas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-100 rounded p-2 text-center text-gray-600 font-semibold mb-2">
            Nóminas año {yearLabel || new Date().getFullYear()}
          </div>
          <div className="space-y-4">
            {recentPayslips.map((payslip, index) => {
              let mes = '';
              let year = payslip.year || '';
              if (payslip.month) {
                let mesKey = '';
                if (typeof payslip.month === 'number') {
                  mesKey = String(payslip.month).padStart(2, '0');
                } else if (typeof payslip.month === 'string') {
                  mesKey = payslip.month.padStart(2, '0');
                }
                mes = months[mesKey] || '';
              }
              return (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">
                      {mes && year ? `Nómina de ${mes} ${year}` : mes ? `Nómina de ${mes}` : 'Nómina'}
                    </p>
                    <p className="text-sm text-gray-500">{payslip.date}</p>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
