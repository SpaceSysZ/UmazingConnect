import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

// GET /api/notifications - Get user's notifications
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId    = searchParams.get('userId')
    const unreadOnly = searchParams.get('unreadOnly') === 'true'
    const limit      = parseInt(searchParams.get('limit') || '50')
    const offset     = parseInt(searchParams.get('offset') || '0')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 400 }
      )
    }

    // Fetch user preferences first — the result determines the WHERE clause
    // used in the two queries that follow.
    const prefsResult = await pool.query(
      'SELECT filter_mode FROM notification_preferences WHERE user_id = $1',
      [userId]
    )
    const filterMode = prefsResult.rows[0]?.filter_mode || 'all'

    // Replace the old correlated IN-subquery with EXISTS which is evaluated
    // once per row rather than re-running a subquery each time.
    // Also keep club_id IS NULL to preserve system notifications.
    const myClubsFilter = filterMode === 'my_clubs'
      ? `AND (n.club_id IS NULL OR EXISTS (
           SELECT 1 FROM club_members
           WHERE club_id = n.club_id AND user_id = $1
         ))`
      : ''

    const unreadFilter = unreadOnly ? 'AND n.is_read = FALSE' : ''

    const notificationsQuery = `
      SELECT n.*, c.name AS club_name, c.image_url AS club_image
      FROM notifications n
      LEFT JOIN clubs c ON n.club_id = c.id
      WHERE n.user_id = $1
        ${myClubsFilter}
        ${unreadFilter}
      ORDER BY n.created_at DESC
      LIMIT $2 OFFSET $3
    `

    const countQuery = `
      SELECT COUNT(*)::int AS count
      FROM notifications n
      WHERE n.user_id = $1
        AND n.is_read = FALSE
        ${myClubsFilter}
    `

    // Main query and unread count run in parallel — both use the same
    // resolved filterMode so no ordering dependency.
    const [result, countResult] = await Promise.all([
      pool.query(notificationsQuery, [userId, limit, offset]),
      pool.query(countQuery, [userId]),
    ])

    return NextResponse.json({
      success: true,
      data: result.rows,
      unreadCount: countResult.rows[0].count,
      filterMode,
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

// POST /api/notifications - Mark notifications as read
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, notificationIds, markAllRead } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 400 }
      )
    }

    if (markAllRead) {
      await pool.query(
        'UPDATE notifications SET is_read = TRUE WHERE user_id = $1',
        [userId]
      )
    } else if (notificationIds && notificationIds.length > 0) {
      await pool.query(
        'UPDATE notifications SET is_read = TRUE WHERE user_id = $1 AND id = ANY($2::uuid[])',
        [userId, notificationIds]
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Notifications marked as read',
    })
  } catch (error) {
    console.error('Error marking notifications as read:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update notifications' },
      { status: 500 }
    )
  }
}
