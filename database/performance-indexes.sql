-- Performance Optimization Indexes for SchoolConnect
-- Run this to improve query performance

-- ============================================
-- POSTS INDEXES
-- ============================================

-- Index for fetching posts ordered by date (most common query)
CREATE INDEX IF NOT EXISTS idx_posts_created_at 
ON posts(created_at DESC);

-- Index for fetching posts by club
CREATE INDEX IF NOT EXISTS idx_posts_club_id 
ON posts(club_id);

-- Index for fetching posts by user
CREATE INDEX IF NOT EXISTS idx_posts_user_id 
ON posts(user_id);

-- Composite index for club posts with date ordering
CREATE INDEX IF NOT EXISTS idx_posts_club_created 
ON posts(club_id, created_at DESC);

-- ============================================
-- CLUB MEMBERS INDEXES
-- ============================================

-- Index for checking club membership
CREATE INDEX IF NOT EXISTS idx_club_members_club_user
ON club_members(club_id, user_id);

-- Index for finding user's clubs
CREATE INDEX IF NOT EXISTS idx_club_members_user_id
ON club_members(user_id);

-- Index for finding club leaders by club
CREATE INDEX IF NOT EXISTS idx_club_members_role
ON club_members(club_id, role);

-- Compound index for user + role lookups (used heavily in getUserRoles,
-- /api/users/stats, and anywhere we check president / officer status by user).
CREATE INDEX IF NOT EXISTS idx_club_members_user_role
ON club_members(user_id, role);

-- ============================================
-- CLUBS INDEXES
-- ============================================

-- Index for filtering claimed/unclaimed clubs
CREATE INDEX IF NOT EXISTS idx_clubs_is_claimed 
ON clubs(is_claimed);

-- Index for filtering by category
CREATE INDEX IF NOT EXISTS idx_clubs_category 
ON clubs(category);

-- Index for president lookup
CREATE INDEX IF NOT EXISTS idx_clubs_president_id 
ON clubs(president_id);

-- ============================================
-- CLUB TAGS INDEXES
-- ============================================

-- Index for searching clubs by tag
CREATE INDEX IF NOT EXISTS idx_club_tags_tag 
ON club_tags(tag);

-- Index for getting all tags for a club
CREATE INDEX IF NOT EXISTS idx_club_tags_club_id 
ON club_tags(club_id);

-- ============================================
-- USERS INDEXES
-- ============================================

-- Index for email lookup (if not already unique)
CREATE INDEX IF NOT EXISTS idx_users_email 
ON users(email);

-- Index for role-based queries
CREATE INDEX IF NOT EXISTS idx_users_role 
ON users(role);

-- ============================================
-- NOTIFICATIONS INDEXES
-- ============================================

-- Existing single-column indexes (may already exist from clubs-schema.sql)
CREATE INDEX IF NOT EXISTS idx_notifications_user_id
ON notifications(user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_created_at
ON notifications(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_is_read
ON notifications(is_read);

-- Compound covering index for the most common notification query pattern:
--   WHERE user_id = ? AND is_read = FALSE ORDER BY created_at DESC
-- The planner can satisfy this entirely from the index without a heap fetch.
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread_created
ON notifications(user_id, is_read, created_at DESC);

-- ============================================
-- CLUB SPONSORS INDEXES
-- ============================================

-- Compound index for the user + status pattern used in getUserRoles and stats
CREATE INDEX IF NOT EXISTS idx_club_sponsors_user_status
ON club_sponsors(user_id, status);

-- ============================================
-- ANALYZE TABLES
-- ============================================

-- Update statistics for query planner
ANALYZE posts;
ANALYZE club_members;
ANALYZE clubs;
ANALYZE club_tags;
ANALYZE users;
ANALYZE notifications;
ANALYZE club_sponsors;

-- ============================================
-- VERIFY INDEXES
-- ============================================

-- Check all indexes on tables
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename IN ('posts', 'club_members', 'clubs', 'club_tags', 'users', 'notifications', 'club_sponsors')
ORDER BY tablename, indexname;
