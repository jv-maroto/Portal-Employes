'use client'

import { useState } from 'react'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function RecuperarPassword() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    dni: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (formData.newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    console.log('Password reset attempt:', formData)
    setSuccess(true)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="w-full max-w-md space-y-8 p-8 bg-gray-800/50 rounded-2xl backdrop-blur-sm border border-gray-700">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Cambiar Contraseña
          </h2>
          <p className="mt-2 text-gray-400">
            Ingresa tu DNI y nueva contraseña
          </p>
        </div>

        {!success ? (
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="dni" className="text-gray-300">DNI</Label>
                <Input
                  id="dni"
                  name="dni"
                  value={formData.dni}
                  onChange={handleChange}
                  placeholder="Ingresa tu DNI"
                  className="pl-10 bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500"
                  required
                />
              </div>
              <div>
                <Label htmlFor="newPassword" className="text-gray-300">Nueva Contraseña</Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Ingresa tu nueva contraseña"
                  className="pl-10 bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute inset-y-0 right-0 pr-3 text-gray-400 hover:text-gray-300"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </Button>
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="text-gray-300">Confirmar Contraseña</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirma tu nueva contraseña"
                  className="pl-10 bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500"
                  required
                />
              </div>
            </div>
            {error && <div className="text-red-400 text-sm text-center">{error}</div>}
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg transition-colors"
            >
              Cambiar Contraseña
            </Button>
          </form>
        ) : (
          <div className="text-center space-y-6">
            <p className="text-green-400">
              Tu contraseña ha sido actualizada exitosamente.
            </p>
            <a 
              href="/" 
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg transition-colors text-center block"
            >
              Volver al inicio
            </a>
          </div>
        )}
        <a 
          href="/" 
          className="flex items-center justify-center text-sm text-gray-400 hover:text-gray-300 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al inicio de sesión
        </a>
      </div>
    </div>
  )
}
