# Next Steps for Implementation

## Phase 1: Database Setup (CRITICAL - Do First)

### 1. Add Environment Variables
Add these to your `.env.local` file:

```env
# Migration security key
MIGRATION_KEY=your-secure-migration-key-here

# Initial coordinator emails (comma-separated)
COORDINATOR_EMAILS=your-email@berkeleyprep.org,admin2@berkeleyprep.org

# Optional: Enable features
ENABLE_REPORTING=true
ENABLE_SPONSOR_APPROVAL=true
```

### 2. Run Database Migration
Choose one method:

**Option A: Via API (Recommended)**
```bash
curl -X POST http://localhost:3000/api/admin/migrate \
  -H "Authorization: Bearer your-secure-migration-key-here"
```

**Option B: Direct SQL**
```bash
psql $DATABASE_URL -f migrations/add_admin_system_tables.sql
```

**Verify Migration:**
```sql
-- Check tables were created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_roles', 'club_sponsors', 'post_reports', 'leadership_requests', 'audit_log');

-- Check user_type column was added
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'user_type';
```

---

## Phase 2: Update User Sync (REQUIRED)

### Update User Sync API to Capture userType

The user sync API needs to capture `userType` from Azure AD. Here's what needs to be updated:

**File: `app/api/users/sync/route.ts`**

Add `userType` to the sync:

```typescript
const { id, email, name, role, grade, department, bio, profilePicture, userType } = body

// Update the INSERT query to include user_type
const result = await pool.query(
  `INSERT INTO users (id, email, name, role, grade, department, bio, avatar_url, user_type, created_at, updated_at)
   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
   ON CONFLICT (email) 
   DO UPDATE SET 
     name = EXCLUDED.name,
     role = COALESCE(EXCLUDED.role, users.role),
     grade = COALESCE(EXCLUDED.grade, users.grade),
     department = COALESCE(EXCLUDED.department, users.department),
     bio = COALESCE(EXCLUDED.bio, users.bio),
     avatar_url = COALESCE(EXCLUDED.avatar_url, users.avatar_url),
     user_type = COALESCE(EXCLUDED.user_type, users.user_type),
     updated_at = CURRENT_TIMESTAMP
   RETURNING id, email, name`,
  [id || randomUUID(), email, name, role || 'student', grade, department, bio, profilePicture, userType]
)
```

### Update Auth Context to Pass userType

**File: `contexts/auth-context.tsx`**

When syncing user to database, include userType from Azure AD token:

```typescript
// In the login/profile creation flow, extract userType from Azure AD
const userType = account.idTokenClaims?.userType || null

// Pass it to the sync API
await fetch('/api/users/sync', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    ...userData,
    userType: userType
  })
})
```

---

## Phase 3: Testing (In Order)

### 1. Test Multiple Presidents
- [ ] Claim an unclaimed club as president
- [ ] Have another user claim the same club (should become co-president)
- [ ] Verify both presidents appear in club detail page
- [ ] Verify both can manage the club
- [ ] Test promoting a member to co-president via leadership dialog
- [ ] Test removing a co-president

### 2. Test Sponsor System
- [ ] Login with a teacher account (userType = 'None')
- [ ] Claim a club as sponsor
- [ ] Verify sponsor appears in club details
- [ ] Access sponsor dashboard at `/sponsor`
- [ ] Verify sponsored clubs appear in dashboard

### 3. Test Leadership Requests
- [ ] As president, try to promote a member to officer
- [ ] Verify request appears in sponsor dashboard
- [ ] As sponsor, approve the request
- [ ] Verify member's role changed to officer
- [ ] Test rejecting a request
- [ ] Verify rejection reason is stored

### 4. Test Permissions
- [ ] Verify non-teachers cannot claim as sponsors
- [ ] Verify presidents cannot directly change leadership (must request)
- [ ] Verify sponsors can approve/reject requests
- [ ] Verify coordinators can see all requests

---

## Phase 4: UI Integration

### 1. Add Navigation Links

**For Teachers/Sponsors:**
Add link to sponsor dashboard in navigation:

```tsx
{user?.userType === 'None' && (
  <Link href="/sponsor">
    <Button variant="ghost">
      <Shield className="h-4 w-4 mr-2" />
      Sponsor Dashboard
    </Button>
  </Link>
)}
```

**For Coordinators:**
Add link to admin dashboard (Phase 5):

```tsx
{isCoordinator && (
  <Link href="/admin">
    <Button variant="ghost">
      <Settings className="h-4 w-4 mr-2" />
      Admin Dashboard
    </Button>
  </Link>
)}
```

### 2. Update Club Detail Page

Show sponsors in club detail page (similar to presidents):

```tsx
{/* Sponsors Section */}
{club.sponsors && club.sponsors.length > 0 && (
  <Card>
    <CardHeader>
      <CardTitle>Club Sponsors</CardTitle>
    </CardHeader>
    <CardContent>
      {club.sponsors.map((sponsor) => (
        <div key={sponsor.id} className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={sponsor.avatar_url} />
            <AvatarFallback>{sponsor.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{sponsor.name}</p>
            <p className="text-sm text-muted-foreground">{sponsor.email}</p>
          </div>
        </div>
      ))}
    </CardContent>
  </Card>
)}
```

### 3. Update Leadership Dialog

Modify `manage-leadership-dialog.tsx` to create requests instead of direct changes:

```tsx
const handlePromoteMember = async (memberId: string, role: string) => {
  // Check if club has sponsors
  const sponsorsResponse = await fetch(`/api/clubs/${clubId}/sponsors`)
  const sponsorsData = await sponsorsResponse.json()
  
  if (sponsorsData.data.length > 0) {
    // Create leadership request
    const response = await fetch(`/api/clubs/${clubId}/leadership/request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requestedBy: currentUserId,
        targetUserId: memberId,
        actionType: role === 'president' ? 'add_president' : 'add_officer',
        currentRole: 'member',
        newRole: role
      })
    })
    
    if (response.ok) {
      alert("Leadership change request submitted. Waiting for sponsor approval.")
    }
  } else {
    // No sponsors, apply directly (backward compatibility)
    // ... existing direct change logic
  }
}
```

---

## Phase 5: Remaining Features (Optional)

### Phase 4: Reporting System
- Post reporting functionality
- Reports queue for sponsors/coordinators
- Moderation actions (hide/delete posts)

### Phase 5: Admin Panel
- Coordinator dashboard
- Club management interface
- User management
- System analytics

### Phase 6: Polish
- Email notifications
- Performance optimization
- Security audit

---

## Quick Start Checklist

Use this checklist to get started quickly:

- [ ] Add environment variables to `.env.local`
- [ ] Run database migration
- [ ] Verify tables were created
- [ ] Update user sync API to include userType
- [ ] Update auth context to pass userType
- [ ] Test with a teacher account
- [ ] Claim a club as sponsor
- [ ] Test leadership request workflow
- [ ] Add navigation links for sponsors
- [ ] Update club detail page to show sponsors

---

## Common Issues & Solutions

### Issue: "Only verified teachers can claim clubs as sponsors"
**Solution:** Ensure userType is being captured from Azure AD and stored in database. Check:
1. Azure AD token includes userType claim
2. User sync API is saving userType
3. User record in database has user_type = 'None'

### Issue: "This club has no sponsors. Leadership changes require sponsor approval."
**Solution:** 
1. Have a teacher claim the club as sponsor first
2. Or modify the code to allow direct changes if no sponsors exist (backward compatibility)

### Issue: Migration fails
**Solution:**
1. Check database connection
2. Verify you have CREATE TABLE permissions
3. Check if tables already exist (migration is idempotent)
4. Review error logs for specific SQL errors

### Issue: Sponsor dashboard shows "Not a sponsor"
**Solution:**
1. Verify user has userType = 'None' in database
2. Check if user has claimed any clubs as sponsor
3. Verify club_sponsors table has active records

---

## Database Queries for Debugging

```sql
-- Check if user is a teacher
SELECT id, email, name, user_type FROM users WHERE email = 'teacher@berkeleyprep.org';

-- Check club sponsors
SELECT cs.*, u.name, u.email 
FROM club_sponsors cs 
JOIN users u ON cs.user_id = u.id 
WHERE cs.club_id = 'club-id-here';

-- Check pending leadership requests
SELECT lr.*, c.name as club_name, u.name as requester_name
FROM leadership_requests lr
JOIN clubs c ON lr.club_id = c.id
JOIN users u ON lr.requested_by = u.id
WHERE lr.status = 'pending';

-- Check all presidents of a club
SELECT cm.*, u.name, u.email
FROM club_members cm
JOIN users u ON cm.user_id = u.id
WHERE cm.club_id = 'club-id-here' AND cm.role = 'president';

-- Check audit log
SELECT * FROM audit_log ORDER BY created_at DESC LIMIT 20;
```

---

## Support & Documentation

- **Specs:** See `ADMIN_SYSTEM_SPECS.md` for complete specifications
- **Phase 1:** See `PHASE_1_COMPLETE.md` for foundation details
- **Phase 2:** See `PHASE_2_COMPLETE.md` for multiple presidents
- **Phase 3:** See `PHASE_3_COMPLETE.md` for sponsor system
- **Summary:** See `IMPLEMENTATION_SUMMARY.md` for overview

---

## Timeline Estimate

- **Database Setup:** 15 minutes
- **User Sync Updates:** 30 minutes
- **Testing:** 1-2 hours
- **UI Integration:** 1-2 hours
- **Total:** 3-4 hours for full implementation

---

## Success Criteria

You'll know everything is working when:
1. ✓ Teachers can claim clubs as sponsors
2. ✓ Multiple presidents can manage clubs together
3. ✓ Leadership changes require sponsor approval
4. ✓ Sponsor dashboard shows pending requests
5. ✓ Approved requests apply automatically
6. ✓ All actions are logged in audit trail
