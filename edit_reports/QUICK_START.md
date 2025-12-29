# Quick Start Guide

## 🚀 Get Started in 5 Steps

### Step 1: Environment Setup (2 min)
Add to `.env.local`:
```env
MIGRATION_KEY=your-secure-key
COORDINATOR_EMAILS=your-email@berkeleyprep.org
```

### Step 2: Run Migration (1 min)
```bash
curl -X POST http://localhost:3000/api/admin/migrate \
  -H "Authorization: Bearer your-secure-key"
```

### Step 3: Verify (1 min)
Check tables exist:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('user_roles', 'club_sponsors', 'leadership_requests');
```

### Step 4: Test Multiple Presidents (5 min)
1. Login as student
2. Claim an unclaimed club
3. Login as another student
4. Claim the same club (becomes co-president)
5. Verify both appear in club detail page

### Step 5: Test Sponsor System (5 min)
1. Login with teacher account (userType = 'None')
2. Click "Claim as Sponsor" on any club
3. Visit `/sponsor` to see dashboard
4. As president, promote a member
5. As sponsor, approve the request

---

## ✅ What's Working Now

- ✓ Multiple presidents per club
- ✓ Sponsor claiming (teachers only)
- ✓ Leadership request workflow
- ✓ Sponsor dashboard
- ✓ Approval/rejection system
- ✓ Audit logging
- ✓ Role-based permissions

---

## 📋 Testing Checklist

**Multiple Presidents:**
- [ ] Claim club as first president
- [ ] Another user claims as co-president
- [ ] Both can manage club
- [ ] Can promote members to co-president
- [ ] Can remove other co-presidents

**Sponsor System:**
- [ ] Teacher can claim as sponsor
- [ ] Non-teacher cannot claim as sponsor
- [ ] Sponsor dashboard shows clubs
- [ ] Pending requests appear
- [ ] Can approve requests
- [ ] Can reject requests

**Permissions:**
- [ ] Presidents can create requests
- [ ] Sponsors can approve/reject
- [ ] Changes apply automatically
- [ ] Audit log tracks actions

---

## 🐛 Troubleshooting

**"Only verified teachers can claim"**
→ Check user has `user_type = 'None'` in database

**"No sponsors" error**
→ Have a teacher claim the club as sponsor first

**Migration fails**
→ Check database connection and permissions

**Sponsor dashboard empty**
→ Claim a club as sponsor first

---

## 📊 Database Quick Checks

```sql
-- Check if user is teacher
SELECT email, user_type FROM users WHERE email = 'teacher@email.com';

-- Check club sponsors
SELECT * FROM club_sponsors WHERE club_id = 'club-id';

-- Check pending requests
SELECT * FROM leadership_requests WHERE status = 'pending';

-- Check presidents
SELECT * FROM club_members WHERE role = 'president' AND club_id = 'club-id';
```

---

## 🎯 Next Features (Optional)

**Phase 4: Reporting**
- Post reporting
- Moderation queue
- Hide/delete posts

**Phase 5: Admin Panel**
- Coordinator dashboard
- Club management
- User management
- Analytics

---

## 📚 Documentation

- `NEXT_STEPS.md` - Detailed implementation guide
- `ADMIN_SYSTEM_SPECS.md` - Complete specifications
- `IMPLEMENTATION_SUMMARY.md` - Overview of all changes
- `PHASE_1_COMPLETE.md` - Foundation details
- `PHASE_2_COMPLETE.md` - Multiple presidents
- `PHASE_3_COMPLETE.md` - Sponsor system

---

## 💡 Key Concepts

**Multiple Presidents:**
- Clubs can have unlimited co-presidents
- All have equal permissions
- Stored in `club_members` with role='president'

**Sponsors:**
- Teachers verified by userType = 'None'
- Oversight role, not management
- Approve leadership changes
- Multiple sponsors per club

**Leadership Requests:**
- Presidents request changes
- Sponsors approve/reject
- Changes apply automatically
- All logged in audit trail

---

## ⏱️ Time Estimate

- Setup: 5 minutes
- Testing: 15 minutes
- Total: 20 minutes to fully operational

---

## ✨ Success!

You'll know it's working when:
1. Multiple presidents can manage clubs
2. Teachers can claim as sponsors
3. Leadership changes require approval
4. Sponsor dashboard shows requests
5. Approved changes apply instantly
