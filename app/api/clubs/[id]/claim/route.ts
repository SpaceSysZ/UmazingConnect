import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

// POST /api/clubs/[id]/claim - Claim an unclaimed club
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: clubId } = await params
    const body = await request.json()
    const { userId, userName, userEmail, userAvatar } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 400 }
      )
    }

    // Check if club exists and is unclaimed
    const clubQuery = 'SELECT is_claimed, president_id, name FROM clubs WHERE id = $1'
    const clubResult = await pool.query(clubQuery, [clubId])

    if (clubResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Club not found' },
        { status: 404 }
      )
    }

    const club = clubResult.rows[0]

    if (club.is_claimed) {
      return NextResponse.json(
        { success: false, error: 'Club is already claimed' },
        { status: 409 }
      )
    }

    // Start transaction: ensure user exists, claim club, and add as president member
    await pool.query('BEGIN')

    try {
      // 1. Ensure user exists in users table (insert if not exists)
      await pool.query(
        `INSERT INTO users (id, name, email, avatar_url, created_at, updated_at)
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         ON CONFLICT (id) DO NOTHING`,
        [userId, userName || 'Club President', userEmail || null, userAvatar || null]
      )

      // 2. Update club to claimed
      await pool.query(
        'UPDATE clubs SET is_claimed = TRUE, president_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [userId, clubId]
      )

      // 3. Add user as president member
      await pool.query(
        `INSERT INTO club_members (club_id, user_id, role, joined_at)
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
         ON CONFLICT (club_id, user_id) DO UPDATE SET role = $3`,
        [clubId, userId, 'president']
      )

      await pool.query('COMMIT')

      return NextResponse.json({
        success: true,
        message: `You are now the president of ${club.name}!`,
      })
    } catch (error) {
      await pool.query('ROLLBACK')
      throw error
    }
  } catch (error) {
    console.error('Error claiming club:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to claim club' },
      { status: 500 }
    )
  }
}