import { useEffect, useState, useMemo, useCallback } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import VacationSummary from "../components/vacations/summaries/vacation-summary";
import DaysOffSummary from "../components/vacations/summaries/days-off-summary";
import PermisosSummary from "../components/vacations/summaries/permisos-summary";
// Sidebar import removed as it's not used
import VacationForm from "../components/vacations/vacation-form";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function VacationsPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedYear, setSelectedYear] = useState(2025);
    const [vacations, setVacations] = useState([]);
    const [vacationData, setVacationData] = useState(null);
    const [daysOffData, setDaysOffData] = useState(null);
    const [permissionsData, setPermissionsData] = useState(null);

    // Hacemos fetchVacations reutilizable para refrescar tras crear
    const fetchVacations = useCallback(async () => {
        try {
            const response = await fetch("http://localhost:8000/api/vacaciones/listar/", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Error en el fetch: ${response.statusText}`);
            }

            const data = await response.json();
            console.log("Datos obtenidos del backend:", data);

            const filteredVacations = data.filter(
                (vacation) => new Date(vacation.inicio).getFullYear() === selectedYear
            );
            setVacations(filteredVacations);

                const totalVacationDays = 30;
                const totalDaysOff = 10;
                const totalPermissions = 5;

                const vacationRanges = filteredVacations.filter((vacation) => vacation.motivo === "Vacaciones");
                const takenVacationDays = vacationRanges.reduce((sum, vacation) => {
                    const startDate = new Date(vacation.inicio);
                    const endDate = new Date(vacation.fin);
                    return sum + Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
                }, 0);

                const vacationData = {
                    total: totalVacationDays,
                    taken: takenVacationDays,
                    remaining: Math.max(totalVacationDays - takenVacationDays, 0),
                    nextVacation: vacationRanges.length
                        ? `Desde ${format(new Date(vacationRanges[0].inicio), "dd/MM/yyyy", { locale: es })} a ${format(
                              new Date(vacationRanges[0].fin),
                              "dd/MM/yyyy",
                              { locale: es }
                          )}`
                        : "Ninguna",
                };
                setVacationData(vacationData);

                const daysOffRanges = filteredVacations.filter((vacation) => vacation.motivo === "Días Libres");
                const takenDaysOff = daysOffRanges.reduce((sum, vacation) => {
                    const startDate = new Date(vacation.inicio);
                    const endDate = new Date(vacation.fin);
                    return sum + Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
                }, 0);

                const daysOffData = {
                    total: totalDaysOff,
                    taken: takenDaysOff,
                    remaining: Math.max(totalDaysOff - takenDaysOff, 0),
                    nextDayOff: daysOffRanges.length
                        ? `Desde ${format(new Date(daysOffRanges[0].inicio), "dd/MM/yyyy", { locale: es })} a ${format(
                              new Date(daysOffRanges[0].fin),
                              "dd/MM/yyyy",
                              { locale: es }
                          )}`
                        : "Ninguna",
                };
                setDaysOffData(daysOffData);

                const permissionsRanges = filteredVacations.filter((vacation) => vacation.motivo === "Permisos");
                console.log("Permisos encontrados:", permissionsRanges);
                const takenPermissions = permissionsRanges.reduce((sum, vacation) => {
                    const startDate = new Date(vacation.inicio);
                    const endDate = new Date(vacation.fin);
                    return sum + Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
                }, 0);

                const permissionsData = {
                    total: totalPermissions,
                    taken: takenPermissions,
                    remaining: Math.max(totalPermissions - takenPermissions, 0),
                    nextPermission: permissionsRanges.length
                        ? `Desde ${format(new Date(permissionsRanges[0].inicio), "dd/MM/yyyy", { locale: es })} a ${format(
                              new Date(permissionsRanges[0].fin),
                              "dd/MM/yyyy",
                              { locale: es }
                          )}`
                        : "Ninguna",
                };
                console.log("Datos de permisos calculados:", permissionsData);
                setPermissionsData(permissionsData);
        } catch (error) {
            console.error("Error al obtener vacaciones:", error);
        }
    }, [selectedYear]);

    useEffect(() => {
        fetchVacations();
    }, [fetchVacations]);

    const getVacationStatus = (startDate, endDate) => {
        const today = new Date();
        if (endDate < today) {
            return "Caducada";
        } else {
            return "Vigente";
        }
    };


    // Paginación por número de vacaciones (no por mes)
    const [currentPage, setCurrentPage] = useState(0);
    const pageSize = 7; // Número de vacaciones por página
    // Ordenar vacaciones por inicio descendente
    const sortedVacations = useMemo(() => {
        return [...vacations].sort((a, b) => new Date(b.inicio) - new Date(a.inicio));
    }, [vacations])

    // Paginación real
    const totalPages = Math.ceil(sortedVacations.length / pageSize);
    const paginatedVacations = useMemo(() => {
        return sortedVacations.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
    }, [sortedVacations, currentPage, pageSize]);

    // Agrupar SOLO las vacaciones de la página actual por mes
    const monthGroups = useMemo(() => {
        const map = new Map();
        paginatedVacations.forEach((v) => {
            const key = format(new Date(v.inicio), "LLLL yyyy", { locale: es });
            if (!map.has(key)) map.set(key, []);
            map.get(key).push(v);
        });
        return Array.from(map.entries())
            .map(([month, items]) => ({ month, items }))
            .sort((a, b) => new Date(b.items[0].inicio) - new Date(a.items[0].inicio));
    }, [paginatedVacations]);

    // Si se añade una vacación nueva, ir a la página donde está la más reciente
    useEffect(() => {
        if (sortedVacations.length > 0) {
            const mostRecentId = sortedVacations[0].id;
            const idx = sortedVacations.findIndex(v => v.id === mostRecentId);
            const pageIdx = Math.floor(idx / pageSize);
            if (pageIdx !== currentPage) {
                setCurrentPage(pageIdx);
            }
        }
    }, [vacations, sortedVacations, currentPage]);

    // Etiquetas de tipo
    // Colores más vivos para etiquetas
    const motivoColor = {
        "Vacaciones": "bg-emerald-100 text-emerald-700 border border-emerald-300",
        "Días Libres": "bg-blue-100 text-blue-700 border border-blue-300",
        "Permisos": "bg-amber-100 text-amber-700 border border-amber-300"
    };
    const statusColor = {
        "Vigente": "bg-green-100 text-green-700 border border-green-300",
        "Caducada": "bg-red-100 text-red-700 border border-red-300"
    };

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
            {/* Panel meses paginados */}
            <div className="w-full md:w-2/3 lg:w-3/4 bg-white shadow-sm">
                <div className="sticky top-0 z-10 bg-white border-b p-4">
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        className="w-full md:w-48 p-2 border rounded"
                    >
                        <option value={2025}>2025</option>
                        <option value={2024}>2024</option>
                        <option value={2023}>2023</option>
                        <option value={2022}>2022</option>
                    </select>
                </div>
                <div className="p-4 space-y-3">
                    {monthGroups.map(({ month, items }) => (
                        <div key={month} className="mb-2">
                            <h2 className="text-lg font-semibold mb-2 capitalize">{month}</h2>
                            <div className="space-y-2">
                                {items.map((v) => {
                                    const dias = Math.ceil((new Date(v.fin) - new Date(v.inicio)) / (1000 * 60 * 60 * 24)) + 1;
                                    const status = getVacationStatus(new Date(v.inicio), new Date(v.fin));
                                    return (
                                        <div
                                            key={v.id}
                                            className="flex items-center bg-white rounded-xl border border-gray-200 px-6 py-3 mb-1 shadow-sm"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-semibold text-base text-gray-800">
                                                        {format(new Date(v.inicio), "dd MMM", { locale: es })} - {format(new Date(v.fin), "dd MMM", { locale: es })}
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap gap-2 mt-1">
                                                    <span className={`px-2 py-0.5 text-xs rounded-lg font-semibold ${statusColor[status]}`}>{status}</span>
                                                    <span className={`px-2 py-0.5 text-xs rounded-lg font-semibold ${motivoColor[v.motivo] || "bg-gray-200 text-gray-700 border border-gray-300"}`}>{v.motivo}</span>
                                                </div>
                                            </div>
                                            <div className="text-base text-gray-700 font-medium whitespace-nowrap ml-6">{dias} días</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
                {/* Controles de paginación tipo "comunicados" */}
                <div className="flex justify-center items-center gap-2 p-4 border-t mt-2">
                    {Array.from({ length: totalPages }).map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentPage(idx)}
                            className={`w-8 h-8 rounded-md flex items-center justify-center text-sm font-semibold transition-colors ${
                                idx === currentPage
                                    ? "bg-blue-500 text-white shadow"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                            disabled={idx === currentPage}
                        >
                            {idx + 1}
                        </button>
                    ))}
                </div>
            </div>

            {/* Panel lateral: resumen y form */}
            <div className="w-full md:w-1/3 lg:w-1/4 p-2 border-t md:border-t-0 md:border-l">
                <div className="flex justify-between items-center mb-2">
                    <h1 className="text-xl font-bold">Vacaciones</h1>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" className="bg-emerald-500 text-white hover:bg-emerald-600">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-[90vw] md:max-w-3xl w-full p-4 md:p-6">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-bold text-center">Nueva Solicitud</DialogTitle>
                            </DialogHeader>
                            <VacationForm 
                                vacations={vacations} 
                                onCreated={fetchVacations}
                                onClose={() => setIsDialogOpen(false)}
                            />
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="space-y-4">
                    <VacationSummary vacationData={vacationData} />
                    <DaysOffSummary daysOffData={daysOffData} />
                    <PermisosSummary permissionsData={permissionsData} />
                </div>
            </div>
        </div>
    );
}
