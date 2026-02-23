import { NextRequest, NextResponse } from 'next/server'
import pool, { db } from '@/lib/db'

// PUT /api/clubs/[id]/tags - Update club tags (leadership only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: clubId } = await params
    const body = await request.json()
    const { tags } = body

    if (!Array.isArray(tags)) {
      return NextResponse.json(
        { success: false, error: 'Tags must be an array' },
        { status: 400 }
      )
    }

    if (tags.length > 10) {
      return NextResponse.json(
        { success: false, error: 'Maximum 10 tags allowed' },
        { status: 400 }
      )
    }

    // Validate each tag
    for (const tag of tags) {
      if (typeof tag !== 'string' || tag.length > 30) {
        return NextResponse.json(
          { success: false, error: 'Each tag must be a string with max 30 characters' },
          { status: 400 }
        )
      }
    }

    // Check if club exists
    const clubCheck = await pool.query('SELECT id FROM clubs WHERE id = $1', [clubId])
    if (clubCheck.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Club not found' },
        { status: 404 }
      )
    }

    // Use db.transaction() which pins a dedicated client for the whole
    // transaction — pool.query('BEGIN') is unsafe because each call can
    // land on a different connection from the pool.
    await db.transaction(async (client) => {
      await client.query('DELETE FROM club_tags WHERE club_id = $1', [clubId])

      if (tags.length > 0) {
        // Batch insert all tags in a single round trip using unnest.
        const normalized = tags.map((t: string) => t.toLowerCase().trim())
        await client.query(
          `INSERT INTO club_tags (club_id, tag)
           SELECT $1, unnest($2::text[])
           ON CONFLICT DO NOTHING`,
          [clubId, normalized]
        )
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Tags updated successfully',
      data: { tags },
    })
  } catch (error) {
    console.error('Error updating tags:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update tags' },
      { status: 500 }
    )
  }
}
