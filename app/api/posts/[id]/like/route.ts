import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

// POST /api/posts/[id]/like - Like or unlike a post
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const postId = params.id
    const body = await request.json()
    const userId = body.userId

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 400 }
      )
    }

    // Check if already liked
    const likeCheck = await pool.query(
      'SELECT id FROM post_likes WHERE post_id = $1 AND user_id = $2',
      [postId, userId]
    )

    if (likeCheck.rows.length > 0) {
      // Unlike
      await pool.query(
        'DELETE FROM post_likes WHERE post_id = $1 AND user_id = $2',
        [postId, userId]
      )
      await pool.query(
        'UPDATE club_posts SET likes_count = GREATEST(0, likes_count - 1) WHERE id = $1',
        [postId]
      )

      return NextResponse.json({
        success: true,
        liked: false,
        message: 'Post unliked',
      })
    } else {
      // Like
      await pool.query(
        'INSERT INTO post_likes (post_id, user_id) VALUES ($1, $2)',
        [postId, userId]
      )
      await pool.query(
        'UPDATE club_posts SET likes_count = likes_count + 1 WHERE id = $1',
        [postId]
      )

      return NextResponse.json({
        success: true,
        liked: true,
        message: 'Post liked',
      })
    }
  } catch (error) {
    console.error('Error toggling like:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to toggle like' },
      { status: 500 }
    )
  }
}

