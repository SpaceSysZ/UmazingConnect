import { NextRequest, NextResponse } from 'next/server'
import { sendPushToUser } from '@/lib/services/push'
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

    // Debug: Check how many subscriptions exist for this user
    const subCheck = await pool.query(
      'SELECT COUNT(*) as count FROM push_subscriptions WHERE user_id = $1',
      [userId]
    )
    const subscriptionCount = parseInt(subCheck.rows[0]?.count || '0')

    const result = await sendPushToUser(userId, {
      title: 'Test Notification',
      body: 'Button clicked! Push notifications are working.',
      url: '/',
      tag: 'test-notification',
    })

    return NextResponse.json({
      success: true,
      message: 'Test notification sent',
      result,
      debug: {
        userId,
        subscriptionsInDb: subscriptionCount,
      },
    })
  } catch (error) {
    console.error('Error sending test notification:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send test notification' },
      { status: 500 }
    )
  }
}
