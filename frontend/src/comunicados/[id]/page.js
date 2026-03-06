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

    fetch(`${apiBase}/posts/${id}/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json();
      })
      .then(data => { setComunicado(data); setLoading(false); })
      .catch(() => { setError('No se pudo cargar el comunicado'); setLoading(false); });
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const apiBase = (process.env.REACT_APP_API_URL || 'http://localhost:8000/api/').replace(/\/+$/, '');
    const token = localStorage.getItem('access_token');
    fetch(`${apiBase}/posts/${id}/view/`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    }).catch(() => {});
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-100 rounded w-3/4" />
          <div className="h-4 bg-gray-50 rounded w-1/4" />
          <div className="h-64 bg-gray-50 rounded-xl mt-6" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 text-center">
        <p className="text-red-500 text-sm">{error}</p>
        <Link to="/comunicados" className="text-sm text-blue-500 hover:underline mt-2 inline-block">
          Volver a comunicados
        </Link>
      </div>
    );
  }

  const hasPdf = Boolean(comunicado.pdf);

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <Link to="/comunicados" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 mb-6 no-underline transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Volver
      </Link>

      <div className="bg-white rounded-xl border border-gray-100 p-6 sm:p-8">
        <div className="border-b border-gray-100 pb-5 mb-6">
          <h1 className="text-xl font-heading font-bold text-gray-900 mb-3">{comunicado.title}</h1>
          <div className="flex flex-wrap items-center gap-2">
            {comunicado.department && (
              <span className="text-[11px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                {comunicado.department}
              </span>
            )}
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(comunicado.created_at).toLocaleDateString('es-ES')}
            </div>
          </div>
        </div>

        <div
          className="prose prose-sm max-w-none text-gray-600"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(comunicado.content) }}
        />

        {hasPdf && (
          <div className="border-t border-gray-100 pt-5 mt-6 flex justify-end">
            <a
              href={comunicado.pdf}
              className="flex items-center gap-2 text-sm text-blue-500 hover:text-blue-600 font-medium no-underline transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Download className="h-4 w-4" /> Descargar documento
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
