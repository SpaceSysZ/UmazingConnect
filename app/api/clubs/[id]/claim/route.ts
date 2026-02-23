import { NextRequest, NextResponse } from 'next/server'
import pool, { db } from '@/lib/db'

// POST /api/clubs/[id]/claim - Claim an unclaimed club
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: clubId } = await params
    const body = await request.json()
    const { userId, confirmed } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 400 }
      )
    }

    if (!confirmed) {
      return NextResponse.json(
        { success: false, error: 'You must confirm that you are the president of this club' },
        { status: 400 }
      )
    }

    // Check if club exists and is unclaimed
    const clubResult = await pool.query(
      'SELECT is_claimed, name FROM clubs WHERE id = $1',
      [clubId]
    )

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

    // Use db.transaction() which pins a dedicated client for the whole
    // transaction — pool.query('BEGIN') is unsafe because each call can
    // land on a different connection from the pool.
    let isFirstPresident = false
    await db.transaction(async (client) => {
      const existingPresidents = await client.query(
        `SELECT user_id FROM club_members WHERE club_id = $1 AND role = 'president'`,
        [clubId]
      )
      isFirstPresident = existingPresidents.rows.length === 0

      if (isFirstPresident) {
        await client.query(
          'UPDATE clubs SET is_claimed = TRUE, president_id = $1 WHERE id = $2',
          [userId, clubId]
        )
      } else {
        await client.query(
          'UPDATE clubs SET is_claimed = TRUE WHERE id = $1',
          [clubId]
        )
      }

      await client.query(
        `INSERT INTO club_members (club_id, user_id, role)
         VALUES ($1, $2, 'president')
         ON CONFLICT (club_id, user_id) DO UPDATE SET role = 'president'`,
        [clubId, userId]
      )
    })

    const message = isFirstPresident
      ? `You are now the president of ${club.name}!`
      : `You are now a co-president of ${club.name}!`

    return NextResponse.json({ success: true, message })
  } catch (error) {
    console.error('Error claiming club:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to claim club' },
      { status: 500 }
    )
  }
}