// Service Worker for SchoolConnect Push Notifications

const CACHE_NAME = 'schoolconnect-v1'

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    })
  )
  self.clients.claim()
})

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  if (!event.data) {
    return
  }

  try {
    const data = event.data.json()

    const options = {
      body: data.body || 'New notification from SchoolConnect',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: [100, 50, 100],
      data: {
        url: data.url || '/',
        notificationId: data.notificationId,
        clubId: data.clubId,
        postId: data.postId,
      },
      actions: [
        {
          action: 'open',
          title: 'View',
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
        },
      ],
      tag: data.tag || 'schoolconnect-notification',
      renotify: true,
    }

    event.waitUntil(
      self.registration.showNotification(data.title || 'SchoolConnect', options)
    )
  } catch (error) {
    console.error('Error processing push notification:', error)
  }
})

// Notification click event - handle user interaction
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'dismiss') {
    return
  }

  const urlToOpen = event.notification.data?.url || '/'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Check if there's already a window open
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus()
          client.navigate(urlToOpen)
          return
        }
      }
      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen)
      }
    })
  )
})

// Background sync for offline notification actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'mark-notification-read') {
    event.waitUntil(markNotificationsAsRead())
  }
})

async function markNotificationsAsRead() {
  // This would sync read status when back online
  // Implementation depends on IndexedDB storage of pending actions
}
