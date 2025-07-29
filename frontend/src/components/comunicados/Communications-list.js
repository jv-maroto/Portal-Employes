// src/components/comunicados/CommunicationsList.jsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FileText,
  Filter,
  Eye,
  Bell,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/comunicados/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/comunicados/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/comunicados/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import { useViews } from "@/contexts/ViewsContext";
import api from "@/api";

export default function CommunicationsList() {
  const { showViews } = useViews();
  const navigate = useNavigate();
  const { id } = useParams();

  // Cambia esto: filteredPosts viene del contexto, pero aquí lo cargamos del backend
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [selectedYear, setSelectedYear] = useState("2024");
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 7;
  const [hoveredPostId, setHoveredPostId] = useState(null);

  // Carga los posts con visualizaciones al montar el componente
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const res = await api.get("posts-with-views/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFilteredPosts(res.data);
      } catch (err) {
        setFilteredPosts([]);
      }
    };
    fetchPosts();
  }, []);

  useEffect(() => {
    const markAsViewed = async () => {
      const token = localStorage.getItem("access_token");
      try {
        await api.post(
          `/posts/${id}/view/`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } catch (err) {
        // Puedes mostrar un error o ignorar
      }
    };
    markAsViewed();
  }, [id]);

  const getDepartmentBadgeStyle = (department) => {
    const styles = {
      Políticas: "bg-blue-100 text-blue-800 hover:bg-blue-100",
      Eventos: "bg-green-100 text-green-800 hover:bg-green-100",
      Noticia: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
      "Recursos Humanos": "bg-orange-100 text-orange-800 hover:bg-orange-100",
      "Sistemas IT": "bg-purple-100 text-purple-800 hover:bg-purple-100",
      Marketing: "bg-pink-100 text-pink-800 hover:bg-pink-100",
    };
    return styles[department] || "bg-gray-100 text-gray-800 hover:bg-gray-100";
  };

  const handleNavigation = (id, downloadOnly) => {
    if (!downloadOnly) navigate(`/comunicados/${id}`);
  };

  const postsFilteredByTags =
    filter === "all"
      ? filteredPosts
      : filteredPosts.filter(
          (post) => post.department.toLowerCase() === filter.toLowerCase()
        );

  const totalPages = Math.ceil(postsFilteredByTags.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const paginatedPosts = postsFilteredByTags.slice(
    startIndex,
    startIndex + postsPerPage
  );

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Bell className="h-5 w-5 text-blue-500" />
          Comunicados y Documentos
        </CardTitle>
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                {filter === "all" ? "Todos los departamentos" : filter}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuRadioGroup value={filter} onValueChange={setFilter}>
                <DropdownMenuRadioItem value="all">
                  Todos los departamentos
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="Políticas">
                  Políticas
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="Eventos">
                  Eventos
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="Noticia">
                  Noticia
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="Recursos Humanos">
                  Recursos Humanos
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="Sistemas IT">
                  Sistemas IT
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="Marketing">
                  Marketing
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Año" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <AnimatePresence>
            {paginatedPosts.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="group cursor-pointer"
                onClick={() => handleNavigation(post.id, post.download_only)}
              >
                <div className="flex items-center p-3 border rounded-lg hover:shadow-md bg-white">
                  {/* Icono y título */}
                  <FileText className="h-6 w-6 text-blue-500 mr-3" />
                  <div className="flex-1">
                    <h3 className="font-medium">{post.title}</h3>
                    {!post.download_only && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {post.summary}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <Badge className={getDepartmentBadgeStyle(post.department)}>
                        {post.department}
                      </Badge>
                    </div>
                  </div>

                  {/* Fecha and botón descarga */}
                  <div className="ml-auto flex items-center gap-4">
                    {post.pdf && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const link = document.createElement("a");
                          link.href = post.pdf;
                          link.download = post.pdf.split("/").pop();
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                        className="p-2 text-blue-500 hover:text-blue-700 transition-colors"
                        aria-label="Descargar PDF"
                      >
                        <Download className="h-5 w-5" />
                      </button>
                    )}

                    <span className="text-xs text-muted-foreground">
                      {post.created_at
                        ? new Date(post.created_at).toLocaleDateString()
                        : "Fecha no disponible"}
                    </span>

                    {showViews && (
                      <span
                        className="flex items-center gap-1 text-gray-600 relative"
                        onMouseEnter={() => setHoveredPostId(post.id)}
                        onMouseLeave={() => setHoveredPostId(null)}
                      >
                        <Eye className="h-4 w-4" />
                        <span>
                          {Array.isArray(post.visualizaciones)
                            ? post.visualizaciones.length
                            : 0}
                        </span>
                        {/* Tooltip */}
                        {hoveredPostId === post.id &&
                          Array.isArray(post.visualizaciones) &&
                          post.visualizaciones.length > 0 && (
                            <div className="absolute left-1/2 -translate-x-1/2 top-7 z-20 bg-white border rounded shadow-lg px-3 py-2 text-xs text-gray-800 min-w-[120px]">
                              <div className="font-semibold mb-1">Visto por:</div>
                              <ul>
                                {post.visualizaciones.map((nombre, idx) => (
                                  <li key={idx} className="truncate">
                                    {nombre}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        {hoveredPostId === post.id &&
                          Array.isArray(post.visualizaciones) &&
                          post.visualizaciones.length === 0 && (
                            <div className="absolute left-1/2 -translate-x-1/2 top-7 z-20 bg-white border rounded shadow-lg px-3 py-2 text-xs text-gray-800 min-w-[120px]">
                              Nadie lo ha visto aún
                            </div>
                          )}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {paginatedPosts.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-6">
              No hay comunicados para mostrar
            </div>
          )}
        </div>

        {/* Paginación */}
        <div className="flex justify-center mt-6">
          {Array.from({ length: totalPages }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentPage(idx + 1)}
              className={`px-3 py-1 mx-1 rounded ${
                currentPage === idx + 1
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
