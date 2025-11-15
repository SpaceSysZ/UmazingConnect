import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

// DELETE /api/posts/[id] - Delete a post (author or club leadership only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 400 }
      )
    }

    // Get post details
    const postQuery = 'SELECT club_id, user_id FROM posts WHERE id = $1'
    const postResult = await pool.query(postQuery, [postId])

    if (postResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      )
    }

    const post = postResult.rows[0]

    // Check if user is the post author
    const isAuthor = post.user_id === userId

    // Check if user is club leadership (president, vice_president, or officer)
    const leadershipQuery = `
      SELECT role FROM club_members 
      WHERE club_id = $1 AND user_id = $2 
      AND role IN ('president', 'vice_president', 'officer')
    `
    const leadershipResult = await pool.query(leadershipQuery, [post.club_id, userId])
    const isLeadership = leadershipResult.rows.length > 0

    // User must be either the author or club leadership
    if (!isAuthor && !isLeadership) {
      return NextResponse.json(
        { success: false, error: 'Only the post author or club leadership can delete this post' },
        { status: 403 }
      )
    }

    // Delete the post
    await pool.query('DELETE FROM posts WHERE id = $1', [postId])

    return NextResponse.json({
      success: true,
      message: 'Post deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting post:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete post' },
      { status: 500 }
    )
  }
}
