# Azure AD App Setup Guide

## 🔍 Finding Your Azure AD App

### Step 1: Access Azure Portal

1. Go to: **https://portal.azure.com**
2. Sign in with your school Microsoft account (admin account)

### Step 2: Navigate to Azure AD

**Option A: Direct Link**
- Go to: **https://portal.azure.com/#view/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/~/Overview**

**Option B: Search**
1. In the Azure Portal search bar (top), type: **"Azure Active Directory"** or **"Microsoft Entra ID"**
2. Click on the result

**Option C: Menu Navigation**
1. Click the hamburger menu (☰) on the left
2. Click **"Azure Active Directory"** or **"Microsoft Entra ID"**

### Step 3: Find App Registrations

1. In the left sidebar, click **"App registrations"**
2. You'll see a list of all registered apps

### Step 4: Locate Your App

Look for an app named something like:
- "SchoolConnect"
- "Berkeley Prep School App"
- Or any app you created for this project

**If you don't see your app:**
- Click **"All applications"** tab (not just "Owned applications")
- Use the search box to search for your app name

---

## 🆕 If You Don't Have an App Yet

### Create a New App Registration

1. **In App registrations page, click "New registration"**

2. **Fill in the details:**
   ```
   Name: SchoolConnect
   Supported account types: 
     ☑ Accounts in this organizational directory only (Single tenant)
   Redirect URI: 
     Platform: Single-page application (SPA)
     URI: http://localhost:3000
   ```

3. **Click "Register"**

4. **You'll see your app's Overview page with:**
   - Application (client) ID
   - Directory (tenant) ID

---

## ⚙️ Configure Your App

### 1. Get Your Client ID and Tenant ID

On the **Overview** page, copy:

```
Application (client) ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
Directory (tenant) ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### 2. Add Redirect URIs

1. Click **"Authentication"** in the left sidebar

2. Under **"Platform configurations"**, find **"Single-page application"**

3. Click **"Add URI"** and add these URLs:

   ```
   http://localhost:3000
   http://localhost:3000/auth/callback
   ```

4. **For mobile testing with ngrok** (when you use it):
   ```
   https://your-ngrok-url.ngrok-free.app
   https://your-ngrok-url.ngrok-free.app/auth/callback
   ```

5. **For production** (when you deploy):
   ```
   https://schoolconnect.berkeleyprep.org
   https://schoolconnect.berkeleyprep.org/auth/callback
   ```

6. **Scroll down and enable:**
   - ☑ Access tokens (used for implicit flows)
   - ☑ ID tokens (used for implicit and hybrid flows)

7. Click **"Save"** at the bottom

### 3. Configure API Permissions

1. Click **"API permissions"** in the left sidebar

2. You should see **"Microsoft Graph"** with some permissions

3. Click **"Add a permission"**

4. Click **"Microsoft Graph"** → **"Delegated permissions"**

5. Search for and add these permissions:
   - ☑ User.Read
   - ☑ User.ReadBasic.All
   - ☑ email
   - ☑ profile
   - ☑ openid

6. Click **"Add permissions"**

7. **Important:** Click **"Grant admin consent for [Your Organization]"**
   - This requires admin privileges
   - Click "Yes" to confirm

---

## 🔑 Update Your .env.local File

On your laptop, create or update `.env.local`:

```bash
# Azure AD Configuration
NEXT_PUBLIC_AZURE_CLIENT_ID=your-client-id-here
NEXT_PUBLIC_AZURE_TENANT_ID=your-tenant-id-here

# Database (if not already set)
DATABASE_URL=your-database-url

# Demo Mode (for testing without auth)
NEXT_PUBLIC_DEMO_MODE=false
```

**Replace:**
- `your-client-id-here` with your Application (client) ID
- `your-tenant-id-here` with your Directory (tenant) ID

**Then restart your dev server:**
```bash
npm run dev
```

---

## 🧪 Testing Authentication

### Test on Desktop (Localhost)

1. Open: `http://localhost:3000`
2. Click "Continue with Microsoft"
3. Sign in with your school account
4. Should work! ✅

### Test on Mobile (with ngrok)

1. **Start ngrok:**
   ```bash
   ngrok http 3000
   ```

2. **Copy the HTTPS URL** (e.g., `https://abc123.ngrok-free.app`)

3. **Add to Azure AD redirect URIs** (see step 2 above)

4. **Access from phone** using the ngrok URL

5. **Should work!** ✅

---

## 🎯 Quick Reference

### Azure Portal URLs

| Page | URL |
|------|-----|
| **Azure Portal** | https://portal.azure.com |
| **Azure AD** | https://portal.azure.com/#view/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade |
| **App Registrations** | https://portal.azure.com/#view/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/~/RegisteredApps |

### Navigation Path

```
Azure Portal
  └─ Azure Active Directory (or Microsoft Entra ID)
      └─ App registrations
          └─ Your App
              ├─ Overview (get Client ID & Tenant ID)
              ├─ Authentication (add redirect URIs)
              └─ API permissions (configure permissions)
```

---

## 🔒 Security Best Practices

### Redirect URIs

**Development:**
- ✅ `http://localhost:3000`
- ✅ `https://your-ngrok-url.ngrok-free.app`

**Production:**
- ✅ `https://schoolconnect.berkeleyprep.org`
- ❌ Never use `http://` in production
- ❌ Never use wildcard URIs

### Permissions

**Required:**
- User.Read (basic profile)
- email (user's email)
- profile (user's name)
- openid (authentication)

**Optional:**
- User.ReadBasic.All (read other users' basic info)

---

## 🐛 Troubleshooting

### "AADSTS50011: The redirect URI specified in the request does not match"

**Fix:** Add the exact URL to redirect URIs in Azure AD

### "AADSTS65001: The user or administrator has not consented"

**Fix:** Grant admin consent in API permissions

### "AADSTS700016: Application not found"

**Fix:** Check your Client ID in `.env.local` matches Azure

### Can't find your app?

1. Check "All applications" tab (not just "Owned applications")
2. Ask your IT admin if they created it
3. Create a new app registration

---

## 📞 Need Help?

### Contact Your School IT Admin

They can:
- Create the app registration for you
- Grant admin consent
- Provide Client ID and Tenant ID
- Add redirect URIs

### What to Ask For

"I need an Azure AD app registration for SchoolConnect with:
- Single-page application (SPA) platform
- Redirect URIs for localhost and production
- Microsoft Graph permissions: User.Read, email, profile, openid
- Admin consent granted"

---

## ✅ Checklist

Before testing authentication:

- [ ] Found or created Azure AD app
- [ ] Copied Client ID to `.env.local`
- [ ] Copied Tenant ID to `.env.local`
- [ ] Added redirect URIs (localhost)
- [ ] Configured API permissions
- [ ] Granted admin consent
- [ ] Restarted dev server
- [ ] Tested on localhost

---

## 🚀 For Production Launch

When deploying to production:

1. **Get your production domain** (e.g., `schoolconnect.berkeleyprep.org`)

2. **Add production redirect URIs** in Azure AD:
   ```
   https://schoolconnect.berkeleyprep.org
   https://schoolconnect.berkeleyprep.org/auth/callback
   ```

3. **Update environment variables** in Vercel/hosting platform

4. **Test authentication** on production URL

5. **Remove development URIs** (optional, for security)

---

**Good luck! You've got this! 🎉**
