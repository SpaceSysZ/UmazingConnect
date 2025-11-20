# SchoolConnect - Quick Start Guide

## 🚀 Get Your MVP Live in 30 Minutes

### Step 1: Install Security Dependency (2 minutes)

```bash
npm install isomorphic-dompurify
```

### Step 2: Set Up Database (5 minutes)

```bash
# Run migrations in order
psql $DATABASE_URL -f database/clubs-schema.sql
psql $DATABASE_URL -f database/add-posts-and-tags.sql
psql $DATABASE_URL -f database/performance-indexes.sql
```

### Step 3: Configure Environment (3 minutes)

Create `.env.local`:

```env
DATABASE_URL=your_postgres_connection_string
NEXT_PUBLIC_AZURE_CLIENT_ID=your_azure_client_id
NEXT_PUBLIC_AZURE_TENANT_ID=your_tenant_id
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Step 4: Deploy to Vercel (10 minutes)

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

Then in Vercel Dashboard:
1. Go to Settings → Environment Variables
2. Add all variables from `.env.local`
3. Redeploy

### Step 5: Configure Azure AD (5 minutes)

1. Go to Azure Portal → App Registrations
2. Add redirect URI: `https://your-domain.com`
3. Add redirect URI: `https://your-domain.com/auth/callback`
4. Save

### Step 6: Test Everything (5 minutes)

- [ ] Visit your site
- [ ] Test login with Microsoft
- [ ] Create a profile
- [ ] Browse clubs
- [ ] Join a club
- [ ] Create a post

## ✅ You're Live!

### Next Steps:

1. **Invite Beta Testers** (20-50 users)
2. **Monitor for Issues** (check Vercel dashboard)
3. **Gather Feedback** (create feedback form)
4. **Plan Week 2** (based on feedback)

### Support Resources:

- **Full Deployment Guide**: See `DEPLOYMENT.md`
- **Security Info**: See `SECURITY.md`
- **Readiness Report**: See `MVP-READINESS-REPORT.md`

### Common Issues:

**Issue**: Authentication not working  
**Fix**: Check Azure AD redirect URIs match your domain

**Issue**: Database connection error  
**Fix**: Verify `DATABASE_URL` in Vercel environment variables

**Issue**: Posts not loading  
**Fix**: Run database migrations and indexes

### Monitoring:

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Error Logs**: Vercel → Your Project → Logs
- **Analytics**: Vercel → Your Project → Analytics

### Emergency Rollback:

```bash
vercel rollback
```

---

## 🎉 Congratulations!

Your SchoolConnect MVP is now live and ready to serve your school community!

**Estimated Users Supported**: 500-2000  
**Estimated Cost**: $0-1/month (first 3 months)  
**Performance**: <2 second page loads  
**Security**: Production-grade  

---

**Questions?** Check the full documentation or create an issue on GitHub.
