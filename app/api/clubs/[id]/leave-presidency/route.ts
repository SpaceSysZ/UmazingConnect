import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

// POST /api/clubs/[id]/leave-presidency - President leaves and transfers presidency
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: clubId } = await params
    const body = await request.json()
    const userId = body.userId
    const newPresidentId = body.newPresidentId

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 400 }
      )
    }

    // Verify user is the current president
    const presidentCheck = await pool.query(
      'SELECT president_id FROM clubs WHERE id = $1',
      [clubId]
    )

    if (presidentCheck.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Club not found' },
        { status: 404 }
      )
    }

    const currentPresidentId = presidentCheck.rows[0].president_id

    if (currentPresidentId !== userId) {
      return NextResponse.json(
        { success: false, error: 'Only the president can transfer presidency' },
        { status: 403 }
      )
    }

    // Start transaction
    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      if (newPresidentId) {
        // Transfer presidency to another member
        
        // Verify new president is a member
        const memberCheck = await client.query(
          'SELECT id, role FROM club_members WHERE club_id = $1 AND user_id = $2',
          [clubId, newPresidentId]
        )

        if (memberCheck.rows.length === 0) {
          throw new Error('New president must be a club member')
        }

        // Update club president
        await client.query(
          'UPDATE clubs SET president_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          [newPresidentId, clubId]
        )

        // Update old president to regular member
        await client.query(
          'UPDATE club_members SET role = $1 WHERE club_id = $2 AND user_id = $3',
          ['member', clubId, userId]
        )

        // Update new president role
        await client.query(
          'UPDATE club_members SET role = $1 WHERE club_id = $2 AND user_id = $3',
          ['president', clubId, newPresidentId]
        )

        await client.query('COMMIT')

        return NextResponse.json({
          success: true,
          message: 'Presidency transferred successfully'
        })
      } else {
        // No successor - unclaim the club and leave
        
        // Update club to unclaimed
        await client.query(
          'UPDATE clubs SET is_claimed = false, president_id = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
          [clubId]
        )

        // Remove user from club
        await client.query(
          'DELETE FROM club_members WHERE club_id = $1 AND user_id = $2',
          [clubId, userId]
        )

        await client.query('COMMIT')

        return NextResponse.json({
          success: true,
          message: 'Club unclaimed and you have left the club'
        })
      }
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  } catch (error: any) {
    console.error('Error leaving presidency:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to leave presidency' },
      { status: 500 }
    )
  }
}
