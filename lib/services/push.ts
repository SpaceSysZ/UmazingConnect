// @ts-ignore - web-push doesn't have type declarations
import webpush from 'web-push'
import pool from '@/lib/db'

// Track if VAPID has been initialized
let vapidInitialized = false

/**
 * Initialize VAPID details - called at runtime to ensure env vars are available
 */
function ensureVapidInitialized() {
  if (vapidInitialized) return true

  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY

  console.log('[Push] Initializing VAPID:', {
    hasPublic: !!vapidPublicKey,
    hasPrivate: !!vapidPrivateKey,
    publicLength: vapidPublicKey?.length,
    privateLength: vapidPrivateKey?.length,
  })

  if (vapidPublicKey && vapidPrivateKey) {
    webpush.setVapidDetails(
      'mailto:notifications@schoolconnect.app',
      vapidPublicKey,
      vapidPrivateKey
    )
    vapidInitialized = true
    console.log('[Push] VAPID initialized successfully')
    return true
  }

  console.warn('[Push] VAPID keys not available')
  return false
}

/**
 * Get VAPID configuration status for debugging
 */
export function getVapidStatus() {
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY

  return {
    configured: !!(vapidPublicKey && vapidPrivateKey),
    hasPublicKey: !!vapidPublicKey,
    hasPrivateKey: !!vapidPrivateKey,
    publicKeyLength: vapidPublicKey?.length || 0,
    privateKeyLength: vapidPrivateKey?.length || 0,
    vapidInitialized,
  }
}

export interface PushPayload {
  title: string
  body: string
  url?: string
  clubId?: string
  postId?: string
  notificationId?: string
  tag?: string
}

interface PushSubscription {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

/**
 * Send a push notification to a single subscription
 * Returns true if successful, false if failed
 */
export async function sendPushNotification(
  subscription: PushSubscription,
  payload: PushPayload
): Promise<boolean> {
  if (!ensureVapidInitialized()) {
    console.warn('[Push] VAPID keys not configured, skipping push notification')
    return false
  }

  try {
    console.log('[Push] Attempting to send notification to:', subscription.endpoint.substring(0, 80))
    const result = await webpush.sendNotification(subscription, JSON.stringify(payload), {
      TTL: 86400, // 24 hours - required by iOS/Safari
      urgency: 'high', // Attempt immediate delivery (important for iOS)
    })
    console.log('[Push] Send successful, status:', result.statusCode)
    return true
  } catch (error: any) {
    console.error('[Push] Send failed:', {
      statusCode: error.statusCode,
      message: error.message,
      body: error.body,
      endpoint: subscription.endpoint.substring(0, 80),
    })
    // Handle specific error codes
    if (error.statusCode === 410 || error.statusCode === 404) {
      // Subscription is no longer valid - remove it from database
      console.log('[Push] Removing invalid subscription:', subscription.endpoint)
      await removeSubscription(subscription.endpoint)
    }
    return false
  }
}

/**
 * Send push notifications to all subscriptions for a user
 * Non-blocking - failures won't throw
 */
export async function sendPushToUser(
  userId: string,
  payload: PushPayload
): Promise<{ sent: number; failed: number }> {
  const result = { sent: 0, failed: 0 }

  console.log('[Push] sendPushToUser called for user:', userId)

  if (!ensureVapidInitialized()) {
    console.warn('[Push] VAPID keys not configured, skipping push notifications')
    return result
  }

  try {
    // Get all subscriptions for this user
    const subscriptionsResult = await pool.query(
      'SELECT endpoint, p256dh_key, auth_key FROM push_subscriptions WHERE user_id = $1',
      [userId]
    )

    console.log('[Push] Found subscriptions:', subscriptionsResult.rows.length)

    const subscriptions: PushSubscription[] = subscriptionsResult.rows.map((row) => ({
      endpoint: row.endpoint,
      keys: {
        p256dh: row.p256dh_key,
        auth: row.auth_key,
      },
    }))

    // Send to all subscriptions in parallel
    const results = await Promise.allSettled(
      subscriptions.map((sub) => {
        console.log('[Push] Sending to endpoint:', sub.endpoint.substring(0, 50) + '...')
        return sendPushNotification(sub, payload)
      })
    )

    results.forEach((r, i) => {
      if (r.status === 'fulfilled' && r.value) {
        console.log('[Push] Success for subscription', i)
        result.sent++
      } else {
        console.log('[Push] Failed for subscription', i, r.status === 'rejected' ? r.reason : 'value was false')
        result.failed++
      }
    })
  } catch (error) {
    console.error('[Push] Error sending push notifications to user:', error)
  }

  console.log('[Push] Final result:', result)
  return result
}

/**
 * Remove a subscription from the database by endpoint
 */
async function removeSubscription(endpoint: string): Promise<void> {
  try {
    await pool.query('DELETE FROM push_subscriptions WHERE endpoint = $1', [endpoint])
  } catch (error) {
    console.error('Error removing subscription:', error)
  }
}
