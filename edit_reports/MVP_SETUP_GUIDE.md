# MVP Setup Guide - Clubs Platform

## 🎯 Overview

Your MVP is now fully integrated with the database! This guide will help you set up the database and start using the platform.

## 📋 Database Setup

### 1. Run the Database Schema

```bash
# Connect to your PostgreSQL database
psql -h localhost -U postgres -d school_social_app -f database/clubs-schema.sql

# Or if using Docker
docker exec -i school-app-db psql -U postgres -d school_social_app < database/clubs-schema.sql
```

### 2. Verify Database Connection

Make sure your `.env.local` has:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/school_social_app"
```

## 🏗️ Database Schema

The schema includes:
- **users** - User profiles (extended from original)
- **clubs** - All school clubs
- **club_members** - Membership tracking
- **club_posts** - Posts from clubs
- **post_likes** - Like tracking
- **club_tags** - Tags for clubs
- **presidency_transfers** - Audit log for presidency transfers

## 🚀 Features Implemented

### ✅ Core Features
1. **User Authentication** - Azure AD login with profile creation
2. **Club Management** - View all clubs, joined clubs, unclaimed clubs
3. **Claim Clubs** - Students can claim unclaimed clubs
4. **Join/Leave Clubs** - Members can join or leave clubs
5. **Club Posts** - Members can post on behalf of their clubs
6. **Image Upload** - Posts can include images
7. **Like Posts** - Users can like club posts
8. **Presidency Transfer** - Presidents can transfer ownership
9. **Admin Import** - Bulk import clubs via JSON

### 🔐 Persistence
- All data is now stored in PostgreSQL
- Club memberships persist across sessions
- Posts are stored in the database
- Images are stored in `public/uploads/`

## 📝 Adding Clubs to the System

### Option 1: Admin Interface (Recommended)

1. **Set your user role to admin** (update in database or during profile creation)
2. **Navigate to Clubs page**
3. **Click "Show Admin" button** (only visible to admins)
4. **Use the Bulk Import interface**

### Option 2: JSON Format

The admin interface expects JSON in this format:

```json
[
  {
    "name": "Chess Club",
    "description": "Sharpen your strategic thinking! Weekly tournaments, lessons for beginners, and preparation for competitions.",
    "category": "hobby",
    "meetingTime": "Wednesdays, 3:30 PM",
    "location": "Library",
    "imageUrl": "/placeholder.svg?key=chess",
    "tags": ["Strategy", "Competition", "Logic"]
  },
  {
    "name": "Photography Club",
    "description": "Capture the world through your lens! Learn techniques, share your work, and participate in photo walks.",
    "category": "arts",
    "meetingTime": "Thursdays, 3:45 PM",
    "location": "Art Room",
    "imageUrl": "/placeholder.svg?key=photo",
    "tags": ["Visual Arts", "Creative", "Digital"]
  }
]
```

### Category Options
- `academic`
- `arts`
- `sports`
- `technology`
- `service`
- `hobby`

### Required Fields
- `name` - Club name (must be unique)
- `description` - Club description
- `category` - One of the categories above

### Optional Fields
- `meetingTime` - Meeting schedule
- `location` - Meeting location
- `imageUrl` - Club image URL
- `tags` - Array of tag strings

## 🔄 API Endpoints

### Clubs
- `GET /api/clubs` - List all clubs (with optional `?userId=` and filters)
- `GET /api/clubs/[id]` - Get specific club
- `POST /api/clubs` - Create club (admin/bulk import)
- `POST /api/clubs/import` - Bulk import clubs
- `POST /api/clubs/[id]/claim` - Claim an unclaimed club
- `POST /api/clubs/[id]/join` - Join a club
- `DELETE /api/clubs/[id]/join?userId=` - Leave a club
- `POST /api/clubs/[id]/transfer` - Transfer presidency

### Posts
- `GET /api/clubs/[id]/posts` - Get posts for a club
- `POST /api/clubs/[id]/posts` - Create a post (members only)
- `POST /api/posts/[id]/like` - Like/unlike a post

### Upload
- `POST /api/upload` - Upload image file

## 👥 User Workflow

1. **Login** - User logs in with Azure AD
2. **Create Profile** - User creates their profile
3. **Browse Clubs** - User can view all clubs, filter by category
4. **Claim/Join** - User can claim unclaimed clubs or join existing ones
5. **Post** - Members can post on behalf of their clubs
6. **View Feed** - Home feed shows all club posts

## 🔧 Presidency Transfer

Presidents can transfer ownership to another member:

1. **Go to Clubs page**
2. **Find a club you're president of**
3. **Click the transfer icon** (cog icon)
4. **Enter the user ID** of the new president
5. **Transfer ownership**

The transfer is logged in the `presidency_transfers` table for audit purposes.

## 🖼️ Image Upload

Club posts support image uploads:

1. **Create a post** (must be a club member)
2. **Click "Click to upload image"**
3. **Select an image** (max 5MB)
4. **Preview the image**
5. **Submit post**

Images are stored in `public/uploads/` and can be accessed via `/uploads/filename.jpg`

## 📊 Admin Features

Admins can:
- Bulk import clubs via JSON
- View all clubs
- Manage club data

To make a user an admin, update their role in the database:
```sql
UPDATE users SET role = 'admin' WHERE email = 'user@example.com';
```

## 🐛 Troubleshooting

### Database Connection Issues
- Check `.env.local` has correct `DATABASE_URL`
- Verify PostgreSQL is running
- Check database exists: `school_social_app`

### Import Errors
- Check JSON format is valid
- Ensure club names are unique
- Verify category values are correct

### Permission Errors
- Verify user is member before posting
- Check user is president before transferring
- Ensure admin role for bulk import

## 🚀 Next Steps

1. **Run database schema** - Set up the database tables
2. **Import clubs** - Use admin interface to add all school clubs
3. **Test workflows** - Claim clubs, join, post
4. **Customize** - Update club images, descriptions as needed

## 📝 Notes

- All club posts appear in the home feed
- Only club members can post
- Presidents can transfer ownership
- Unclaimed clubs can be claimed by any user
- Image uploads are limited to 5MB

Your MVP is now production-ready with full database persistence! 🎉

