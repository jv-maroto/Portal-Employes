import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import api from "../api";

export function RecentAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await api.get("posts/?ordering=-created_at&limit=5");
        // El backend devuelve los posts ordenados por fecha descendente
        setAnnouncements(res.data.slice(0, 5));
      } catch (err) {
        setError("No se pudieron cargar los comunicados recientes.");
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Últimos Comunicados</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center text-gray-400 text-sm">Cargando...</div>
        ) : error ? (
          <div className="text-center text-red-500 text-sm">{error}</div>
        ) : (
          <div className="space-y-4">
            {announcements.map((announcement, index) => (
              <div key={index} className="border-b last:border-0 pb-4 last:pb-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{announcement.title}</h3>
                  <Badge>{announcement.department || announcement.category}</Badge>
                </div>
                <p className="text-sm text-gray-500 mb-1">{announcement.summary || announcement.description}</p>
                <p className="text-xs text-gray-400">
                  {announcement.created_at ? new Date(announcement.created_at).toLocaleDateString() : announcement.date}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

