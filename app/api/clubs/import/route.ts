import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

// POST /api/clubs/import - Bulk import clubs (admin only in production)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const clubs = body.clubs

    if (!Array.isArray(clubs) || clubs.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Clubs array is required' },
        { status: 400 }
      )
    }

    const results = []
    const errors = []

    for (const club of clubs) {
      try {
        // Validate required fields
        if (!club.name || !club.description || !club.category) {
          errors.push({
            club: club.name || 'Unknown',
            error: 'Missing required fields: name, description, category',
          })
          continue
        }

        // Check if club already exists
        const existing = await pool.query('SELECT id FROM clubs WHERE name = $1', [club.name])
        if (existing.rows.length > 0) {
          errors.push({
            club: club.name,
            error: 'Club already exists',
          })
          continue
        }

        // Insert club
        const insertQuery = `
          INSERT INTO clubs (name, description, category, image_url, meeting_time, location, is_claimed)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING id, name
        `
        const result = await pool.query(insertQuery, [
          club.name,
          club.description,
          club.category,
          club.imageUrl || null,
          club.meetingTime || null,
          club.location || null,
          false,
        ])

        const newClub = result.rows[0]

        // Add tags if provided
        if (club.tags && Array.isArray(club.tags)) {
          for (const tag of club.tags) {
            await pool.query(
              'INSERT INTO club_tags (club_id, tag) VALUES ($1, $2) ON CONFLICT DO NOTHING',
              [newClub.id, tag]
            )
          }
        }

        results.push(newClub)
      } catch (error: any) {
        errors.push({
          club: club.name || 'Unknown',
          error: error.message,
        })
      }
    }

    return NextResponse.json({
      success: true,
      imported: results.length,
      errors: errors.length,
      results,
      errorDetails: errors,
    })
  } catch (error) {
    console.error('Error importing clubs:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to import clubs' },
      { status: 500 }
    )
  }
}

