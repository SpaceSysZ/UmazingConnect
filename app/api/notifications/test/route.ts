import { NextRequest, NextResponse } from 'next/server'
import { sendPushToUser, getVapidStatus } from '@/lib/services/push'
import pool from '@/lib/db'

// POST /api/notifications/test - Send a test push notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 400 }
      )
    }

    // Debug: Check VAPID key status
    const vapidStatus = getVapidStatus()

    // Debug: Check how many subscriptions exist for this user
    const subCheck = await pool.query(
      'SELECT COUNT(*) as count FROM push_subscriptions WHERE user_id = $1',
      [userId]
    )
    const subscriptionCount = parseInt(subCheck.rows[0]?.count || '0')

    // Debug: Get actual subscription details
    const subsDetails = await pool.query(
      'SELECT endpoint, p256dh_key, auth_key FROM push_subscriptions WHERE user_id = $1',
      [userId]
    )

    console.log('🔍 Test Push Debug:')
    console.log('  User ID:', userId)
    console.log('  Subscriptions in DB:', subscriptionCount)
    console.log('  VAPID Configured:', vapidStatus.configured)
    console.log('  Endpoints:', subsDetails.rows.map((r: any) => r.endpoint))

    // Create an in-app notification record so it shows in the notification bar
    const notificationResult = await pool.query(
      `INSERT INTO notifications (user_id, type, title, body)
       VALUES ($1, 'club_update', $2, $3)
       RETURNING id`,
      [userId, 'Test Notification', 'Button clicked! Push notifications are working.']
    )
    const notificationId = notificationResult.rows[0]?.id

    console.log('📬 Sending push notification...')
    const result = await sendPushToUser(userId, {
      title: 'Test Notification',
      body: 'Button clicked! Push notifications are working.',
      url: '/notifications',
      tag: 'test-notification',
      notificationId,
    })

    console.log('📨 Push result:', JSON.stringify(result, null, 2))

    return NextResponse.json({
      success: true,
      message: 'Test notification sent',
      result,
      debug: {
        userId,
        subscriptionsInDb: subscriptionCount,
        subscriptionsFound: subsDetails.rows.length,
        vapidConfigured: vapidStatus.configured,
        vapidPublicKeySet: vapidStatus.hasPublicKey,
        vapidPrivateKeySet: vapidStatus.hasPrivateKey,
        errors: (result as any).errors || [],
        sent: (result as any).sent || 0,
        failed: (result as any).failed || 0,
        endpoints: subsDetails.rows.map((r: any) => r.endpoint.substring(0, 60) + '...'),
      },
    })
  } catch (error) {
    console.error('❌ Error sending test notification:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send test notification' },
      { status: 500 }
    )
  }
}