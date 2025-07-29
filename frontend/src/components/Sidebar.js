import React, { useState, useEffect } from 'react'
import { Home, FileText, Calendar, Newspaper, Menu, Wrench, Settings } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { useViews } from "@/contexts/ViewsContext"; // SOLO el hook

const menuItems = [
  { href: '/dashboard', icon: Home, label: 'Inicio' },
  { href: '/nominas', icon: FileText, label: 'Mis Nóminas' },
  { href: '/vacaciones', icon: Calendar, label: 'Vacaciones' },
  { href: '/comunicados', icon: Newspaper, label: 'Noticias y Comunicados' },
]

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showAdminMenu, setShowAdminMenu] = useState(false)
  const [showNominasModal, setShowNominasModal] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')

  const { showViews, setShowViews } = useViews(); // <-- usa el contexto global

  const location = useLocation()
  const currentPath = location.pathname
  const navigate = useNavigate()

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
    if (window.innerWidth < 768) {
      setIsCollapsed(true)
    }
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setIsCollapsed(true)
      }
    }
    window.addEventListener('resize', checkIfMobile)
    return () => window.removeEventListener('resize', checkIfMobile)
  }, [])

  // Contrae el menú admin al cambiar de sección
  useEffect(() => {
    setShowAdminMenu(false)
  }, [currentPath])

  // Modal de subida de nóminas
  const NominasModal = () => (
    showNominasModal && (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
          <button
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            onClick={() => {
              setShowNominasModal(false)
              setSelectedFile(null)
              setMessage('')
            }}
          >
            ✕
          </button>
          <h2 className="text-lg font-semibold mb-4">Arrastra el PDF aquí</h2>
          <div
            className="border-2 border-dashed border-gray-400 rounded-lg p-8 text-center mb-4 cursor-pointer"
            onDrop={e => {
              e.preventDefault()
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                setSelectedFile(e.dataTransfer.files[0])
              }
            }}
            onDragOver={e => e.preventDefault()}
            onClick={() => document.getElementById('fileInput').click()}
          >
            {selectedFile
              ? <span className="text-green-700">{selectedFile.name}</span>
              : <span>Arrastra el archivo PDF aquí o haz clic para seleccionar</span>
            }
            <input
              id="fileInput"
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={e => {
                if (e.target.files && e.target.files[0]) {
                  setSelectedFile(e.target.files[0])
                }
              }}
            />
          </div>
          {/* Selección de año y mes */}
          <div className="flex gap-2 mb-4">
            <input
              type="number"
              min="2000"
              max="2100"
              placeholder="Año"
              className="border rounded px-2 py-1 w-1/2"
              id="yearInput"
            />
            <input
              type="text"
              maxLength={2}
              placeholder="Mes (01-12)"
              className="border rounded px-2 py-1 w-1/2"
              id="monthInput"
            />
          </div>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
            onClick={async () => {
              if (!selectedFile) return;
              setUploading(true);
              setMessage('');
              const formData = new FormData();
              formData.append('file', selectedFile);
              // Obtén año y mes de los inputs
              const year = document.getElementById('yearInput').value;
              const month = document.getElementById('monthInput').value;
              if (!year || !month) {
                setMessage('Debes indicar año y mes.');
                setUploading(false);
                return;
              }
              formData.append('year', year);
              formData.append('month', month);

              try {
                const token = localStorage.getItem('access_token');
                const res = await fetch('/api/upload-nomina/', {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                  },
                  body: formData,
                });
                if (res.ok) {
                  setMessage('Archivo subido correctamente.');
                  setSelectedFile(null);
                } else {
                  setMessage('Error al subir el archivo.');
                }
              } catch {
                setMessage('Error al conectar con el servidor.');
              }
              setUploading(false);
            }}
            disabled={!selectedFile || uploading}
          >
            {uploading ? 'Subiendo...' : 'Subir'}
          </button>
          {message && (
            <div className="mt-4 text-center text-sm text-gray-700">{message}</div>
          )}
        </div>
      </div>
    )
  )

  const devMenuItems = [
    {
      label: "Subir nóminas",
      icon: Settings,
      onClick: () => setShowNominasModal(true),
      show: true,
    },
     {
    label: "Ver visualizaciones",
    icon: Settings,
    onClick: () => {
      navigate('/comunicados');
      setShowViews(true); // <-- Fuerza a true SIEMPRE
      setShowAdminMenu(false);
    },
    show: true,
  },
    {
      label: "Ver vacaciones",
      icon: Settings,
      onClick: () => navigate('/admin/tablavacaciones'),
      show: true,
    },
  ];

  // Opciones admin contextual
  const adminOptions = () => {
    if (currentPath === '/nominas') {
      return (
        <div
          onClick={() => setShowNominasModal(true)}
          className={`flex items-center px-4 py-2 transition-all duration-300 hover:bg-gray-700 rounded text-white cursor-pointer
            ${isCollapsed && !isMobile ? 'justify-center' : ''}
          `}
        >
          <span className="flex w-6 justify-center">
            <Settings className="h-5 w-5" />
          </span>
          {(!isCollapsed || isMobile) && (
            <span className="ml-2">Subir nóminas</span>
          )}
        </div>
      );
    }
    if (currentPath === '/comunicados') {
      return (
        <div
          onClick={() => setShowViews(v => !v)}
          className={`flex items-center px-4 py-2 transition-all duration-300 hover:bg-gray-700 rounded text-white cursor-pointer
            ${isCollapsed && !isMobile ? 'justify-center' : ''}
          `}
        >
          <span className="flex w-6 justify-center">
            <Settings className="h-5 w-5" />
          </span>
          {(!isCollapsed || isMobile) && (
            <span className="ml-2">Ver visualizaciones</span>
          )}
        </div>
      );
    }
    if (currentPath === '/vacaciones') {
      return (
        <div
          onClick={() => navigate('/admin/tablavacaciones')}
          className={`flex items-center px-4 py-2 transition-all duration-300 hover:bg-gray-700 rounded text-white cursor-pointer
            ${isCollapsed && !isMobile ? 'justify-center' : ''}
          `}
        >
          <span className="flex w-6 justify-center">
            <Settings className="h-5 w-5" />
          </span>
          {(!isCollapsed || isMobile) && (
            <span className="ml-2">Ver vacaciones</span>
          )}
        </div>
      );
    }
    return null;
  }
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  }
  const NavContent = () => (
    <>
      {/* Header */}
      {isMobile ? (
        // Siempre muestra "Portal" en móvil
        <div className="flex flex-col items-center gap-2 py-4">
          <span className="text-lg font-semibold text-white mb-2">Portal</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(false)}
            className="text-white hover:bg-gray-700"
            title="Expandir menú"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowAdminMenu((v) => !v)}
            className="text-white hover:bg-gray-700"
            title="Admin"
          >
            <Wrench className="h-5 w-5" />
          </Button>
        </div>
      ) : isCollapsed ? (
        // PC colapsado: solo iconos, sin texto Portal
        <div className="flex flex-col items-center gap-2 py-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(false)}
            className="text-white hover:bg-gray-700"
            title="Expandir menú"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowAdminMenu((v) => !v)}
            className="text-white hover:bg-gray-700"
            title="Admin"
          >
            <Wrench className="h-5 w-5" />
          </Button>
        </div>
      ) : (
        // PC expandido: Portal + iconos en fila
        <div className="flex items-center justify-between p-4">
          <span className="text-lg font-semibold text-white transition-all duration-500">
            Portal
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowAdminMenu((v) => !v)}
              className="text-white hover:bg-gray-700"
              title="Admin"
            >
              <Wrench className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(true)}
              className="text-white hover:bg-gray-700"
              title="Colapsar menú"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}
      {/* Menú contextual como menú completo de desarrollador */}
      <nav className="mt-4 flex flex-col gap-y-1">
        {showAdminMenu
          ? (
              devMenuItems.filter(opt => opt.show).map((opt, idx) => (
                <div
                  key={idx}
                  onClick={opt.onClick}
                  className={`flex items-center px-4 py-2 transition-all duration-300 hover:bg-gray-700 rounded text-white cursor-pointer
                    ${isCollapsed && !isMobile ? 'justify-center' : ''}
                  `}
                >
                  <span className="flex w-6 justify-center">
                    <opt.icon className="h-5 w-5" />
                  </span>
                  {(!isCollapsed || isMobile) && (
                    <span className="ml-2">{opt.label}</span>
                  )}
                </div>
              ))
            )
          : (
              menuItems.map((item) => {
                const isActive = currentPath === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`flex items-center px-4 py-2 transition-all duration-300 hover:bg-gray-700 rounded text-white no-underline
                      ${isCollapsed && !isMobile ? 'justify-center' : ''}
                      ${isActive ? 'bg-gray-700' : ''}
                    `}
                  >
                    <span className="flex w-6 justify-center">
                      <Icon className="h-5 w-5" />
                    </span>
                    {(!isCollapsed || isMobile) && (
                      <span className="ml-2">{item.label}</span>
                    )}
                  </Link>
                );
              })
            )
        }
      </nav>
    </>
  )
  // Versión móvil con Sheet
  if (isMobile) {
    return (
      <>
        <NominasModal />
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="fixed left-4 top-4 z-50 md:hidden hover:bg-gray-700"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 bg-gray-800 border-gray-700">
            <NavContent />
          </SheetContent>
        </Sheet>
      </>
    );
  }

  // Versión desktop
  return (
    <div
      className={`hidden md:block h-screen bg-gray-800 transition-all duration-500 ease-in-out overflow-hidden
        ${isCollapsed ? 'w-16' : 'w-64'}
      `}
    >
      <NominasModal />
      <NavContent />
    </div>
  )
}