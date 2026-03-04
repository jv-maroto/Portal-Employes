import React, { createContext, useContext, useState, useEffect } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import api from "../api";

const VacationContext = createContext();

export const VacationProvider = ({ children }) => {
    const [vacationData, setVacationData] = useState(null);
    const [daysOffData, setDaysOffData] = useState(null);
    const [permissionsData, setPermissionsData] = useState(null);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    useEffect(() => {
        const fetchVacations = async () => {
            try {
                const response = await api.get("vacaciones/listar/");
                const data = response.data;
                const filteredVacations = data.filter(
                    (vacation) => new Date(vacation.inicio).getFullYear() === selectedYear
                );

                const calculateSummary = (vacations, type, totalDays) => {
                    const ranges = vacations.filter((vacation) => vacation.motivo === type);
                    const takenDays = ranges.reduce((sum, vacation) => {
                        const startDate = new Date(vacation.inicio);
                        const endDate = new Date(vacation.fin);
                        return sum + Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
                    }, 0);

                    return {
                        total: totalDays,
                        taken: takenDays,
                        remaining: Math.max(totalDays - takenDays, 0),
                        next: ranges.length
                            ? `Desde ${format(new Date(ranges[0].inicio), "dd/MM/yyyy", { locale: es })} a ${format(
                                  new Date(ranges[0].fin),
                                  "dd/MM/yyyy",
                                  { locale: es }
                              )}`
                            : "Ninguna",
                    };
                };

                setVacationData(calculateSummary(filteredVacations, "Vacaciones", 30));
                setDaysOffData(calculateSummary(filteredVacations, "Días Libres", 10));
                setPermissionsData(calculateSummary(filteredVacations, "Permisos", 5));
            } catch (error) {
                // Error silenciado en producción
            }
        };

        fetchVacations();
    }, [selectedYear]);

    return (
        <VacationContext.Provider
            value={{
                vacationData,
                daysOffData,
                permissionsData,
                selectedYear,
                setSelectedYear,
            }}
        >
            {children}
        </VacationContext.Provider>
    );
};

export const useVacationContext = () => useContext(VacationContext);
