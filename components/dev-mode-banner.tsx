"use client"

import { useEffect, useState } from 'react'
import { isSecureContext } from '@/lib/crypto-polyfill'
import { AlertTriangle, X } from 'lucide-react'

/**
 * Development Mode Banner
 * Shows a warning when accessing the app over HTTP (mobile testing)
 */
export function DevModeBanner() {
  const [show, setShow] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Only show in development and non-secure contexts
    const isDev = process.env.NODE_ENV === 'development'
    const isInsecure = !isSecureContext()
    
    if (isDev && isInsecure && !dismissed) {
      setShow(true)
    }
  }, [dismissed])

  if (!show) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-yellow-500 text-yellow-900 px-3 py-2 text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">
            <strong>Development Mode:</strong> Testing over HTTP. 
            <span className="hidden sm:inline"> Authentication may be limited. Use ngrok for full testing.</span>
          </span>
        </div>
        <button
          onClick={() => {
            setDismissed(true)
            setShow(false)
          }}
          className="flex-shrink-0 hover:bg-yellow-600 rounded p-1"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
