-- Lost and Found Database Schema
-- This schema supports the lost and found feature with image storage

-- Users table (if not already exists)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Lost and Found Items table
CREATE TABLE IF NOT EXISTS lost_found_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('electronics', 'clothing', 'books', 'accessories', 'keys', 'other')),
    type VARCHAR(10) NOT NULL CHECK (type IN ('lost', 'found')),
    location VARCHAR(255) NOT NULL,
    date_reported TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    contact_name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(20),
    image_url VARCHAR(500),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'claimed', 'expired')),
    reporter_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_lost_found_items_category ON lost_found_items(category);
CREATE INDEX IF NOT EXISTS idx_lost_found_items_type ON lost_found_items(type);
CREATE INDEX IF NOT EXISTS idx_lost_found_items_status ON lost_found_items(status);
CREATE INDEX IF NOT EXISTS idx_lost_found_items_date_reported ON lost_found_items(date_reported);
CREATE INDEX IF NOT EXISTS idx_lost_found_items_location ON lost_found_items(location);

-- Full-text search index for title and description
CREATE INDEX IF NOT EXISTS idx_lost_found_items_search ON lost_found_items USING gin(to_tsvector('english', title || ' ' || description));

-- Comments table for item discussions (optional feature)
CREATE TABLE IF NOT EXISTS item_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES lost_found_items(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for comments
CREATE INDEX IF NOT EXISTS idx_item_comments_item_id ON item_comments(item_id);
CREATE INDEX IF NOT EXISTS idx_item_comments_created_at ON item_comments(created_at);

-- Sample data (optional - for testing)
INSERT INTO users (email, name, avatar_url) VALUES 
    ('sarah.j@school.edu', 'Sarah Johnson', '/placeholder.svg?key=sarah2'),
    ('mike.c@school.edu', 'Mike Chen', '/placeholder.svg?key=mike'),
    ('emma.w@school.edu', 'Emma Wilson', '/placeholder.svg?key=emma2'),
    ('alex.r@school.edu', 'Alex Rodriguez', '/placeholder.svg?key=alex2'),
    ('jordan.s@school.edu', 'Jordan Smith', '/placeholder.svg?key=jordan2')
ON CONFLICT (email) DO NOTHING;

-- Sample lost and found items
INSERT INTO lost_found_items (title, description, category, type, location, contact_name, contact_email, contact_phone, status, reporter_id) VALUES 
    ('Black iPhone 14', 'Black iPhone 14 with a clear case. Has a small crack on the bottom left corner. Last seen in the cafeteria during lunch.', 'electronics', 'lost', 'Cafeteria', 'Sarah Johnson', 'sarah.j@school.edu', '(555) 123-4567', 'active', (SELECT id FROM users WHERE email = 'sarah.j@school.edu')),
    ('Blue Nike Backpack', 'Found a blue Nike backpack in the gym locker room. Contains some textbooks and a water bottle.', 'accessories', 'found', 'Gym Locker Room', 'Mike Chen', 'mike.c@school.edu', NULL, 'active', (SELECT id FROM users WHERE email = 'mike.c@school.edu')),
    ('Chemistry Textbook', 'Lost my chemistry textbook ''Principles of Chemistry'' by Atkins. Has my name written inside the front cover.', 'books', 'lost', 'Science Building', 'Emma Wilson', 'emma.w@school.edu', NULL, 'active', (SELECT id FROM users WHERE email = 'emma.w@school.edu')),
    ('Set of Car Keys', 'Found a set of car keys with a Honda keychain and a small flashlight attached. Found near the parking lot.', 'keys', 'found', 'Student Parking Lot', 'Alex Rodriguez', 'alex.r@school.edu', NULL, 'active', (SELECT id FROM users WHERE email = 'alex.r@school.edu')),
    ('Red Hoodie', 'Lost my red hoodie with ''State University'' printed on the front. Size medium. Very sentimental value.', 'clothing', 'lost', 'Library', 'Jordan Smith', 'jordan.s@school.edu', NULL, 'claimed', (SELECT id FROM users WHERE email = 'jordan.s@school.edu'))
ON CONFLICT DO NOTHING;
