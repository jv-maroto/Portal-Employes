import { useEffect, useState, useMemo, useCallback } from "react";
import { Plus, Calendar, ChevronDown, Palmtree, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import VacationForm from "../components/vacations/vacation-form";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import api from "../api";

export default function VacationsPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [vacations, setVacations] = useState([]);
    const [vacationData, setVacationData] = useState(null);
    const [daysOffData, setDaysOffData] = useState(null);
    const [permissionsData, setPermissionsData] = useState(null);

    const fetchVacations = useCallback(async () => {
        try {
            const response = await api.get("vacaciones/listar/");
            const data = response.data;

            const filteredVacations = data.filter(
                (vacation) => new Date(vacation.inicio).getFullYear() === selectedYear
            );
            setVacations(filteredVacations);

            const totalVacationDays = 30;
            const totalDaysOff = 10;
            const totalPermissions = 5;

            const calcDays = (items) => items.reduce((sum, v) => {
                return sum + Math.ceil((new Date(v.fin) - new Date(v.inicio)) / (1000 * 60 * 60 * 24)) + 1;
            }, 0);

            const vacRanges = filteredVacations.filter(v => v.motivo === "Vacaciones");
            const takenVac = calcDays(vacRanges);
            setVacationData({ total: totalVacationDays, taken: takenVac, remaining: Math.max(totalVacationDays - takenVac, 0) });

            const daysOffRanges = filteredVacations.filter(v => v.motivo === "Días Libres");
            const takenDO = calcDays(daysOffRanges);
            setDaysOffData({ total: totalDaysOff, taken: takenDO, remaining: Math.max(totalDaysOff - takenDO, 0) });

            const permRanges = filteredVacations.filter(v => v.motivo === "Permisos");
            const takenPerm = calcDays(permRanges);
            setPermissionsData({ total: totalPermissions, taken: takenPerm, remaining: Math.max(totalPermissions - takenPerm, 0) });
        } catch (error) {
            // Error silenciado
        }
    }, [selectedYear]);

    useEffect(() => {
        fetchVacations();
    }, [fetchVacations]);

    const getVacationStatus = (startDate, endDate) => {
        const today = new Date();
        return endDate < today ? "Caducada" : "Vigente";
    };

    const [currentPage, setCurrentPage] = useState(0);
    const pageSize = 7;
    const sortedVacations = useMemo(() => {
        return [...vacations].sort((a, b) => new Date(b.inicio) - new Date(a.inicio));
    }, [vacations]);

    const totalPages = Math.ceil(sortedVacations.length / pageSize);
    const paginatedVacations = useMemo(() => {
        return sortedVacations.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
    }, [sortedVacations, currentPage, pageSize]);

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

    useEffect(() => {
        if (sortedVacations.length > 0) {
            const idx = 0;
            const pageIdx = Math.floor(idx / pageSize);
            if (pageIdx !== currentPage) {
                setCurrentPage(pageIdx);
            }
        }
    }, [vacations, sortedVacations, currentPage]);

    const motivoConfig = {
        "Vacaciones": { color: "bg-blue-50 text-blue-600 border-blue-200", icon: Palmtree },
        "Días Libres": { color: "bg-emerald-50 text-emerald-600 border-emerald-200", icon: Calendar },
        "Permisos": { color: "bg-violet-50 text-violet-600 border-violet-200", icon: Clock },
    };
    const statusConfig = {
        "Vigente": "bg-green-50 text-green-600",
        "Caducada": "bg-gray-100 text-gray-400",
    };

    const SummaryCard = ({ label, icon: Icon, color, data }) => {
        if (!data) return null;
        const pct = data.total > 0 ? (data.taken / data.total) * 100 : 0;
        return (
            <div className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex items-center gap-2 mb-3">
                    <div className={`w-7 h-7 rounded-lg ${color.light} flex items-center justify-center`}>
                        <Icon className={`h-3.5 w-3.5 ${color.text}`} />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                </div>
                <div className="flex items-end justify-between mb-2">
                    <span className="text-2xl font-heading font-bold text-gray-900">{data.remaining}</span>
                    <span className="text-xs text-gray-400">de {data.total} días</span>
                </div>
                <div className={`h-1.5 rounded-full ${color.track}`}>
                    <div className={`h-full rounded-full ${color.bg} transition-all duration-500`} style={{ width: `${Math.min(pct, 100)}%` }} />
                </div>
                <p className="text-xs text-gray-400 mt-2">{data.taken} días utilizados</p>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 sm:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Panel principal - lista */}
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                    <Calendar className="h-5 w-5 text-blue-500" />
                                </div>
                                <h1 className="text-lg font-heading font-semibold text-gray-900">Mis Vacaciones</h1>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <select
                                        value={selectedYear}
                                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                                        className="appearance-none bg-white border border-gray-200 rounded-lg px-3 py-2 pr-8 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer"
                                    >
                                        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                </div>
                                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                    <DialogTrigger asChild>
                                        <button className="flex items-center gap-1.5 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors">
                                            <Plus className="h-4 w-4" />
                                            <span className="hidden sm:inline">Solicitar</span>
                                        </button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-[90vw] md:max-w-3xl w-full p-4 md:p-6">
                                        <DialogHeader>
                                            <DialogTitle className="text-xl font-heading font-bold text-center">Nueva Solicitud</DialogTitle>
                                        </DialogHeader>
                                        <VacationForm
                                            vacations={vacations}
                                            onCreated={fetchVacations}
                                            onClose={() => setIsDialogOpen(false)}
                                        />
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-100">
                            {monthGroups.length === 0 ? (
                                <div className="p-8 text-center text-gray-400 text-sm">
                                    No hay registros de vacaciones para este año.
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-50">
                                    {monthGroups.map(({ month, items }) => (
                                        <div key={month} className="p-4">
                                            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 capitalize">{month}</h3>
                                            <div className="space-y-2">
                                                {items.map((v) => {
                                                    const dias = Math.ceil((new Date(v.fin) - new Date(v.inicio)) / (1000 * 60 * 60 * 24)) + 1;
                                                    const status = getVacationStatus(new Date(v.inicio), new Date(v.fin));
                                                    const cfg = motivoConfig[v.motivo] || { color: "bg-gray-50 text-gray-600 border-gray-200", icon: Calendar };
                                                    const Icon = cfg.icon;
                                                    return (
                                                        <div key={v.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50/80 transition-colors">
                                                            <div className={`w-8 h-8 rounded-lg ${cfg.color.split(' ')[0]} flex items-center justify-center flex-shrink-0`}>
                                                                <Icon className={`h-4 w-4 ${cfg.color.split(' ')[1]}`} />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-sm font-medium text-gray-700">
                                                                        {format(new Date(v.inicio), "dd MMM", { locale: es })} — {format(new Date(v.fin), "dd MMM", { locale: es })}
                                                                    </span>
                                                                    <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded ${statusConfig[status]}`}>
                                                                        {status}
                                                                    </span>
                                                                </div>
                                                                <span className={`inline-block text-[11px] font-medium px-1.5 py-0.5 rounded border mt-1 ${cfg.color}`}>
                                                                    {v.motivo}
                                                                </span>
                                                            </div>
                                                            <span className="text-sm font-medium text-gray-500 whitespace-nowrap">{dias} días</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {totalPages > 1 && (
                                <div className="flex justify-center items-center gap-1.5 p-4 border-t border-gray-100">
                                    {Array.from({ length: totalPages }).map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setCurrentPage(idx)}
                                            className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${
                                                idx === currentPage
                                                    ? "bg-blue-500 text-white"
                                                    : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                                            }`}
                                        >
                                            {idx + 1}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Panel lateral - resumen */}
                    <div className="w-full lg:w-72 space-y-3">
                        <SummaryCard
                            label="Vacaciones"
                            icon={Palmtree}
                            color={{ light: 'bg-blue-50', text: 'text-blue-500', bg: 'bg-blue-500', track: 'bg-blue-100' }}
                            data={vacationData}
                        />
                        <SummaryCard
                            label="Días Libres"
                            icon={Calendar}
                            color={{ light: 'bg-emerald-50', text: 'text-emerald-500', bg: 'bg-emerald-500', track: 'bg-emerald-100' }}
                            data={daysOffData}
                        />
                        <SummaryCard
                            label="Permisos"
                            icon={Clock}
                            color={{ light: 'bg-violet-50', text: 'text-violet-500', bg: 'bg-violet-500', track: 'bg-violet-100' }}
                            data={permissionsData}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
