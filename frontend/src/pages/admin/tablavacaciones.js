"use client"

import { useState, useEffect } from "react"
import { Search, Calendar, User, Clock, Filter, ChevronDown, Trash2, Palmtree, FileText } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import api from "@/api"

const tipoConfig = {
  Vacaciones: { color: "bg-indigo-500/10 text-indigo-500", icon: Palmtree },
  "Días Libres": { color: "bg-emerald-500/10 text-emerald-500", icon: Calendar },
  Permisos: { color: "bg-violet-500/10 text-violet-500", icon: Clock },
}

export default function TablaVacaciones() {
  const [busqueda, setBusqueda] = useState("")
  const [vacaciones, setVacaciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [dniSuggestions, setDniSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filtroTipo, setFiltroTipo] = useState("Todos")
  const [pagina, setPagina] = useState(1)
  const [ordenColumna, setOrdenColumna] = useState(null)
  const [ordenDesc, setOrdenDesc] = useState(true)
  const filasPorPagina = 8

  useEffect(() => {
    const fetchVacaciones = async () => {
      setLoading(true)
      try {
        const res = await api.get("todas-vacaciones/")
        const adaptados = res.data.map((v) => ({
          ...v,
          nombre: v.nombre || (v.user?.profile ? `${v.user.profile.first_name || ""} ${v.user.profile.last_name || ""}`.trim() : v.user?.first_name && v.user?.last_name ? `${v.user.first_name} ${v.user.last_name}`.trim() : v.user?.username || ""),
          dni: v.dni || v.user?.profile?.dni || v.user?.username || "",
        }))
        setVacaciones(adaptados)
      } catch { setVacaciones([]) }
      finally { setLoading(false) }
    }
    fetchVacaciones()
  }, [])

  useEffect(() => {
    if (busqueda.length > 0) {
      const dnis = Array.from(new Set(vacaciones.map(v => v.dni).filter(d => d && d.toLowerCase().startsWith(busqueda.toLowerCase()))))
      setDniSuggestions(dnis)
      setShowSuggestions(dnis.length > 0)
    } else { setShowSuggestions(false) }
  }, [busqueda, vacaciones])

  let vacacionesFiltradas = vacaciones.filter(v => {
    const matchesBusqueda = (v.nombre && v.nombre.toLowerCase().includes(busqueda.toLowerCase())) || (v.dni && v.dni.toLowerCase().includes(busqueda.toLowerCase()))
    const matchesTipo = filtroTipo === "Todos" || v.tipo === filtroTipo
    return matchesBusqueda && matchesTipo
  })

  if (ordenColumna) {
    vacacionesFiltradas = [...vacacionesFiltradas].sort((a, b) => {
      let valA = a[ordenColumna], valB = b[ordenColumna]
      if (ordenColumna === "inicio" || ordenColumna === "fin") { valA = new Date(valA); valB = new Date(valB) }
      if (valA < valB) return ordenDesc ? 1 : -1
      if (valA > valB) return ordenDesc ? -1 : 1
      return 0
    })
  }

  const totalPaginas = Math.ceil(vacacionesFiltradas.length / filasPorPagina)
  const inicio = (pagina - 1) * filasPorPagina
  const paginaActual = vacacionesFiltradas.slice(inicio, inicio + filasPorPagina)
  const filasVacias = Math.max(0, filasPorPagina - paginaActual.length)

  const formatearFecha = (fecha) => fecha ? new Date(fecha).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" }) : ""
  const tiposUnicos = Array.from(new Set(vacaciones.map(v => v.tipo).filter(Boolean)))

  const handleEliminarVacacion = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar esta vacación?")) return
    try {
      await api.delete(`vacaciones/${id}/eliminar/`)
      setVacaciones(prev => prev.filter(v => v.id !== id))
    } catch { alert("Error al eliminar") }
  }

  const handleOrdenar = (col) => {
    if (ordenColumna === col) setOrdenDesc(prev => !prev)
    else { setOrdenColumna(col); setOrdenDesc(true) }
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-[1400px] mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-heading font-semibold text-foreground">Gestión de Ausencias</h1>
              <p className="text-sm text-muted-foreground">Administra los períodos de ausencia del personal</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{vacacionesFiltradas.length} registros</span>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-card rounded-xl border border-border p-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input type="text" placeholder="Buscar por nombre o DNI..." value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)} className="pl-10 bg-background" autoComplete="off"
                onFocus={() => setShowSuggestions(dniSuggestions.length > 0)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 100)} />
              {showSuggestions && (
                <div className="absolute z-10 bg-popover border border-border rounded-lg w-full mt-1 max-h-40 overflow-y-auto shadow-lg">
                  {dniSuggestions.map((dni, idx) => {
                    const empleado = vacaciones.find(v => v.dni === dni)
                    return (
                      <div key={idx} className="px-3 py-2 hover:bg-muted cursor-pointer flex items-center gap-2"
                        onMouseDown={() => { setBusqueda(dni); setShowSuggestions(false) }}>
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="font-mono text-sm text-foreground">{dni}</span>
                        {empleado && <span className="ml-2 text-muted-foreground text-sm truncate max-w-[160px]">{empleado.nombre}</span>}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="min-w-[140px] bg-background">
                  <Filter className="w-4 h-4 mr-2" />{filtroTipo}<ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFiltroTipo("Todos")}>Todos los tipos</DropdownMenuItem>
                {tiposUnicos.map(tipo => {
                  const cfg = tipoConfig[tipo]
                  const Icon = cfg?.icon
                  return (
                    <DropdownMenuItem key={tipo} onClick={() => setFiltroTipo(tipo)}>
                      {Icon && <Icon className="w-4 h-4 mr-2" />}{tipo}
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              <span className="ml-3 text-muted-foreground">Cargando datos...</span>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table className="min-w-[800px]">
                  <TableHeader>
                    <TableRow className="bg-muted/30 border-b border-border">
                      <TableHead className="font-semibold text-foreground">
                        <div className="flex items-center gap-2"><User className="w-4 h-4" />Empleado</div>
                      </TableHead>
                      <TableHead className="font-semibold cursor-pointer select-none text-foreground" onClick={() => handleOrdenar("dni")}>
                        DNI {ordenColumna === "dni" && (ordenDesc ? "↓" : "↑")}
                      </TableHead>
                      <TableHead className="font-semibold cursor-pointer select-none text-foreground" onClick={() => handleOrdenar("tipo")}>
                        <div className="flex items-center gap-2"><Filter className="w-4 h-4" />Tipo {ordenColumna === "tipo" && (ordenDesc ? "↓" : "↑")}</div>
                      </TableHead>
                      <TableHead className="font-semibold cursor-pointer select-none text-foreground" onClick={() => handleOrdenar("inicio")}>
                        <div className="flex items-center gap-2"><Calendar className="w-4 h-4" />Inicio {ordenColumna === "inicio" && (ordenDesc ? "↓" : "↑")}</div>
                      </TableHead>
                      <TableHead className="font-semibold cursor-pointer select-none text-foreground" onClick={() => handleOrdenar("fin")}>
                        <div className="flex items-center gap-2"><Calendar className="w-4 h-4" />Fin {ordenColumna === "fin" && (ordenDesc ? "↓" : "↑")}</div>
                      </TableHead>
                      <TableHead className="font-semibold text-center text-foreground">
                        <div className="flex items-center justify-center gap-2"><Clock className="w-4 h-4" />Días</div>
                      </TableHead>
                      <TableHead className="font-semibold text-center text-foreground">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginaActual.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-16">
                          <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <Search className="w-8 h-8" />
                            <p className="text-base font-medium">No se encontraron resultados</p>
                            <p className="text-sm">Intenta ajustar los filtros</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      <>
                        {paginaActual.map((v, idx) => {
                          const cfg = tipoConfig[v.tipo]
                          const Icon = cfg?.icon || Calendar
                          return (
                            <TableRow key={idx} className="hover:bg-muted/30 transition-colors border-b border-border">
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                    <User className="w-4 h-4 text-primary" />
                                  </div>
                                  <span className="text-card-foreground">{v.nombre}</span>
                                </div>
                              </TableCell>
                              <TableCell className="font-mono text-sm text-muted-foreground">{v.dni}</TableCell>
                              <TableCell>
                                <Badge variant="secondary" className={`${cfg?.color || "bg-muted text-muted-foreground"} border-0`}>
                                  <Icon className="w-3 h-3 mr-1" />{v.tipo}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-muted-foreground">{formatearFecha(v.inicio)}</TableCell>
                              <TableCell className="text-muted-foreground">{formatearFecha(v.fin)}</TableCell>
                              <TableCell className="text-center">
                                <Badge variant="outline" className="font-semibold">{v.dias} {v.dias === 1 ? "día" : "días"}</Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                <Button variant="ghost" size="icon" onClick={() => handleEliminarVacacion(v.id)} title="Eliminar">
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                        {Array.from({ length: filasVacias }).map((_, idx) => (
                          <TableRow key={`empty-${idx}`}><TableCell colSpan={7} className="py-5" /></TableRow>
                        ))}
                      </>
                    )}
                  </TableBody>
                </Table>
              </div>
              {totalPaginas > 1 && (
                <div className="flex justify-between items-center px-4 py-3 border-t border-border">
                  <span className="text-sm text-muted-foreground">Página {pagina} de {totalPaginas}</span>
                  <div className="flex gap-1.5">
                    <Button variant="outline" size="sm" disabled={pagina === 1} onClick={() => setPagina(p => Math.max(1, p - 1))}>Anterior</Button>
                    <Button variant="outline" size="sm" disabled={pagina === totalPaginas} onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}>Siguiente</Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {["Vacaciones", "Días Libres", "Permisos"].map(tipo => {
            const cfg = tipoConfig[tipo]
            const Icon = cfg?.icon || Calendar
            const count = vacaciones.filter(v => v.tipo === tipo).length
            const totalDias = vacaciones.filter(v => v.tipo === tipo).reduce((sum, v) => sum + (v.dias || 0), 0)
            return (
              <div key={tipo} className="bg-card rounded-xl border border-border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{tipo}</p>
                    <p className="text-2xl font-heading font-bold text-foreground">{count}</p>
                    <p className="text-xs text-muted-foreground">{totalDias} días total</p>
                  </div>
                  <div className={`w-10 h-10 rounded-lg ${cfg?.color?.split(' ')[0] || 'bg-muted'} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${cfg?.color?.split(' ')[1] || 'text-muted-foreground'}`} />
                  </div>
                </div>
              </div>
            )
          })}
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Empleados</p>
                <p className="text-2xl font-heading font-bold text-foreground">
                  {new Set(vacaciones.filter(v => ["Vacaciones","Días Libres","Permisos"].includes(v.tipo)).map(v => v.dni || v.nombre)).size}
                </p>
                <p className="text-xs text-muted-foreground">usuarios únicos</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
