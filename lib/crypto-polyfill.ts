/**
 * Crypto Polyfill for Mobile Testing over HTTP
 * 
 * MSAL requires the Web Crypto API which is only available in secure contexts (HTTPS).
 * This polyfill provides a fallback for development/testing over HTTP.
 * 
 * ⚠️ WARNING: This is for DEVELOPMENT/TESTING ONLY!
 * In production, always use HTTPS.
 */

export function setupCryptoPolyfill() {
  if (typeof window === 'undefined') return

  // Check if crypto is already available and working
  if (window.crypto && window.crypto.subtle && window.crypto.getRandomValues) {
    return // Native crypto is available, no polyfill needed
  }

  console.warn('⚠️ Crypto API not available. Using polyfill for development.')
  console.warn('⚠️ This should only happen during mobile testing over HTTP.')
  console.warn('⚠️ In production, always use HTTPS!')

  // Create a basic polyfill for crypto
  const cryptoPolyfill: any = {
    getRandomValues: function(array: any) {
      // Fallback to Math.random (NOT CRYPTOGRAPHICALLY SECURE!)
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256)
      }
      return array
    },
    randomUUID: function() {
      // Generate a simple UUID v4
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0
        const v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
      })
    },
    subtle: {
      digest: async function(algorithm: string, data: any) {
        // Simple hash fallback (NOT CRYPTOGRAPHICALLY SECURE!)
        const text = typeof data === 'string' ? data : new TextDecoder().decode(data)
        let hash = 0
        for (let i = 0; i < text.length; i++) {
          const char = text.charCodeAt(i)
          hash = ((hash << 5) - hash) + char
          hash = hash & hash
        }
        const buffer = new ArrayBuffer(32)
        const view = new Uint8Array(buffer)
        for (let i = 0; i < 32; i++) {
          view[i] = (hash >> (i % 4 * 8)) & 0xff
        }
        return buffer
      },
      generateKey: async function() {
        return { type: 'secret', algorithm: { name: 'HMAC' } }
      },
      importKey: async function() {
        return { type: 'secret', algorithm: { name: 'HMAC' } }
      },
      exportKey: async function() {
        return new ArrayBuffer(32)
      },
      sign: async function() {
        return new ArrayBuffer(64)
      },
      verify: async function() {
        return true
      },
      encrypt: async function() {
        return new ArrayBuffer(32)
      },
      decrypt: async function() {
        return new ArrayBuffer(32)
      },
    }
  }

  // Apply polyfill
  try {
    if (!window.crypto) {
      // @ts-ignore
      window.crypto = cryptoPolyfill
    } else {
      // Patch missing methods
      if (!window.crypto.getRandomValues) {
        window.crypto.getRandomValues = cryptoPolyfill.getRandomValues
      }
      if (!window.crypto.randomUUID) {
        // @ts-ignore
        window.crypto.randomUUID = cryptoPolyfill.randomUUID
      }
      if (!window.crypto.subtle) {
        // @ts-ignore
        window.crypto.subtle = cryptoPolyfill.subtle
      }
    }
    console.log('✅ Crypto polyfill applied successfully')
  } catch (error) {
    console.error('❌ Failed to apply crypto polyfill:', error)
  }
}

/**
 * Check if we're in a secure context
 */
export function isSecureContext(): boolean {
  if (typeof window === 'undefined') return true

  return (
    window.location.protocol === 'https:' ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  )
}

/**
 * Get a warning message for non-secure contexts
 */
export function getSecurityWarning(): string | null {
  if (isSecureContext()) return null

  return `
    ⚠️ DEVELOPMENT MODE: Running over HTTP
    
    Authentication may not work properly because:
    - Web Crypto API requires HTTPS
    - Using polyfill for testing only
    
    For full authentication testing, use one of these options:
    1. Use ngrok: npx ngrok http 3000
    2. Test on localhost (desktop browser)
    3. Deploy to production (HTTPS)
  `
}
