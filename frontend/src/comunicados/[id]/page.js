// src/components/ComunicadoPage.jsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Download, Calendar, ArrowLeft } from 'lucide-react';
import DOMPurify from 'dompurify';

export default function ComunicadoPage() {
  const { id } = useParams();
  const [comunicado, setComunicado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    const apiBase = (process.env.REACT_APP_API_URL || 'http://localhost:8000/api/').replace(/\/+$/, '');
    const token = localStorage.getItem('access_token');
    fetch(`${apiBase}/posts/${id}/`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => { if (!res.ok) throw new Error(`Status ${res.status}`); return res.json(); })
      .then(data => { setComunicado(data); setLoading(false); })
      .catch(() => { setError('No se pudo cargar el comunicado'); setLoading(false); });
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const apiBase = (process.env.REACT_APP_API_URL || 'http://localhost:8000/api/').replace(/\/+$/, '');
    const token = localStorage.getItem('access_token');
    fetch(`${apiBase}/posts/${id}/view/`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }).catch(() => {});
  }, [id]);

  if (loading) return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-muted rounded w-3/4" />
        <div className="h-4 bg-muted rounded w-1/4" />
        <div className="h-64 bg-muted rounded-xl mt-6" />
      </div>
    </div>
  );

  if (error) return (
    <div className="max-w-3xl mx-auto py-12 px-4 text-center">
      <p className="text-destructive text-sm">{error}</p>
      <Link to="/comunicados" className="text-sm text-primary hover:underline mt-2 inline-block">Volver</Link>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <Link to="/comunicados" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 no-underline transition-colors">
        <ArrowLeft className="h-4 w-4" />Volver
      </Link>
      <div className="bg-card rounded-xl border border-border p-6 sm:p-8">
        <div className="border-b border-border pb-5 mb-6">
          <h1 className="text-xl font-heading font-bold text-card-foreground mb-3">{comunicado.title}</h1>
          <div className="flex flex-wrap items-center gap-2">
            {comunicado.department && <span className="text-[11px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">{comunicado.department}</span>}
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />{new Date(comunicado.created_at).toLocaleDateString('es-ES')}
            </div>
          </div>
        </div>
        <div className="prose prose-sm max-w-none text-card-foreground dark:prose-invert" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(comunicado.content) }} />
        {comunicado.pdf && (
          <div className="border-t border-border pt-5 mt-6 flex justify-end">
            <a href={comunicado.pdf} className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-medium no-underline transition-colors" target="_blank" rel="noopener noreferrer">
              <Download className="h-4 w-4" /> Descargar documento
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
