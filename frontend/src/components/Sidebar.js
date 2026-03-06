import React, { useState, useEffect } from 'react'
import { Home, FileText, Calendar, Newspaper, Menu, ChevronLeft, Wrench, Settings, Upload, Eye, TableProperties, X, Shield } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { useViews } from "@/contexts/ViewsContext"

const menuItems = [
  { href: '/dashboard', icon: Home, label: 'Inicio' },
  { href: '/nominas', icon: FileText, label: 'Mis Nóminas' },
  { href: '/vacaciones', icon: Calendar, label: 'Vacaciones' },
  { href: '/comunicados', icon: Newspaper, label: 'Comunicados' },
]

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showAdminMenu, setShowAdminMenu] = useState(false)
  const [showNominasModal, setShowNominasModal] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')

  const { showViews, setShowViews } = useViews()
  const location = useLocation()
  const currentPath = location.pathname
  const navigate = useNavigate()

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile) setIsCollapsed(true)
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => { setShowAdminMenu(false) }, [currentPath])

  const NominasModal = () => (
    showNominasModal && (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md relative animate-fade-in">
          <button
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
            onClick={() => { setShowNominasModal(false); setSelectedFile(null); setMessage('') }}
          >
            <X className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-heading font-semibold mb-4">Subir nóminas</h2>
          <div
            className="border-2 border-dashed border-gray-200 hover:border-blue-300 rounded-xl p-8 text-center mb-4 cursor-pointer transition-colors bg-gray-50/50"
            onDrop={e => { e.preventDefault(); if (e.dataTransfer.files?.[0]) setSelectedFile(e.dataTransfer.files[0]) }}
            onDragOver={e => e.preventDefault()}
            onClick={() => document.getElementById('fileInput').click()}
          >
            {selectedFile
              ? <span className="text-emerald-600 font-medium">{selectedFile.name}</span>
              : <span className="text-gray-400">Arrastra el PDF aquí o haz clic para seleccionar</span>
            }
            <input id="fileInput" type="file" accept="application/pdf" className="hidden"
              onChange={e => { if (e.target.files?.[0]) setSelectedFile(e.target.files[0]) }}
            />
          </div>
          <div className="flex gap-2 mb-4">
            <input type="number" min="2000" max="2100" placeholder="Año" id="yearInput"
              className="border border-gray-200 rounded-lg px-3 py-2 w-1/2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500" />
            <input type="text" maxLength={2} placeholder="Mes (01-12)" id="monthInput"
              className="border border-gray-200 rounded-lg px-3 py-2 w-1/2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500" />
          </div>
          <button
            className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-medium rounded-lg transition-all"
            onClick={async () => {
              if (!selectedFile) return
              setUploading(true); setMessage('')
              const formData = new FormData()
              formData.append('file', selectedFile)
              const year = document.getElementById('yearInput').value
              const month = document.getElementById('monthInput').value
              if (!year || !month) { setMessage('Debes indicar año y mes.'); setUploading(false); return }
              formData.append('year', year); formData.append('month', month)
              try {
                const token = localStorage.getItem('access_token')
                const res = await fetch('/api/upload-nomina/', { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: formData })
                if (res.ok) { setMessage('Archivo subido correctamente.'); setSelectedFile(null) }
                else setMessage('Error al subir el archivo.')
              } catch { setMessage('Error al conectar con el servidor.') }
              setUploading(false)
            }}
            disabled={!selectedFile || uploading}
          >
            {uploading ? 'Subiendo...' : 'Subir'}
          </button>
          {message && <div className="mt-3 text-center text-sm text-gray-600">{message}</div>}
        </div>
      </div>
    )
  )

  const devMenuItems = [
    { label: "Subir nóminas", icon: Upload, onClick: () => setShowNominasModal(true) },
    { label: "Ver visualizaciones", icon: Eye, onClick: () => { navigate('/comunicados'); setShowViews(true); setShowAdminMenu(false) } },
    { label: "Tabla vacaciones", icon: TableProperties, onClick: () => navigate('/admin/tablavacaciones') },
  ]

  const NavContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className={`flex items-center ${isCollapsed && !isMobile ? 'justify-center py-5' : 'justify-between px-4 py-5'}`}>
        {(!isCollapsed || isMobile) && (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Shield className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-base font-heading font-semibold text-white">Portal</span>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5 ${isMobile ? 'hidden' : ''}`}
        >
          {isCollapsed ? <Menu className="h-4.5 w-4.5" /> : <ChevronLeft className="h-4.5 w-4.5" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 mt-2">
        <div className="space-y-0.5">
          {(showAdminMenu ? devMenuItems : menuItems).map((item, idx) => {
            const isActive = !showAdminMenu && currentPath === item.href
            const Icon = item.icon
            const Component = showAdminMenu ? 'button' : Link
            const props = showAdminMenu
              ? { onClick: item.onClick }
              : { to: item.href }

            return (
              <Component
                key={showAdminMenu ? idx : item.href}
                {...props}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 no-underline w-full text-left
                  ${isCollapsed && !isMobile ? 'justify-center px-0' : ''}
                  ${isActive
                    ? 'bg-blue-500/15 text-blue-400'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }
                `}
              >
                <Icon className={`h-[18px] w-[18px] flex-shrink-0 ${isActive ? 'text-blue-400' : ''}`} />
                {(!isCollapsed || isMobile) && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </Component>
            )
          })}
        </div>
      </nav>

      {/* Admin toggle - footer */}
      <div className="px-3 pb-4 mt-auto">
        <div className="border-t border-white/10 pt-3">
          <button
            onClick={() => setShowAdminMenu(v => !v)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 w-full
              ${isCollapsed && !isMobile ? 'justify-center px-0' : ''}
              ${showAdminMenu ? 'text-amber-400 bg-amber-400/10' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}
            `}
          >
            <Wrench className="h-[18px] w-[18px] flex-shrink-0" />
            {(!isCollapsed || isMobile) && (
              <span className="text-sm font-medium">Admin</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <>
        <NominasModal />
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="fixed left-4 top-4 z-50 md:hidden bg-white shadow-md hover:bg-gray-50 rounded-lg">
              <Menu className="h-5 w-5 text-gray-700" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 bg-[hsl(220,25%,14%)] border-none">
            <NavContent />
          </SheetContent>
        </Sheet>
      </>
    )
  }

  return (
    <div className={`hidden md:flex flex-col h-screen bg-[hsl(220,25%,14%)] transition-all duration-300 ease-in-out overflow-hidden
      ${isCollapsed ? 'w-[60px]' : 'w-60'}
    `}>
      <NominasModal />
      <NavContent />
    </div>
  )
}
