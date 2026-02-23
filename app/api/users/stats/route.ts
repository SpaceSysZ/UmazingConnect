import { NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { getUserRoles } from "@/lib/auth/roles"

// GET /api/users/stats - Get user statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID required" },
        { status: 400 }
      )
    }

    // Run all queries in parallel.
    // The three club_members COUNTs are collapsed into one query using
    // conditional aggregation so we make a single round trip instead of three.
    const [memberStats, sponsorResult, postsResult, likesResult, roles] = await Promise.all([
      pool.query(
        `SELECT
          COUNT(*)::int                                                      AS clubs_joined,
          COUNT(*) FILTER (WHERE role = 'president')::int                   AS clubs_president_of,
          COUNT(*) FILTER (WHERE role IN ('officer', 'vice_president'))::int AS clubs_officer_of
         FROM club_members
         WHERE user_id = $1`,
        [userId]
      ),
      pool.query(
        `SELECT COUNT(*)::int AS count FROM club_sponsors WHERE user_id = $1 AND status = 'active'`,
        [userId]
      ),
      pool.query(
        `SELECT COUNT(*)::int AS count FROM posts WHERE user_id = $1`,
        [userId]
      ),
      pool.query(
        `SELECT COUNT(*)::int AS count FROM post_likes WHERE user_id = $1`,
        [userId]
      ),
      getUserRoles(userId),
    ])

    const stats = memberStats.rows[0]

    return NextResponse.json({
      success: true,
      data: {
        clubsJoined:      stats.clubs_joined,
        clubsPresidentOf: stats.clubs_president_of,
        clubsOfficerOf:   stats.clubs_officer_of,
        clubsSponsoring:  sponsorResult.rows[0].count,
        postsCreated:     postsResult.rows[0].count,
        postsLiked:       likesResult.rows[0].count,
        isCoordinator:    roles.isCoordinator,
        isSponsor:        roles.isSponsor,
        isPresident:      roles.isPresident,
        isOfficer:        roles.isOfficer,
      },
    })
  } catch (error) {
    console.error("Error fetching user stats:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch user stats" },
      { status: 500 }
    )
  }
}
