import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

// GET /api/clubs - Get clubs with optional filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category  = searchParams.get('category')
    const isClaimed = searchParams.get('isClaimed')
    const userId    = searchParams.get('userId')
    const page      = Math.max(1, parseInt(searchParams.get('page')  || '1'))
    const limit     = Math.min(200, Math.max(1, parseInt(searchParams.get('limit') || '100')))
    const offset    = (page - 1) * limit

    const conditions: string[] = []
    const params: any[] = []
    let paramCount = 1

    if (category && category !== 'all') {
      conditions.push(`c.category = $${paramCount++}`)
      params.push(category)
    }

    if (isClaimed !== null) {
      conditions.push(`c.is_claimed = $${paramCount++}`)
      params.push(isClaimed === 'true')
    }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : ''

    // LATERAL join for tags: computed once per club in a single scan of
    // club_tags rather than as a correlated subquery executed per row.
    const clubQuery = `
      SELECT
        c.id, c.name, c.description, c.category, c.image_url,
        c.meeting_time, c.location, c.is_claimed, c.president_id,
        c.created_at, c.updated_at,
        u.name       AS president_name,
        u.avatar_url AS president_avatar,
        u.email      AS president_email,
        COUNT(DISTINCT cm.id)::int AS member_count,
        COALESCE(t.tags, '[]'::json) AS tags
      FROM clubs c
      LEFT JOIN users u ON c.president_id = u.id
      LEFT JOIN club_members cm ON c.id = cm.club_id
      LEFT JOIN LATERAL (
        SELECT json_agg(tag ORDER BY tag) AS tags
        FROM club_tags
        WHERE club_id = c.id
      ) t ON TRUE
      ${whereClause}
      GROUP BY c.id, u.id, t.tags
      ORDER BY c.created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `
    params.push(limit, offset)

    if (userId && userId !== 'demo-user-123') {
      // Run the clubs query and both membership lookups in parallel.
      const [clubsResult, memberships, sponsorships] = await Promise.all([
        pool.query(clubQuery, params),
        pool.query(
          `SELECT club_id, role FROM club_members WHERE user_id = $1`,
          [userId]
        ),
        pool.query(
          `SELECT club_id FROM club_sponsors WHERE user_id = $1 AND status = 'active'`,
          [userId]
        ),
      ])

      const membershipMap  = new Map(memberships.rows.map((m: any) => [m.club_id, m.role]))
      const sponsorshipSet = new Set(sponsorships.rows.map((s: any) => s.club_id))

      const clubs = clubsResult.rows.map((club: any) => {
        const isSponsor = sponsorshipSet.has(club.id)
        const isMember  = membershipMap.has(club.id)
        return {
          ...club,
          is_joined:  isMember || isSponsor,
          memberRole: isSponsor ? 'sponsor' : (membershipMap.get(club.id) ?? null),
        }
      })

      return NextResponse.json({ success: true, data: clubs, count: clubs.length, page, limit })
    }

    const result = await pool.query(clubQuery, params)
    return NextResponse.json({ success: true, data: result.rows, count: result.rows.length, page, limit })
  } catch (error) {
    console.error('Error fetching clubs:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch clubs' },
      { status: 500 }
    )
  }
}

// POST /api/clubs - Create a new club (admin only or for bulk import)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.name || !body.description || !body.category) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, description, category' },
        { status: 400 }
      )
    }

    const validCategories = ['academic', 'arts', 'sports', 'technology', 'service', 'hobby']
    if (!validCategories.includes(body.category)) {
      return NextResponse.json(
        { success: false, error: 'Invalid category' },
        { status: 400 }
      )
    }

    const existing = await pool.query('SELECT id FROM clubs WHERE name = $1', [body.name])
    if (existing.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Club with this name already exists' },
        { status: 409 }
      )
    }

    const insertQuery = `
      INSERT INTO clubs (name, description, category, image_url, meeting_time, location, is_claimed)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `
    const result = await pool.query(insertQuery, [
      body.name,
      body.description,
      body.category,
      body.imageUrl    || null,
      body.meetingTime || null,
      body.location    || null,
      false,
    ])

    const club = result.rows[0]

    if (body.tags && Array.isArray(body.tags) && body.tags.length > 0) {
      const tagInserts = body.tags.map((tag: string) =>
        pool.query(
          'INSERT INTO club_tags (club_id, tag) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [club.id, tag]
        )
      )
      await Promise.all(tagInserts)
    }

    return NextResponse.json({ success: true, data: club }, { status: 201 })
  } catch (error) {
    console.error('Error creating club:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create club' },
      { status: 500 }
    )
  }
}
