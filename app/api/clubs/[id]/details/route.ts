import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

// Thin wrapper that returns {rows:[]} instead of throwing when a table doesn't
// exist yet (tags / posts tables may be absent in older deployments).
async function safeQuery(text: string, params: any[]) {
  try {
    return await pool.query(text, params)
  } catch {
    return { rows: [] as any[] }
  }
}

// GET /api/clubs/[id]/details - Get complete club details including members and posts
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: clubId } = await params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    // Fire all queries in parallel — including the optional membership check.
    // If the club doesn't exist we handle the 404 after all settle.
    const [
      clubResult,
      presidentsResult,
      sponsorsResult,
      tagsResult,
      membersResult,
      postsResult,
      membershipResult,
    ] = await Promise.all([
      pool.query(
        `SELECT c.*, u.name AS president_name, u.avatar_url AS president_avatar, u.email AS president_email
         FROM clubs c
         LEFT JOIN users u ON c.president_id = u.id
         WHERE c.id = $1`,
        [clubId]
      ),
      pool.query(
        `SELECT u.id, u.name, u.email, u.avatar_url, cm.joined_at
         FROM club_members cm
         JOIN users u ON cm.user_id = u.id
         WHERE cm.club_id = $1 AND cm.role = 'president'
         ORDER BY cm.joined_at ASC`,
        [clubId]
      ),
      pool.query(
        `SELECT u.id, u.name, u.email, u.avatar_url
         FROM club_sponsors cs
         JOIN users u ON cs.user_id = u.id
         WHERE cs.club_id = $1 AND cs.status = 'active'
         ORDER BY cs.assigned_at ASC`,
        [clubId]
      ),
      safeQuery(`SELECT tag FROM club_tags WHERE club_id = $1`, [clubId]),
      pool.query(
        `SELECT * FROM (
           SELECT cm.id, cm.user_id, cm.role, cm.joined_at, u.name, u.email, u.avatar_url
           FROM club_members cm
           JOIN users u ON cm.user_id = u.id
           WHERE cm.club_id = $1
           UNION ALL
           SELECT cs.id, cs.user_id, 'sponsor'::text AS role, cs.assigned_at AS joined_at,
                  u.name, u.email, u.avatar_url
           FROM club_sponsors cs
           JOIN users u ON cs.user_id = u.id
           WHERE cs.club_id = $1 AND cs.status = 'active'
         ) combined
         ORDER BY
           CASE combined.role
             WHEN 'sponsor'        THEN 0
             WHEN 'president'      THEN 1
             WHEN 'vice_president' THEN 2
             WHEN 'officer'        THEN 3
             ELSE 4
           END,
           combined.joined_at ASC`,
        [clubId]
      ),
      safeQuery(
        `SELECT p.id, p.content, p.image_url, p.created_at,
                u.name AS author_name, u.avatar_url AS author_avatar
         FROM posts p
         JOIN users u ON p.user_id = u.id
         WHERE p.club_id = $1
         ORDER BY p.created_at DESC
         LIMIT 20`,
        [clubId]
      ),
      userId
        ? pool.query(
            `SELECT role FROM club_members WHERE club_id = $1 AND user_id = $2`,
            [clubId, userId]
          )
        : Promise.resolve({ rows: [] as any[] }),
    ])

    if (clubResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Club not found' },
        { status: 404 }
      )
    }

    const club = clubResult.rows[0]
    club.presidents = presidentsResult.rows
    club.sponsors   = sponsorsResult.rows
    club.tags       = tagsResult.rows.map((r: any) => r.tag)

    const userMembership = membershipResult.rows[0]?.role ?? null

    return NextResponse.json({
      success: true,
      data: {
        club: {
          ...club,
          member_count: membersResult.rows.length,
          is_joined:    userMembership !== null,
          memberRole:   userMembership,
        },
        members: membersResult.rows,
        posts:   postsResult.rows,
      },
    })
  } catch (error) {
    console.error('Error fetching club details:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch club details' },
      { status: 500 }
    )
  }
}
