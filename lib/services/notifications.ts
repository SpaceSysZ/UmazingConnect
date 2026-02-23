import pool from '@/lib/db'
import { sendPushToUser, PushPayload } from './push'

interface CreateNotificationOptions {
  userId: string
  clubId?: string
  postId?: string
  type: 'new_post' | 'club_update' | 'leadership_request' | 'membership_approved'
  title: string
  body: string
}

export async function createNotification(options: CreateNotificationOptions) {
  const { userId, clubId, postId, type, title, body } = options

  try {
    const result = await pool.query(
      `INSERT INTO notifications (user_id, club_id, post_id, type, title, body)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, clubId || null, postId || null, type, title, body]
    )

    return result.rows[0]
  } catch (error) {
    console.error('Error creating notification:', error)
    throw error
  }
}

export async function createNotificationsForClubMembers(
  clubId: string,
  postId: string,
  type: 'new_post' | 'club_update',
  title: string,
  body: string,
  excludeUserId?: string
) {
  try {
    // Single JOIN query: get all members whose push notifications are enabled.
    // COALESCE to TRUE because no row in notification_preferences means default-enabled.
    const params: any[] = [clubId]
    let memberQuery = `
      SELECT cm.user_id
      FROM club_members cm
      LEFT JOIN notification_preferences np ON np.user_id = cm.user_id
      WHERE cm.club_id = $1
        AND COALESCE(np.push_enabled, TRUE) = TRUE
    `
    if (excludeUserId) {
      memberQuery += ` AND cm.user_id != $2`
      params.push(excludeUserId)
    }

    const membersResult = await pool.query(memberQuery, params)
    if (membersResult.rows.length === 0) return []

    const userIds: string[] = membersResult.rows.map((r: any) => r.user_id)

    // Batch INSERT all notifications in one query using unnest.
    // This replaces the N individual INSERT calls in the old loop.
    const batchResult = await pool.query(
      `INSERT INTO notifications (user_id, club_id, post_id, type, title, body)
       SELECT unnest($1::uuid[]), $2, $3, $4, $5, $6
       RETURNING *`,
      [userIds, clubId, postId, type, title, body]
    )

    const notifications = batchResult.rows

    // Fire push notifications non-blocking — intentionally not awaited.
    const pushPayload: PushPayload = {
      title,
      body,
      url: `/clubs/${clubId}`,
      clubId,
      postId,
      tag: `club-${clubId}-post`,
      notificationId: '',
    }
    for (const notification of notifications) {
      sendPushToUser(notification.user_id, { ...pushPayload, notificationId: notification.id })
        .catch((err) => {
          console.error('Push notification failed for user:', notification.user_id, err)
        })
    }

    return notifications
  } catch (error) {
    console.error('Error creating notifications for club members:', error)
    throw error
  }
}

export async function createNotificationsForAllFollowingClub(
  clubId: string,
  postId: string,
  type: 'new_post' | 'club_update',
  title: string,
  body: string,
  excludeUserId?: string
) {
  try {
    return createNotificationsForClubMembers(clubId, postId, type, title, body, excludeUserId)
  } catch (error) {
    console.error('Error creating notifications:', error)
    throw error
  }
}

// Get subscriptions for a user to send push notifications
export async function getUserPushSubscriptions(userId: string) {
  try {
    const result = await pool.query(
      'SELECT endpoint, p256dh_key, auth_key FROM push_subscriptions WHERE user_id = $1',
      [userId]
    )

    return result.rows.map((row) => ({
      endpoint: row.endpoint,
      keys: {
        p256dh: row.p256dh_key,
        auth: row.auth_key,
      },
    }))
  } catch (error) {
    console.error('Error fetching push subscriptions:', error)
    return []
  }
}
