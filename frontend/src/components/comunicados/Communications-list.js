import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FileText, Filter, Eye, Bell, Download, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import { useViews } from "@/contexts/ViewsContext";
import api from "@/api";

export default function CommunicationsList() {
  const { showViews } = useViews();
  const navigate = useNavigate();
  const { id } = useParams();

  const [filteredPosts, setFilteredPosts] = useState([]);
  const [selectedYear, setSelectedYear] = useState("2024");
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 7;
  const [hoveredPostId, setHoveredPostId] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await api.get("posts-with-views/");
        setFilteredPosts(res.data);
      } catch { setFilteredPosts([]); }
    };
    fetchPosts();
  }, []);

  useEffect(() => {
    if (!id) return;
    api.post(`/posts/${id}/view/`, {}).catch(() => {});
  }, [id]);

  const departmentStyles = {
    "Políticas": "bg-indigo-500/10 text-indigo-500",
    "Eventos": "bg-emerald-500/10 text-emerald-500",
    "Noticia": "bg-amber-500/10 text-amber-500",
    "Recursos Humanos": "bg-orange-500/10 text-orange-500",
    "Sistemas IT": "bg-violet-500/10 text-violet-500",
    "Marketing": "bg-pink-500/10 text-pink-500",
  };

  const handleNavigation = (id, downloadOnly) => { if (!downloadOnly) navigate(`/comunicados/${id}`); };

  const postsFilteredByTags = filter === "all" ? filteredPosts : filteredPosts.filter(p => p.department.toLowerCase() === filter.toLowerCase());
  const totalPages = Math.ceil(postsFilteredByTags.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const paginatedPosts = postsFilteredByTags.slice(startIndex, startIndex + postsPerPage);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-5 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <Bell className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <h1 className="text-lg font-heading font-semibold text-foreground">Comunicados</h1>
            <p className="text-sm text-muted-foreground">Documentos y avisos de la empresa</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground hover:bg-muted transition-colors">
                <Filter className="h-3.5 w-3.5" />{filter === "all" ? "Todos" : filter}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuRadioGroup value={filter} onValueChange={setFilter}>
                <DropdownMenuRadioItem value="all">Todos</DropdownMenuRadioItem>
                {["Políticas","Eventos","Noticia","Recursos Humanos","Sistemas IT","Marketing"].map(d => (
                  <DropdownMenuRadioItem key={d} value={d}>{d}</DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="relative">
            <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}
              className="appearance-none bg-card border border-border rounded-lg px-3 py-2 pr-8 text-sm font-medium text-foreground focus:outline-none cursor-pointer">
              <option value="2024">2024</option><option value="2023">2023</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border">
        <AnimatePresence>
          {paginatedPosts.map((post, idx) => (
            <motion.div key={post.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.15, delay: idx * 0.02 }}
              className="group cursor-pointer border-b border-border last:border-0"
              onClick={() => handleNavigation(post.id, post.download_only)}>
              <div className="flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-card-foreground group-hover:text-foreground truncate">{post.title}</h3>
                  {!post.download_only && post.summary && <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{post.summary}</p>}
                  <Badge className={`mt-1 text-[11px] font-medium border-0 ${departmentStyles[post.department] || "bg-muted text-muted-foreground"}`}>{post.department}</Badge>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {post.pdf && (
                    <button onClick={(e) => {
                      e.stopPropagation();
                      const link = document.createElement("a"); link.href = post.pdf; link.download = post.pdf.split("/").pop();
                      document.body.appendChild(link); link.click(); document.body.removeChild(link);
                    }} className="p-1.5 rounded-lg text-muted-foreground/40 hover:text-primary hover:bg-primary/10 transition-all">
                      <Download className="h-4 w-4" />
                    </button>
                  )}
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {post.created_at ? new Date(post.created_at).toLocaleDateString('es-ES') : "—"}
                  </span>
                  {showViews && (
                    <span className="flex items-center gap-1 text-muted-foreground relative text-xs"
                      onMouseEnter={() => setHoveredPostId(post.id)} onMouseLeave={() => setHoveredPostId(null)}>
                      <Eye className="h-3.5 w-3.5" />
                      <span>{Array.isArray(post.visualizaciones) ? post.visualizaciones.length : 0}</span>
                      {hoveredPostId === post.id && Array.isArray(post.visualizaciones) && post.visualizaciones.length > 0 && (
                        <div className="absolute left-1/2 -translate-x-1/2 top-6 z-20 bg-popover border border-border rounded-lg shadow-lg px-3 py-2 text-xs text-popover-foreground min-w-[130px] animate-fade-in">
                          <div className="font-semibold mb-1 text-muted-foreground">Visto por:</div>
                          <ul className="space-y-0.5">{post.visualizaciones.map((n, i) => <li key={i} className="truncate">{n}</li>)}</ul>
                        </div>
                      )}
                      {hoveredPostId === post.id && Array.isArray(post.visualizaciones) && post.visualizaciones.length === 0 && (
                        <div className="absolute left-1/2 -translate-x-1/2 top-6 z-20 bg-popover border border-border rounded-lg shadow-lg px-3 py-2 text-xs text-muted-foreground min-w-[130px] animate-fade-in">Nadie lo ha visto aún</div>
                      )}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {paginatedPosts.length === 0 && <div className="text-center text-sm text-muted-foreground py-12">No hay comunicados para mostrar</div>}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-4 gap-1.5">
          {Array.from({ length: totalPages }).map((_, idx) => (
            <button key={idx} onClick={() => setCurrentPage(idx + 1)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${
                currentPage === idx + 1 ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
              }`}>{idx + 1}</button>
          ))}
        </div>
      )}
    </div>
  );
}
