'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button"; 
import { Filter } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu";
  import { useState } from "react";
  import { format, parseISO, isValid } from "date-fns";
  import { es } from "date-fns/locale"; // Para soporte en español
  
  export default function Sidebar({ year, vacations = [] }) {
    const [filter, setFilter] = useState("all");
  
    const getTypeBadgeStyle = (type) => {
      switch (type) {
        case "Vacaciones":
          return "bg-emerald-100 text-emerald-800 hover:bg-emerald-100";
        case "Días Libres":
          return "bg-blue-100 text-blue-800 hover:bg-blue-100";
        case "Permisos":
          return "bg-amber-100 text-amber-800 hover:bg-amber-100";
        default:
          return "bg-gray-100 text-gray-800 hover:bg-gray-100";
      }
    };
  
    // Función para determinar si las vacaciones están vigentes o caducadas
    const getVacationStatus = (startDate, endDate) => {
      const today = new Date();
      if (endDate < today) {
        return "Caducada";
      } else {
        return "Vigente";
      }
    };
  
    // Filtrar vacaciones por tipo (motivo) si es necesario
    const filteredVacations = (vacations || []).filter(
      (vacation) => filter === "all" || vacation.motivo === filter
    );
  
    // Agrupar las vacaciones por mes
    const groupedVacations = filteredVacations.reduce((acc, vacation) => {
      const month = new Date(vacation.inicio).toLocaleString("es", { month: "long" });
      const formattedMonth = month.charAt(0).toUpperCase() + month.slice(1); // Primera letra en mayúscula
      if (!acc[formattedMonth]) {
        acc[formattedMonth] = [];
      }
      acc[formattedMonth].push(vacation);
      return acc;
    }, {});
  
    return (
      <div className="flex flex-col">
        <div className="sticky top-[73px] z-10 p-4 border-b bg-gray-50">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full md:w-[200px]">
                <Filter className="mr-2 h-4 w-4" />
                {filter === "all" ? "Todos los tipos" : filter}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full md:w-[200px]">
              <DropdownMenuRadioGroup value={filter} onValueChange={setFilter}>
                <DropdownMenuRadioItem value="all">Todos los tipos</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="Vacaciones">Vacaciones</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="Días Libres">Días Libres</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="Permisos">Permisos</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
  
        <div className="flex-1 overflow-auto">
          {Object.keys(groupedVacations).map((month) => (
            <div key={month} className="px-4 py-3 border-b">
              <div className="flex justify-between items-center mb-2">
                <div className="font-medium">{month}</div>
                <div className="text-sm text-gray-500">{year}</div>
              </div>
              <div className="space-y-2">
                {groupedVacations[month].map((vacation, index) => {
                  const startDate = parseISO(vacation.inicio);
                  const endDate = parseISO(vacation.fin);
  
                  const formattedRange = isValid(startDate) && isValid(endDate)
                    ? `${format(startDate, "dd MMM", { locale: es })} - ${format(endDate, "dd MMM", { locale: es })}`
                    : "Fechas inválidas";
  
                  const vacationStatus = getVacationStatus(startDate, endDate); // Determina si es vigente o caducada
  
                  return (
                    <div key={index} className="bg-gray-50 p-2 rounded-md text-sm">
                      <div className="flex justify-between items-center">
                        <span>{formattedRange}</span>
                        <span className="text-gray-500">{Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1} días</span>
                      </div>
                      <div className="flex gap-1 mt-1">
                        <Badge
                          className={vacationStatus === "Vigente" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                        >
                          {vacationStatus}
                        </Badge>
                        <Badge className={getTypeBadgeStyle(vacation.motivo)}>
                          {vacation.motivo}
                        </Badge>
                      </div>
                      
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  