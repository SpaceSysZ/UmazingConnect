/**
 * Utility to clear MSAL cache and fix interaction_in_progress errors
 */

export function clearMSALCache() {
  if (typeof window === 'undefined') return

  try {
    // Clear session storage (where MSAL stores its state)
    const keysToRemove: string[] = []
    
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)
      if (key && key.startsWith('msal.')) {
        keysToRemove.push(key)
      }
    }
    
    keysToRemove.forEach(key => sessionStorage.removeItem(key))
    
    // Also clear from localStorage if storeAuthStateInCookie is true
    const localKeysToRemove: string[] = []
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('msal.')) {
        localKeysToRemove.push(key)
      }
    }
    
    localKeysToRemove.forEach(key => localStorage.removeItem(key))
    
    console.log('✅ MSAL cache cleared successfully')
    console.log(`Removed ${keysToRemove.length + localKeysToRemove.length} MSAL entries`)
    
    return true
  } catch (error) {
    console.error('❌ Failed to clear MSAL cache:', error)
    return false
  }
}

/**
 * Check if there's a stuck interaction state
 */
export function checkStuckInteraction(): boolean {
  if (typeof window === 'undefined') return false

  try {
    // Check for interaction_in_progress flag in storage
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)
      if (key && key.includes('interaction.status')) {
        const value = sessionStorage.getItem(key)
        if (value && value.includes('interaction_in_progress')) {
          console.warn('⚠️ Found stuck interaction state')
          return true
        }
      }
    }
    return false
  } catch (error) {
    console.error('Error checking interaction state:', error)
    return false
  }
}

/**
 * Auto-fix stuck interaction state
 */
export function autoFixStuckInteraction() {
  if (checkStuckInteraction()) {
    console.log('🔧 Auto-fixing stuck interaction state...')
    clearMSALCache()
    console.log('✅ Fixed! Please refresh the page.')
    return true
  }
  return false
}

/**
 * Add to window for manual debugging
 */
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.clearMSALCache = clearMSALCache
  // @ts-ignore
  window.checkStuckInteraction = checkStuckInteraction
  // @ts-ignore
  window.autoFixStuckInteraction = autoFixStuckInteraction
  
  console.log('🔧 MSAL Debug Tools Available:')
  console.log('  - window.clearMSALCache() - Clear all MSAL cache')
  console.log('  - window.checkStuckInteraction() - Check for stuck state')
  console.log('  - window.autoFixStuckInteraction() - Auto-fix stuck state')
}
