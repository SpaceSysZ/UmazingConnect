import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getVapidStatus } from '@/lib/services/push'

// GET /api/notifications/debug?userId=xxx - Show subscription details for debugging
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required as query param' },
        { status: 400 }
      )
    }

    // Get all subscriptions for this user
    const result = await pool.query(
      'SELECT id, endpoint, p256dh_key, auth_key, created_at FROM push_subscriptions WHERE user_id = $1',
      [userId]
    )

    const vapidStatus = getVapidStatus()

    return NextResponse.json({
      success: true,
      userId,
      vapidStatus,
      vapidPublicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      subscriptionCount: result.rows.length,
      subscriptions: result.rows.map((row) => ({
        id: row.id,
        endpoint: row.endpoint, // Full endpoint, not truncated
        p256dh_key: row.p256dh_key,
        auth_key: row.auth_key,
        created_at: row.created_at,
      })),
    })
  } catch (error) {
    console.error('Debug endpoint error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get debug info' },
      { status: 500 }
    )
  }
}
