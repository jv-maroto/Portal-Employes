// src/components/ComunicadoPage.jsx
'use client';

import { useState, useEffect } from 'react';
import { useParams }          from 'react-router-dom';
import { FileText, Download, Eye, Calendar } from 'lucide-react';
import { Badge }              from '@/components/ui/badge';
import { Card }               from '@/components/ui/card';

export default function ComunicadoPage() {
  const { id } = useParams();
  const [comunicado, setComunicado] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  useEffect(() => {
    if (!id) return;

   const apiBase = process.env.REACT_APP_API_URL || '';
   const token   = localStorage.getItem('access_token');

   console.log('🔑 Token en localStorage:', token);
   console.log('📡 Fetching:', `${apiBase}/api/posts/${id}/`);

    fetch(`${apiBase}/api/posts/${id}/`, {
      headers: {
       Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
       Authorization: `Bearer ${token}`,
      },
    })
      .then(res => {
       console.log('⬅️ Response status:', res.status, res);
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json();
      })
      .then(data => {
        setComunicado(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error cargando comunicado:', err);
        setError('No se pudo cargar el comunicado');
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const apiBase = process.env.REACT_APP_API_URL || '';
    const token = localStorage.getItem('access_token');
    fetch(`${apiBase}/api/posts/${id}/view/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }).catch(() => {});
  }, [id]);

  if (loading) return <p>Cargando comunicado…</p>;
  if (error)   return <p className="text-red-600">{error}</p>;

  const hasPdf = Boolean(comunicado.pdf);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <Card className="p-6">
        {/* === Header === */}
        <div className="border-b pb-6 space-y-4">
          <h1 className="text-2xl font-bold">{comunicado.title}</h1>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {comunicado.department}
            </Badge>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {new Date(comunicado.created_at).toLocaleDateString()}
            </div>
            
          </div>
        </div>

        {/* === Content === */}
        <div 
          className="prose max-w-none py-4"
          dangerouslySetInnerHTML={{ __html: comunicado.content }}
        />

        {/* === Footer (PDF) === */}
        {hasPdf && (
          <div className="border-t pt-6 flex justify-end">
            <a
              href={comunicado.pdf}
              className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Download className="h-4 w-4" /> Descargar documento
            </a>
          </div>
        )}
      </Card>
    </div>
  );
}
