# Backend and Database Setup Guide

This guide will help you set up a complete backend infrastructure for your school social app's lost and found feature.

## 🚀 Quick Start Options

### Option 1: Local Development (Recommended for Learning)
- **Database**: PostgreSQL with Docker
- **File Storage**: Local filesystem
- **Deployment**: Vercel/Netlify

### Option 2: Production Ready
- **Database**: Supabase, PlanetScale, or Railway
- **File Storage**: Cloudinary, AWS S3, or Vercel Blob
- **Deployment**: Vercel with external services

---

## 📋 Prerequisites

- Node.js 18+ installed
- Git installed
- Docker Desktop (for local database)
- A code editor (VS Code recommended)

---

## 🗄️ Database Setup

### Option A: PostgreSQL with Docker (Local Development)

1. **Install Docker Desktop**
   - Download from [docker.com](https://www.docker.com/products/docker-desktop/)
   - Start Docker Desktop

2. **Run PostgreSQL Container**
   ```bash
   # Create a docker-compose.yml file in your project root
   docker-compose up -d
   ```

   Create `docker-compose.yml`:
   ```yaml
   version: '3.8'
   services:
     postgres:
       image: postgres:15
       container_name: school-app-db
       environment:
         POSTGRES_DB: school_social_app
         POSTGRES_USER: postgres
         POSTGRES_PASSWORD: password
       ports:
         - "5432:5432"
       volumes:
         - postgres_data:/var/lib/postgresql/data
   
   volumes:
     postgres_data:
   ```

3. **Connect to Database**
   ```bash
   # Install database client (optional)
   npm install -g pg-cli
   
   # Connect to database
   psql -h localhost -U postgres -d school_social_app
   ```

4. **Run Schema**
   ```bash
   # Execute the schema file
   psql -h localhost -U postgres -d school_social_app -f database/schema.sql
   ```

### Option B: Supabase (Cloud Database)

1. **Create Supabase Account**
   - Go to [supabase.com](https://supabase.com)
   - Sign up and create a new project

2. **Get Connection Details**
   - Go to Settings → Database
   - Copy the connection string

3. **Set Environment Variables**
   ```bash
   # Create .env.local file
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
   ```

4. **Run Schema in Supabase**
   - Go to SQL Editor in Supabase dashboard
   - Copy and paste the contents of `database/schema.sql`
   - Execute the script

### Option C: PlanetScale (MySQL)

1. **Create PlanetScale Account**
   - Go to [planetscale.com](https://planetscale.com)
   - Create a new database

2. **Get Connection String**
   - Copy the connection string from your database

3. **Update Schema for MySQL**
   - Modify `database/schema.sql` for MySQL syntax
   - Use `AUTO_INCREMENT` instead of `SERIAL`
   - Use `DATETIME` instead of `TIMESTAMP WITH TIME ZONE`

---

## 🔧 Backend Configuration

### 1. Install Dependencies

```bash
# Install database client
npm install pg @types/pg

# OR if using Prisma
npm install prisma @prisma/client
npx prisma generate

# For file uploads
npm install multer @types/multer

# For environment variables
npm install dotenv
```

### 2. Environment Variables

Create `.env.local`:
```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/school_social_app"

# File Upload (for local development)
UPLOAD_DIR="./public/uploads"
MAX_FILE_SIZE=5242880

# For production with cloud storage
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Or for AWS S3
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="your-bucket-name"
```

### 3. Database Connection

Create `lib/db.ts`:
```typescript
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

export default pool
```

### 4. Update API Routes

Replace the mock data in your API routes with actual database queries:

```typescript
// app/api/lost-found/route.ts
import pool from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const type = searchParams.get('type')
    const search = searchParams.get('search')
    const status = searchParams.get('status') || 'active'

    let query = `
      SELECT lf.*, u.name as reporter_name, u.avatar_url as reporter_avatar
      FROM lost_found_items lf
      LEFT JOIN users u ON lf.reporter_id = u.id
      WHERE lf.status = $1
    `
    const params = [status]

    if (category && category !== 'all') {
      query += ` AND lf.category = $${params.length + 1}`
      params.push(category)
    }

    if (type && type !== 'all') {
      query += ` AND lf.type = $${params.length + 1}`
      params.push(type)
    }

    if (search) {
      query += ` AND (lf.title ILIKE $${params.length + 1} OR lf.description ILIKE $${params.length + 1} OR lf.location ILIKE $${params.length + 1})`
      params.push(`%${search}%`)
    }

    query += ` ORDER BY lf.date_reported DESC`

    const result = await pool.query(query, params)
    
    return NextResponse.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { success: false, error: 'Database error' },
      { status: 500 }
    )
  }
}
```

---

## 📁 File Storage Setup

### Option A: Local File Storage (Development)

The current implementation saves files to `public/uploads/`. This works for development but not for production.

### Option B: Cloudinary (Recommended)

1. **Create Cloudinary Account**
   - Go to [cloudinary.com](https://cloudinary.com)
   - Sign up and get your credentials

2. **Install Cloudinary**
   ```bash
   npm install cloudinary
   ```

3. **Update Upload Route**
   ```typescript
   // app/api/upload/route.ts
   import { v2 as cloudinary } from 'cloudinary'

   cloudinary.config({
     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
     api_key: process.env.CLOUDINARY_API_KEY,
     api_secret: process.env.CLOUDINARY_API_SECRET,
   })

   export async function POST(request: NextRequest) {
     try {
       const formData = await request.formData()
       const file = formData.get('file') as File

       if (!file) {
         return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 })
       }

       const bytes = await file.arrayBuffer()
       const buffer = Buffer.from(bytes)

       const result = await new Promise((resolve, reject) => {
         cloudinary.uploader.upload_stream(
           {
             resource_type: 'auto',
             folder: 'lost-found',
             transformation: [
               { width: 800, height: 600, crop: 'limit' },
               { quality: 'auto' }
             ]
           },
           (error, result) => {
             if (error) reject(error)
             else resolve(result)
           }
         ).end(buffer)
       })

       return NextResponse.json({
         success: true,
         data: {
           url: result.secure_url,
           public_id: result.public_id
         }
       })
     } catch (error) {
       return NextResponse.json({ success: false, error: 'Upload failed' }, { status: 500 })
     }
   }
   ```

### Option C: Vercel Blob Storage

1. **Install Vercel Blob**
   ```bash
   npm install @vercel/blob
   ```

2. **Update Upload Route**
   ```typescript
   import { put } from '@vercel/blob'

   export async function POST(request: NextRequest) {
     try {
       const formData = await request.formData()
       const file = formData.get('file') as File

       const blob = await put(file.name, file, {
         access: 'public',
       })

       return NextResponse.json({
         success: true,
         data: { url: blob.url }
       })
     } catch (error) {
       return NextResponse.json({ success: false, error: 'Upload failed' }, { status: 500 })
     }
   }
   ```

---

## 🚀 Deployment

### Deploy to Vercel

1. **Connect to Vercel**
   ```bash
   npm install -g vercel
   vercel login
   vercel
   ```

2. **Set Environment Variables**
   - Go to your Vercel dashboard
   - Add all environment variables from `.env.local`

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Database Migration for Production

1. **Run Schema on Production Database**
   ```bash
   # Connect to production database
   psql $DATABASE_URL -f database/schema.sql
   ```

2. **Or use Prisma Migrate**
   ```bash
   npx prisma migrate deploy
   ```

---

## 🔒 Security Considerations

1. **Input Validation**
   - Validate all user inputs
   - Sanitize file uploads
   - Use parameterized queries

2. **Authentication**
   - Implement user authentication
   - Add rate limiting
   - Validate user permissions

3. **File Upload Security**
   - Validate file types
   - Limit file sizes
   - Scan for malware (in production)

4. **Database Security**
   - Use connection pooling
   - Implement proper indexing
   - Regular backups

---

## 📊 Monitoring and Maintenance

1. **Database Monitoring**
   - Monitor query performance
   - Set up alerts for slow queries
   - Regular maintenance tasks

2. **File Storage Monitoring**
   - Monitor storage usage
   - Implement cleanup policies
   - Backup important files

3. **Application Monitoring**
   - Use Vercel Analytics
   - Set up error tracking (Sentry)
   - Monitor API response times

---

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Check connection string
   - Verify database is running
   - Check firewall settings

2. **File Upload Issues**
   - Check file size limits
   - Verify upload directory permissions
   - Check cloud storage credentials

3. **API Route Errors**
   - Check environment variables
   - Verify database schema
   - Check CORS settings

### Getting Help

- Check the [Next.js documentation](https://nextjs.org/docs)
- Review [PostgreSQL documentation](https://www.postgresql.org/docs/)
- Join the [Vercel community](https://vercel.com/community)

---

## 🎯 Next Steps

1. **Implement Authentication**
   - Add user login/signup
   - Implement session management
   - Add user profiles

2. **Add Advanced Features**
   - Email notifications
   - Item matching algorithms
   - Admin dashboard

3. **Optimize Performance**
   - Implement caching
   - Add database indexes
   - Optimize image loading

4. **Add Testing**
   - Unit tests for API routes
   - Integration tests
   - End-to-end tests

This setup provides a solid foundation for your lost and found feature. Choose the options that best fit your needs and budget!
