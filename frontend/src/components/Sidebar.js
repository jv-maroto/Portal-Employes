import React, { useState, useEffect } from 'react'
import { Home, FileText, Calendar, Newspaper, Menu, ChevronLeft, Wrench, Upload, Eye, TableProperties, X, Building2, Moon, Sun } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { useViews } from "@/contexts/ViewsContext"
import { useDarkMode } from '@/hooks/useDarkMode'

const menuItems = [
  { href: '/dashboard', icon: Home, label: 'Inicio' },
  { href: '/nominas', icon: FileText, label: 'Nóminas' },
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
  const { isDark, toggle: toggleDark } = useDarkMode()
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
        <div className="bg-card text-card-foreground rounded-xl shadow-2xl p-6 w-full max-w-md relative animate-fade-in border border-border">
          <button
            className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => { setShowNominasModal(false); setSelectedFile(null); setMessage('') }}
          >
            <X className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-heading font-semibold mb-4">Subir nóminas</h2>
          <div
            className="border-2 border-dashed border-border hover:border-primary/40 rounded-xl p-8 text-center mb-4 cursor-pointer transition-colors bg-muted/30"
            onDrop={e => { e.preventDefault(); if (e.dataTransfer.files?.[0]) setSelectedFile(e.dataTransfer.files[0]) }}
            onDragOver={e => e.preventDefault()}
            onClick={() => document.getElementById('fileInput').click()}
          >
            {selectedFile
              ? <span className="text-emerald-500 font-medium">{selectedFile.name}</span>
              : <span className="text-muted-foreground">Arrastra el PDF aquí o haz clic para seleccionar</span>
            }
            <input id="fileInput" type="file" accept="application/pdf" className="hidden"
              onChange={e => { if (e.target.files?.[0]) setSelectedFile(e.target.files[0]) }}
            />
          </div>
          <div className="flex gap-2 mb-4">
            <input type="number" min="2000" max="2100" placeholder="Año" id="yearInput"
              className="border border-input rounded-lg px-3 py-2 w-1/2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary" />
            <input type="text" maxLength={2} placeholder="Mes (01-12)" id="monthInput"
              className="border border-input rounded-lg px-3 py-2 w-1/2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary" />
          </div>
          <button
            className="w-full py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-40 text-primary-foreground font-medium rounded-lg transition-all"
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
          {message && <div className="mt-3 text-center text-sm text-muted-foreground">{message}</div>}
        </div>
      </div>
    )
  )

  const devMenuItems = [
    { label: "Subir nóminas", icon: Upload, onClick: () => setShowNominasModal(true) },
    { label: "Visualizaciones", icon: Eye, onClick: () => { navigate('/comunicados'); setShowViews(true); setShowAdminMenu(false) } },
    { label: "Tabla vacaciones", icon: TableProperties, onClick: () => navigate('/admin/tablavacaciones') },
  ]

  const NavContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className={`flex items-center ${isCollapsed && !isMobile ? 'justify-center py-5' : 'justify-between px-4 py-5'}`}>
        {(!isCollapsed || isMobile) && (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Building2 className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-heading font-semibold text-[hsl(var(--sidebar-foreground))]">Portal Corp</span>
          </div>
        )}
        {isCollapsed && !isMobile && (
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Building2 className="w-4 h-4 text-primary-foreground" />
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`text-[hsl(var(--sidebar-foreground))]/50 hover:text-[hsl(var(--sidebar-foreground))] transition-colors p-1.5 rounded-lg hover:bg-[hsl(var(--sidebar-accent))] ${isMobile || (isCollapsed && !isMobile) ? 'hidden' : ''}`}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      {/* Section label */}
      {(!isCollapsed || isMobile) && (
        <div className="px-5 mb-2">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-[hsl(var(--sidebar-foreground))]/30">
            {showAdminMenu ? 'Administración' : 'Navegación'}
          </span>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3">
        <div className="space-y-0.5">
          {(showAdminMenu ? devMenuItems : menuItems).map((item, idx) => {
            const isActive = !showAdminMenu && currentPath === item.href
            const Icon = item.icon
            const Component = showAdminMenu ? 'button' : Link
            const props = showAdminMenu ? { onClick: item.onClick } : { to: item.href }

            return (
              <Component
                key={showAdminMenu ? idx : item.href}
                {...props}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 no-underline w-full text-left
                  ${isCollapsed && !isMobile ? 'justify-center px-0' : ''}
                  ${isActive
                    ? 'bg-[hsl(var(--sidebar-active))]/15'
                    : 'hover:bg-[hsl(var(--sidebar-accent))]'
                  }
                `}
                style={{
                  color: isActive
                    ? 'hsl(var(--sidebar-active))'
                    : 'hsl(var(--sidebar-foreground) / 0.6)',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = 'hsl(var(--sidebar-foreground))' }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = 'hsl(var(--sidebar-foreground) / 0.6)' }}
              >
                <Icon className="h-[17px] w-[17px] flex-shrink-0" />
                {(!isCollapsed || isMobile) && (
                  <span className="text-[13px] font-medium">{item.label}</span>
                )}
              </Component>
            )
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="px-3 pb-3 mt-auto space-y-0.5">
        <div className="border-t border-[hsl(var(--sidebar-accent))] pt-2 space-y-0.5">
          {/* Dark mode toggle */}
          <button
            onClick={toggleDark}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 w-full
              ${isCollapsed && !isMobile ? 'justify-center px-0' : ''}
            `}
            style={{ color: 'hsl(var(--sidebar-foreground) / 0.5)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'hsl(var(--sidebar-foreground))'}
            onMouseLeave={e => e.currentTarget.style.color = 'hsl(var(--sidebar-foreground) / 0.5)'}
          >
            {isDark ? <Sun className="h-[17px] w-[17px] flex-shrink-0" /> : <Moon className="h-[17px] w-[17px] flex-shrink-0" />}
            {(!isCollapsed || isMobile) && (
              <span className="text-[13px] font-medium">{isDark ? 'Modo claro' : 'Modo oscuro'}</span>
            )}
          </button>

          {/* Admin toggle */}
          <button
            onClick={() => setShowAdminMenu(v => !v)}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 w-full
              ${isCollapsed && !isMobile ? 'justify-center px-0' : ''}
              ${showAdminMenu ? 'bg-amber-500/10' : ''}
            `}
            style={{ color: showAdminMenu ? '#f59e0b' : 'hsl(var(--sidebar-foreground) / 0.5)' }}
            onMouseEnter={e => { if (!showAdminMenu) e.currentTarget.style.color = 'hsl(var(--sidebar-foreground))' }}
            onMouseLeave={e => { if (!showAdminMenu) e.currentTarget.style.color = 'hsl(var(--sidebar-foreground) / 0.5)' }}
          >
            <Wrench className="h-[17px] w-[17px] flex-shrink-0" />
            {(!isCollapsed || isMobile) && (
              <span className="text-[13px] font-medium">Admin</span>
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
            <Button variant="ghost" size="icon" className="fixed left-4 top-4 z-50 md:hidden bg-card shadow-md hover:bg-accent rounded-lg border border-border">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-60 p-0 border-none" style={{ backgroundColor: 'hsl(var(--sidebar))' }}>
            <NavContent />
          </SheetContent>
        </Sheet>
      </>
    )
  }

  return (
    <div
      className={`hidden md:flex flex-col h-screen transition-all duration-300 ease-in-out overflow-hidden
        ${isCollapsed ? 'w-[60px]' : 'w-56'}
      `}
      style={{ backgroundColor: 'hsl(var(--sidebar))', borderRight: '1px solid hsl(var(--sidebar-accent))' }}
    >
      <NominasModal />
      <NavContent />
    </div>
  )
}
