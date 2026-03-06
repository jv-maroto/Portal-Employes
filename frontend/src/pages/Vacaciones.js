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
            const filteredVacations = data.filter(v => new Date(v.inicio).getFullYear() === selectedYear);
            setVacations(filteredVacations);

            const calcDays = (items) => items.reduce((sum, v) => sum + Math.ceil((new Date(v.fin) - new Date(v.inicio)) / (1000 * 60 * 60 * 24)) + 1, 0);

            const vacRanges = filteredVacations.filter(v => v.motivo === "Vacaciones");
            const takenVac = calcDays(vacRanges);
            setVacationData({ total: 30, taken: takenVac, remaining: Math.max(30 - takenVac, 0) });

            const daysOffRanges = filteredVacations.filter(v => v.motivo === "Días Libres");
            const takenDO = calcDays(daysOffRanges);
            setDaysOffData({ total: 10, taken: takenDO, remaining: Math.max(10 - takenDO, 0) });

            const permRanges = filteredVacations.filter(v => v.motivo === "Permisos");
            const takenPerm = calcDays(permRanges);
            setPermissionsData({ total: 5, taken: takenPerm, remaining: Math.max(5 - takenPerm, 0) });
        } catch (error) {}
    }, [selectedYear]);

    useEffect(() => { fetchVacations(); }, [fetchVacations]);

    const getVacationStatus = (startDate, endDate) => endDate < new Date() ? "Caducada" : "Vigente";

    const [currentPage, setCurrentPage] = useState(0);
    const pageSize = 7;
    const sortedVacations = useMemo(() => [...vacations].sort((a, b) => new Date(b.inicio) - new Date(a.inicio)), [vacations]);
    const totalPages = Math.ceil(sortedVacations.length / pageSize);
    const paginatedVacations = useMemo(() => sortedVacations.slice(currentPage * pageSize, (currentPage + 1) * pageSize), [sortedVacations, currentPage, pageSize]);

    const monthGroups = useMemo(() => {
        const map = new Map();
        paginatedVacations.forEach(v => {
            const key = format(new Date(v.inicio), "LLLL yyyy", { locale: es });
            if (!map.has(key)) map.set(key, []);
            map.get(key).push(v);
        });
        return Array.from(map.entries()).map(([month, items]) => ({ month, items }))
            .sort((a, b) => new Date(b.items[0].inicio) - new Date(a.items[0].inicio));
    }, [paginatedVacations]);

    useEffect(() => {
        if (sortedVacations.length > 0) {
            const pageIdx = Math.floor(0 / pageSize);
            if (pageIdx !== currentPage) setCurrentPage(pageIdx);
        }
    }, [vacations, sortedVacations, currentPage]);

    const motivoConfig = {
        "Vacaciones": { color: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20", icon: Palmtree },
        "Días Libres": { color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", icon: Calendar },
        "Permisos": { color: "bg-violet-500/10 text-violet-500 border-violet-500/20", icon: Clock },
    };
    const statusConfig = {
        "Vigente": "bg-emerald-500/10 text-emerald-500",
        "Caducada": "bg-muted text-muted-foreground",
    };

    const SummaryCard = ({ label, icon: Icon, color, data }) => {
        if (!data) return null;
        const pct = data.total > 0 ? (data.taken / data.total) * 100 : 0;
        return (
            <div className="bg-card rounded-xl border border-border p-4">
                <div className="flex items-center gap-2 mb-3">
                    <div className={`w-7 h-7 rounded-lg ${color.light} flex items-center justify-center`}>
                        <Icon className={`h-3.5 w-3.5 ${color.text}`} />
                    </div>
                    <span className="text-sm font-medium text-card-foreground">{label}</span>
                </div>
                <div className="flex items-end justify-between mb-2">
                    <span className="text-2xl font-heading font-bold text-foreground">{data.remaining}</span>
                    <span className="text-xs text-muted-foreground">de {data.total} días</span>
                </div>
                <div className={`h-1.5 rounded-full ${color.track}`}>
                    <div className={`h-full rounded-full ${color.bg} transition-all duration-500`} style={{ width: `${Math.min(pct, 100)}%` }} />
                </div>
                <p className="text-xs text-muted-foreground mt-2">{data.taken} días utilizados</p>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
            <div className="max-w-[1400px] mx-auto">
                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <Calendar className="h-5 w-5 text-primary" />
                                </div>
                                <h1 className="text-lg font-heading font-semibold text-foreground">Mis Vacaciones</h1>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}
                                        className="appearance-none bg-card border border-border rounded-lg px-3 py-2 pr-8 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer">
                                        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => (<option key={y} value={y}>{y}</option>))}
                                    </select>
                                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                                </div>
                                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                    <DialogTrigger asChild>
                                        <button className="flex items-center gap-1.5 px-3 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium rounded-lg transition-colors">
                                            <Plus className="h-4 w-4" /><span className="hidden sm:inline">Solicitar</span>
                                        </button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-[90vw] md:max-w-3xl w-full p-4 md:p-6">
                                        <DialogHeader>
                                            <DialogTitle className="text-xl font-heading font-bold text-center">Nueva Solicitud</DialogTitle>
                                        </DialogHeader>
                                        <VacationForm vacations={vacations} onCreated={fetchVacations} onClose={() => setIsDialogOpen(false)} />
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>

                        <div className="bg-card rounded-xl border border-border">
                            {monthGroups.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground text-sm">No hay registros para este año.</div>
                            ) : (
                                <div className="divide-y divide-border">
                                    {monthGroups.map(({ month, items }) => (
                                        <div key={month} className="p-4">
                                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 capitalize">{month}</h3>
                                            <div className="space-y-2">
                                                {items.map(v => {
                                                    const dias = Math.ceil((new Date(v.fin) - new Date(v.inicio)) / (1000 * 60 * 60 * 24)) + 1;
                                                    const status = getVacationStatus(new Date(v.inicio), new Date(v.fin));
                                                    const cfg = motivoConfig[v.motivo] || { color: "bg-muted text-muted-foreground", icon: Calendar };
                                                    const Icon = cfg.icon;
                                                    return (
                                                        <div key={v.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                                                            <div className={`w-8 h-8 rounded-lg ${cfg.color.split(' ')[0]} flex items-center justify-center flex-shrink-0`}>
                                                                <Icon className={`h-4 w-4 ${cfg.color.split(' ')[1]}`} />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-sm font-medium text-card-foreground">
                                                                        {format(new Date(v.inicio), "dd MMM", { locale: es })} — {format(new Date(v.fin), "dd MMM", { locale: es })}
                                                                    </span>
                                                                    <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded ${statusConfig[status]}`}>{status}</span>
                                                                </div>
                                                                <span className={`inline-block text-[11px] font-medium px-1.5 py-0.5 rounded border mt-1 ${cfg.color}`}>{v.motivo}</span>
                                                            </div>
                                                            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">{dias} días</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {totalPages > 1 && (
                                <div className="flex justify-center items-center gap-1.5 p-4 border-t border-border">
                                    {Array.from({ length: totalPages }).map((_, idx) => (
                                        <button key={idx} onClick={() => setCurrentPage(idx)}
                                            className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${
                                                idx === currentPage ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                                            }`}>{idx + 1}</button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="w-full lg:w-80 flex-shrink-0 space-y-3">
                        <SummaryCard label="Vacaciones" icon={Palmtree} color={{ light:'bg-indigo-500/10', text:'text-indigo-500', bg:'bg-indigo-500', track:'bg-indigo-500/15' }} data={vacationData} />
                        <SummaryCard label="Días Libres" icon={Calendar} color={{ light:'bg-emerald-500/10', text:'text-emerald-500', bg:'bg-emerald-500', track:'bg-emerald-500/15' }} data={daysOffData} />
                        <SummaryCard label="Permisos" icon={Clock} color={{ light:'bg-violet-500/10', text:'text-violet-500', bg:'bg-violet-500', track:'bg-violet-500/15' }} data={permissionsData} />
                    </div>
                </div>
            </div>
        </div>
    );
}
