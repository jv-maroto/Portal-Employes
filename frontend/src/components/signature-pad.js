'use client'

import { useRef, useEffect } from 'react'

export default function SignaturePad({ onSignatureChange }) {
  const canvasRef = useRef(null)
  const isDrawing = useRef(false)
  
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    const draw = (e) => {
      if (!isDrawing.current) return
      
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      ctx.lineTo(e.offsetX, e.offsetY)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(e.offsetX, e.offsetY)
    }
    
    canvas.addEventListener('mousedown', (e) => {
      isDrawing.current = true
      ctx.beginPath()
      ctx.moveTo(e.offsetX, e.offsetY)
    })
    
    canvas.addEventListener('mousemove', draw)
    canvas.addEventListener('mouseup', () => {
      isDrawing.current = false
      onSignatureChange(canvas.toDataURL())
    })
    
    return () => {
      canvas.removeEventListener('mousedown', () => {})
      canvas.removeEventListener('mousemove', draw)
      canvas.removeEventListener('mouseup', () => {})
    }
  }, [onSignatureChange])
  
  const clearSignature = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    onSignatureChange(null)
  }
  
  return (
    <div className="space-y-2">
      <canvas
        ref={canvasRef}
        className="border rounded-lg w-full h-40 bg-white"
        width={400}
        height={160}
      />
      <button
        onClick={clearSignature}
        className="text-sm text-blue-600 hover:text-blue-800"
      >
        Limpiar firma
      </button>
    </div>
  )
}

