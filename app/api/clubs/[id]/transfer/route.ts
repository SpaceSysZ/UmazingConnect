import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

// POST /api/clubs/[id]/transfer - Transfer presidency to another member
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // Changed type
) {
  try {
    const { id: clubId } = await params // Await params
    const body = await request.json()
    const fromUserId = body.fromUserId
    const toUserId = body.toUserId

    if (!fromUserId || !toUserId) {
      return NextResponse.json(
        { success: false, error: 'Both fromUserId and toUserId are required' },
        { status: 400 }
      )
    }

    if (fromUserId === toUserId) {
      return NextResponse.json(
        { success: false, error: 'Cannot transfer to yourself' },
        { status: 400 }
      )
    }

    // Check if fromUser is president
    const clubQuery = 'SELECT president_id FROM clubs WHERE id = $1'
    const clubResult = await pool.query(clubQuery, [clubId])

    if (clubResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Club not found' },
        { status: 404 }
      )
    }

    if (clubResult.rows[0].president_id !== fromUserId) {
      return NextResponse.json(
        { success: false, error: 'Only the president can transfer ownership' },
        { status: 403 }
      )
    }

    // Check if toUser is a member
    const memberCheck = await pool.query(
      'SELECT id FROM club_members WHERE club_id = $1 AND user_id = $2',
      [clubId, toUserId]
    )

    if (memberCheck.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Target user must be a member of the club' },
        { status: 400 }
      )
    }

    // Start transaction
    await pool.query('BEGIN')

    try {
      // Update club president
      await pool.query(
        'UPDATE clubs SET president_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [toUserId, clubId]
      )

      // Update member roles
      await pool.query(
        'UPDATE club_members SET role = $1 WHERE club_id = $2 AND user_id = $3',
        ['member', clubId, fromUserId]
      )
      await pool.query(
        'UPDATE club_members SET role = $1 WHERE club_id = $2 AND user_id = $3',
        ['president', clubId, toUserId]
      )

      // Log the transfer
      await pool.query(
        `INSERT INTO presidency_transfers (club_id, from_user_id, to_user_id, status, completed_at)
         VALUES ($1, $2, $3, 'completed', CURRENT_TIMESTAMP)`,
        [clubId, fromUserId, toUserId]
      )

      await pool.query('COMMIT')

      return NextResponse.json({
        success: true,
        message: 'Presidency transferred successfully',
      })
    } catch (error) {
      await pool.query('ROLLBACK')
      throw error
    }
  } catch (error) {
    console.error('Error transferring presidency:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to transfer presidency' },
      { status: 500 }
    )
  }
}

