-- Performance Optimization Indexes for SchoolConnect
-- Run this to improve query performance

-- ============================================
-- CLUB POSTS INDEXES
-- ============================================

-- Index for fetching posts ordered by date (most common query)
CREATE INDEX IF NOT EXISTS idx_club_posts_created_at 
ON club_posts(created_at DESC);

-- Index for fetching posts by club
CREATE INDEX IF NOT EXISTS idx_club_posts_club_id 
ON club_posts(club_id);

-- Index for fetching posts by author
CREATE INDEX IF NOT EXISTS idx_club_posts_author_id 
ON club_posts(author_id);

-- Composite index for club posts with date ordering
CREATE INDEX IF NOT EXISTS idx_club_posts_club_created 
ON club_posts(club_id, created_at DESC);

-- ============================================
-- POST LIKES INDEXES
-- ============================================

-- Index for checking if user liked a post
CREATE INDEX IF NOT EXISTS idx_post_likes_user_post 
ON post_likes(user_id, post_id);

-- Index for counting likes per post
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id 
ON post_likes(post_id);

-- ============================================
-- CLUB MEMBERS INDEXES
-- ============================================

-- Index for checking club membership
CREATE INDEX IF NOT EXISTS idx_club_members_club_user 
ON club_members(club_id, user_id);

-- Index for finding user's clubs
CREATE INDEX IF NOT EXISTS idx_club_members_user_id 
ON club_members(user_id);

-- Index for finding club leaders
CREATE INDEX IF NOT EXISTS idx_club_members_role 
ON club_members(club_id, role);

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
-- ANALYZE TABLES
-- ============================================

-- Update statistics for query planner
ANALYZE club_posts;
ANALYZE post_likes;
ANALYZE club_members;
ANALYZE clubs;
ANALYZE club_tags;
ANALYZE users;

-- ============================================
-- VERIFY INDEXES
-- ============================================

-- Check all indexes on club_posts table
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename IN ('club_posts', 'post_likes', 'club_members', 'clubs', 'club_tags', 'users')
ORDER BY tablename, indexname;
