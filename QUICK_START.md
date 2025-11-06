# Quick Start Guide

## Prerequisites

1. **Docker Desktop** - Download and install from [docker.com](https://www.docker.com/products/docker-desktop/)
2. **Node.js 18+** - Download from [nodejs.org](https://nodejs.org/)

## Setup Steps

### 1. Start Docker Desktop
- Open Docker Desktop application
- Wait for it to fully start (green icon in system tray)

### 2. Run Setup Script
```powershell
# In PowerShell (as Administrator recommended)
.\scripts\setup.ps1
```

### 3. Manual Setup (if script fails)
```bash
# 1. Create environment file
copy env-template.txt .env.local

# 2. Start database
docker-compose up -d postgres

# 3. Install dependencies
npm install --legacy-peer-deps

# 4. Create uploads directory
mkdir public\uploads
```

### 4. Start Development Server
```bash
npm run dev
```

### 5. Access the Application
- **App**: http://localhost:3000
- **Database Admin**: http://localhost:8080 (admin@school.com / admin)

## Troubleshooting

### Docker Issues
- **Error**: "Docker is not running"
  - **Solution**: Start Docker Desktop and wait for it to fully load

### Database Connection Issues
- **Error**: "Database connection failed"
  - **Solution**: Wait a few minutes for PostgreSQL to fully start, then try again

### npm Dependency Issues
- **Error**: "ERESOLVE could not resolve"
  - **Solution**: Use `npm install --legacy-peer-deps` instead

### File Upload Issues
- **Error**: "Upload directory not found"
  - **Solution**: Create the directory manually: `mkdir public\uploads`

## Testing the Lost & Found Feature

1. Navigate to the Lost & Found section
2. Click "Report Lost/Found Item"
3. Fill out the form and upload a photo
4. Submit the item
5. Verify the item appears in the list with the uploaded image

## Next Steps

- Review `BACKEND_SETUP.md` for production deployment
- Check `LOST_FOUND_FEATURE.md` for feature details
- Customize the database schema in `database/schema.sql`

## Getting Help

If you encounter issues:
1. Check Docker Desktop is running
2. Verify all environment variables in `.env.local`
3. Check the database is accessible at localhost:5432
4. Review the console logs for specific error messages

