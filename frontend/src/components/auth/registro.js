'use client'

import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function Registro() {
  const [showPassword] = useState(false)
  const [formData, setFormData] = useState({
    dni: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      alert('Las contraseñas no coinciden')
      return
    }
    console.log('Registration attempt:', formData)
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="w-full max-w-md space-y-8 p-8 bg-gray-800/50 rounded-2xl backdrop-blur-sm border border-gray-700">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Crear Cuenta
          </h2>
          <p className="mt-2 text-gray-400">
            Regístrate para acceder al portal
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="dni" className="text-gray-300">DNI</Label>
              <Input
                id="dni"
                name="dni"
                placeholder="Ingresa tu DNI"
                value={formData.dni}
                onChange={handleChange}
                className="pl-10 bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500"
                required
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-gray-300">Correo Electrónico</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="correo@ejemplo.com"
                value={formData.email}
                onChange={handleChange}
                className="pl-10 bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500"
                required
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-gray-300">Contraseña</Label>
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Crea tu contraseña"
                value={formData.password}
                onChange={handleChange}
                className="pl-10 bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500"
                required
              />
            </div>
          </div>
          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg transition-colors"
          >
            Crear Cuenta
          </Button>
        </form>
        <a 
          href="/" 
          className="flex items-center text-sm text-gray-400 hover:text-gray-300 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al inicio de sesión
        </a>
      </div>
    </div>
  )
}

