import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Newspaper, ChevronRight } from 'lucide-react';
import api from "../api";

export function RecentAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await api.get("posts/?ordering=-created_at&limit=5");
        setAnnouncements(res.data.slice(0, 5));
      } catch (err) {
        setError("No se pudieron cargar los comunicados.");
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse">
        <div className="h-5 bg-gray-100 rounded w-2/5 mb-4" />
        <div className="space-y-3">
          <div className="h-16 bg-gray-50 rounded-lg" />
          <div className="h-16 bg-gray-50 rounded-lg" />
          <div className="h-16 bg-gray-50 rounded-lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <p className="text-center text-red-500 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-heading font-semibold text-gray-900">Últimos Comunicados</h3>
        <Link to="/comunicados" className="text-xs text-blue-500 hover:text-blue-600 font-medium no-underline">
          Ver todos
        </Link>
      </div>
      {announcements.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-4">No hay comunicados recientes.</p>
      ) : (
        <div className="space-y-2">
          {announcements.map((a, index) => (
            <Link
              key={index}
              to={`/comunicados/${a.id}`}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors no-underline group/item"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Newspaper className="h-4 w-4 text-amber-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate group-hover/item:text-gray-900">
                  {a.title}
                </p>
                {a.department && (
                  <span className="inline-block text-[11px] font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded mt-1">
                    {a.department}
                  </span>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  {a.created_at ? new Date(a.created_at).toLocaleDateString('es-ES') : a.date}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-300 flex-shrink-0 mt-1" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
