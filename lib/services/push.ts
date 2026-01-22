// @ts-ignore - web-push doesn't have type declarations
import webpush from 'web-push'
import pool from '@/lib/db'

// Initialize web-push with VAPID details
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(
    'mailto:notifications@schoolconnect.app',
    vapidPublicKey,
    vapidPrivateKey
  )
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
  if (!vapidPublicKey || !vapidPrivateKey) {
    console.warn('VAPID keys not configured, skipping push notification')
    return false
  }

  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload))
    return true
  } catch (error: any) {
    // Handle specific error codes
    if (error.statusCode === 410 || error.statusCode === 404) {
      // Subscription is no longer valid - remove it from database
      console.log('Removing invalid subscription:', subscription.endpoint)
      await removeSubscription(subscription.endpoint)
    } else {
      console.error('Error sending push notification:', error.message)
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

  if (!vapidPublicKey || !vapidPrivateKey) {
    console.warn('VAPID keys not configured, skipping push notifications')
    return result
  }

  try {
    // Get all subscriptions for this user
    const subscriptionsResult = await pool.query(
      'SELECT endpoint, p256dh_key, auth_key FROM push_subscriptions WHERE user_id = $1',
      [userId]
    )

    const subscriptions: PushSubscription[] = subscriptionsResult.rows.map((row) => ({
      endpoint: row.endpoint,
      keys: {
        p256dh: row.p256dh_key,
        auth: row.auth_key,
      },
    }))

    // Send to all subscriptions in parallel
    const results = await Promise.allSettled(
      subscriptions.map((sub) => sendPushNotification(sub, payload))
    )

    results.forEach((r) => {
      if (r.status === 'fulfilled' && r.value) {
        result.sent++
      } else {
        result.failed++
      }
    })
  } catch (error) {
    console.error('Error sending push notifications to user:', error)
  }

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
