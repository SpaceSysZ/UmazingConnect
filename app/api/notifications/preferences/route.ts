import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

// GET /api/notifications/preferences - Get user's notification preferences
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 400 }
      )
    }

    const result = await pool.query(
      'SELECT * FROM notification_preferences WHERE user_id = $1',
      [userId]
    )

    if (result.rows.length === 0) {
      // Return default preferences if none exist
      return NextResponse.json({
        success: true,
        data: {
          push_enabled: true,
          filter_mode: 'all',
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    })
  } catch (error) {
    console.error('Error fetching notification preferences:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch preferences' },
      { status: 500 }
    )
  }
}

// PUT /api/notifications/preferences - Update user's notification preferences
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, pushEnabled, filterMode } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 400 }
      )
    }

    // Validate filterMode
    if (filterMode && !['all', 'my_clubs'].includes(filterMode)) {
      return NextResponse.json(
        { success: false, error: 'Invalid filter mode. Must be "all" or "my_clubs"' },
        { status: 400 }
      )
    }

    // Upsert preferences
    const result = await pool.query(
      `INSERT INTO notification_preferences (user_id, push_enabled, filter_mode, updated_at)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id)
       DO UPDATE SET
         push_enabled = COALESCE($2, notification_preferences.push_enabled),
         filter_mode = COALESCE($3, notification_preferences.filter_mode),
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [userId, pushEnabled, filterMode]
    )

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    })
  } catch (error) {
    console.error('Error updating notification preferences:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update preferences' },
      { status: 500 }
    )
  }
}
