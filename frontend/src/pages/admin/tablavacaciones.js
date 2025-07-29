"use client"

import { useState, useEffect } from "react"
import { Search, Calendar, User, Clock, Filter, ChevronDown, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import api from "@/api"

const tipoConfig = {
  Vacaciones: {
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
    icon: "🏖️",
  },
  "Días Libres": {
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: "🗓️",
  },
  Permisos: {
    color: "bg-amber-100 text-amber-800 border-amber-200",
    icon: "📋",
  },
  
}

export default function TablaVacaciones() {
  const [busqueda, setBusqueda] = useState("")
  const [vacaciones, setVacaciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [dniSuggestions, setDniSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filtroTipo, setFiltroTipo] = useState("Todos")
  const [pagina, setPagina] = useState(1)
  const [ordenColumna, setOrdenColumna] = useState(null) // 'dni', 'tipo', 'inicio', 'fin'
  const [ordenDesc, setOrdenDesc] = useState(true)
  const filasPorPagina = 6

  // Detecta si el usuario es admin (ajusta según tu lógica real)
  const isAdmin = localStorage.getItem("is_staff") === "true" || localStorage.getItem("is_superuser") === "true"

  useEffect(() => {
    const fetchVacaciones = async () => {
      setLoading(true)
      try {
        const token = localStorage.getItem("access_token")
        // Siempre usa el endpoint de admin
        const res = await api.get("todas-vacaciones/", {
          headers: { Authorization: `Bearer ${token}` },
        })
        console.log("VACACIONES RECIBIDAS:", res.data)
        const adaptados = res.data.map((v) => ({
          ...v,
          nombre:
            v.nombre ||
            (v.user?.profile
              ? `${v.user.profile.first_name || ""} ${v.user.profile.last_name || ""}`.trim()
              : v.user?.first_name && v.user?.last_name
              ? `${v.user.first_name} ${v.user.last_name}`.trim()
              : v.user?.username || ""),
          dni: v.dni || v.user?.profile?.dni || v.user?.username || "",
        }))
        setVacaciones(adaptados)
      } catch (err) {
        setVacaciones([])
      } finally {
        setLoading(false)
      }
    }
    fetchVacaciones()
    // eslint-disable-next-line
  }, [])

  // Sugerencias de DNI
  useEffect(() => {
    if (busqueda.length > 0) {
      const dnis = Array.from(
        new Set(
          vacaciones.map((v) => v.dni).filter((dni) => dni && dni.toLowerCase().startsWith(busqueda.toLowerCase()))
        )
      )
      setDniSuggestions(dnis)
      setShowSuggestions(dnis.length > 0)
    } else {
      setShowSuggestions(false)
    }
  }, [busqueda, vacaciones])

  const handleSuggestionClick = (dni) => {
    setBusqueda(dni)
    setShowSuggestions(false)
  }

  // Filtrar vacaciones
  let vacacionesFiltradas = vacaciones.filter((v) => {
    const matchesBusqueda =
      (v.nombre && v.nombre.toLowerCase().includes(busqueda.toLowerCase())) ||
      (v.dni && v.dni.toLowerCase().includes(busqueda.toLowerCase()))
    const matchesTipo = filtroTipo === "Todos" || v.tipo === filtroTipo
    return matchesBusqueda && matchesTipo
  })

  // Ordenar según columna seleccionada
  if (ordenColumna) {
    vacacionesFiltradas = [...vacacionesFiltradas].sort((a, b) => {
      let valA = a[ordenColumna]
      let valB = b[ordenColumna]

      // Si es fecha, convertir a Date
      if (ordenColumna === "inicio" || ordenColumna === "fin") {
        valA = new Date(valA)
        valB = new Date(valB)
      }
      // Comparación
      if (valA < valB) return ordenDesc ? 1 : -1
      if (valA > valB) return ordenDesc ? -1 : 1
      return 0
    })
  }

  // Paginación
  const totalPaginas = Math.ceil(vacacionesFiltradas.length / filasPorPagina)
  const inicio = (pagina - 1) * filasPorPagina
  const fin = inicio + filasPorPagina
  const paginaActual = vacacionesFiltradas.slice(inicio, fin)

  // Para rellenar filas vacías si hay menos de 7
  const filasVacias = Math.max(0, filasPorPagina - paginaActual.length)

  const formatearFecha = (fecha) => {
    if (!fecha) return ""
    return new Date(fecha).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const tiposUnicos = Array.from(new Set(vacaciones.map((v) => v.tipo).filter(Boolean)))

  const handleEliminarVacacion = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar esta vacación?")) return;
    try {
      const token = localStorage.getItem("access_token");
      await api.delete(`vacaciones/${id}/eliminar/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVacaciones((prev) => prev.filter((v) => v.id !== id));
    } catch (err) {
      alert("Error al eliminar la vacación");
    }
  };

  const handleOrdenar = (col) => {
    if (ordenColumna === col) {
      setOrdenDesc((prev) => !prev); // Invierte el orden si ya está seleccionado
    } else {
      setOrdenColumna(col);
      setOrdenDesc(true); // Por defecto descendente al cambiar de columna
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6"> 
      <div className="max-w-7xl mx-auto space-y-2">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Vacaciones y Días Libres</h1>
            <p className="text-gray-600 mt-1">Gestiona y consulta los períodos de ausencia del personal</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>{vacacionesFiltradas.length} registros encontrados</span>
          </div>
        </div>

        {/* Filtros */}
        <Card>
          <CardContent className="p-2 p-2">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Buscador */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Buscar por nombre o DNI..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10"
                  autoComplete="off"
                  onFocus={() => setShowSuggestions(dniSuggestions.length > 0)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
                />
                {showSuggestions && (
                  <div className="absolute z-10 bg-white border rounded-md w-full mt-1 max-h-40 overflow-y-auto shadow-lg">
                    {dniSuggestions.map((dni, idx) => {
                      // Busca el primer empleado con ese DNI
                      const empleado = vacaciones.find((v) => v.dni === dni)
                      return (
                        <div
                          key={idx}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                          onMouseDown={() => handleSuggestionClick(dni)}
                        >
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="font-mono">{dni}</span>
                          {empleado && (
                            <span className="ml-2 text-gray-500 text-sm truncate max-w-[160px]">
                              {empleado.nombre}
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Filtro por tipo */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="min-w-[140px] bg-transparent">
                    <Filter className="w-4 h-4 mr-2" />
                    {filtroTipo}
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setFiltroTipo("Todos")}>Todos los tipos</DropdownMenuItem>
                  {tiposUnicos.map((tipo) => (
                    <DropdownMenuItem key={tipo} onClick={() => setFiltroTipo(tipo)}>
                      <span className="mr-2">{tipoConfig[tipo]?.icon}</span>
                      {tipo}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>

        {/* Tabla */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Registro de Ausencias
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Cargando datos...</span>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table className="min-w-[800px]">
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Empleado
                        </div>
                      </TableHead>
                      <TableHead
                        className="font-semibold cursor-pointer select-none"
                        onClick={() => handleOrdenar("dni")}
                      >
                        DNI {ordenColumna === "dni" && (ordenDesc ? "↓" : "↑")}
                      </TableHead>
                      <TableHead
                        className="font-semibold cursor-pointer select-none"
                        onClick={() => handleOrdenar("tipo")}
                      >
                        <div className="flex items-center gap-2">
                          <Filter className="w-4 h-4" />
                          Tipo {ordenColumna === "tipo" && (ordenDesc ? "↓" : "↑")}
                        </div>
                      </TableHead>
                      <TableHead
                        className="font-semibold cursor-pointer select-none"
                        onClick={() => handleOrdenar("inicio")}
                      >
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Fecha Inicio {ordenColumna === "inicio" && (ordenDesc ? "↓" : "↑")}
                        </div>
                      </TableHead>
                      <TableHead
                        className="font-semibold cursor-pointer select-none"
                        onClick={() => handleOrdenar("fin")}
                      >
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Fecha Fin {ordenColumna === "fin" && (ordenDesc ? "↓" : "↑")}
                        </div>
                      </TableHead>
                      <TableHead className="font-semibold text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Clock className="w-4 h-4" />
                          Días
                        </div>
                      </TableHead>
                      <TableHead className="font-semibold text-center">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginaActual.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12">
                          <div className="flex flex-col items-center gap-2 text-gray-500">
                            <Search className="w-8 h-8" />
                            <p className="text-lg font-medium">No se encontraron resultados</p>
                            <p className="text-sm">Intenta ajustar los filtros de búsqueda</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      <>
                        {paginaActual.map((v, idx) => (
                          <TableRow key={idx} className="hover:bg-gray-50 transition-colors">
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                  <User className="w-4 h-4 text-blue-600" />
                                </div>
                                <span>{v.nombre}</span>
                              </div>
                            </TableCell>
                            <TableCell className="font-mono text-sm text-gray-600">{v.dni}</TableCell>
                            <TableCell>
                              <Badge variant="secondary" className={tipoConfig[v.tipo]?.color}>
                                <span className="mr-1">{tipoConfig[v.tipo]?.icon}</span>
                                {v.tipo}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-gray-600">{formatearFecha(v.inicio)}</TableCell>
                            <TableCell className="text-gray-600">{formatearFecha(v.fin)}</TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline" className="font-semibold">
                                {v.dias} {v.dias === 1 ? "día" : "días"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEliminarVacacion(v.id)}
                                title="Eliminar"
                              >
                                <Trash2 className="w-5 h-5 text-red-500" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        {/* Rellenar filas vacías para mantener mínimo 7 */}
                        {Array.from({ length: filasVacias }).map((_, idx) => (
                          <TableRow key={`empty-${idx}`}>
                            <TableCell colSpan={6} className="py-6" />
                          </TableRow>
                        ))}
                      </>
                    )}
                  </TableBody>
                </Table>
                {/* Controles de paginación */}
                {totalPaginas > 1 && (
                  <div className="flex justify-end items-center gap-2 mt-4 pr-2 pb-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagina === 1}
                      onClick={() => setPagina((p) => Math.max(1, p - 1))}
                    >
                      Anterior
                    </Button>
                    <span className="text-sm text-gray-600">
                      Página {pagina} de {totalPaginas}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagina === totalPaginas}
                      onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                    >
                      Siguiente
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-1">
          {["Vacaciones", "Días Libres", "Permisos"].map((tipo) => {
            const config = tipoConfig[tipo];
            const count = vacaciones.filter((v) => v.tipo === tipo).length;
            const totalDias = vacaciones.filter((v) => v.tipo === tipo).reduce((sum, v) => sum + (v.dias || 0), 0);

            return (
              <Card key={tipo}>
                <CardContent className="p-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{tipo}</p>
                      <p className="text-2xl font-bold">{count}</p>
                      <p className="text-xs text-gray-500">{totalDias} días total</p>
                    </div>
                    <div className="text-2xl">{config.icon}</div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Tarjeta de Trabajadores librando */}
          <Card>
            <CardContent className="p-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Trabajadores librando</p>
                  <p className="text-2xl font-bold">
                    {
                      new Set(
                        vacaciones
                          .filter(
                            (v) =>
                              v.tipo === "Vacaciones" ||
                              v.tipo === "Días Libres" ||
                              v.tipo === "Permisos"
                          )
                          .map((v) => v.dni || v.nombre || v.user || v.email)
                      ).size
                    }
                  </p>
                  <p className="text-xs text-gray-500">usuarios únicos</p>
                </div>
                <div className="text-2xl">🧑‍💼</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}