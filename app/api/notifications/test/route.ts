import { NextRequest, NextResponse } from 'next/server'
import { sendPushToUser } from '@/lib/services/push'

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
    })
  } catch (error) {
    console.error('Error sending test notification:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send test notification' },
      { status: 500 }
    )
  }
}
