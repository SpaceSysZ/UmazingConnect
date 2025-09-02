# SchoolConnect - Berkeley Prep School Social App

A modern social media application built specifically for Berkeley Prep School, allowing students and staff to connect, join clubs, and stay informed about campus life.

## 🚀 Features

### Current Implementation
- ✅ **Microsoft Azure Authentication** - Secure login with school accounts only
- ✅ **Domain Restriction** - Only @berkeleyprep.org emails allowed
- ✅ **Profile Creation** - Students and sponsors can create detailed profiles
- ✅ **Role-Based Access** - Different interfaces for students, sponsors, and admins
- ✅ **Modern UI** - Built with Next.js, TypeScript, and Tailwind CSS
- ✅ **Responsive Design** - Works on all devices

### Planned Features
- 🔄 **Club Management** - Create, join, and manage school clubs
- 🔄 **Social Posts** - Share updates, events, and announcements
- 🔄 **Lost & Found** - Report and claim lost items
- 🔄 **Event Management** - Create and RSVP to school events
- 🔄 **Real-time Updates** - Live notifications and messaging

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Authentication**: Microsoft Azure AD (MSAL)
- **State Management**: React Context API
- **Deployment**: Vercel (recommended)

## 📋 Prerequisites

- Node.js 18+ installed
- Microsoft Azure account (for authentication)
- Berkeley Prep School email domain access

## 🚀 Getting Started

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd school-social-app
npm install
```

### 2. Quick Start (Demo Mode)

For immediate testing without Azure setup:

```bash
# Create environment file
cp env-template.txt .env.local

# Edit .env.local and set:
NEXT_PUBLIC_DEMO_MODE=true

# Start development server
npm run dev
```

This will let you test the full interface with a demo user account.

### 3. Azure Authentication Setup (Production)

1. **Go to Azure Portal**: https://portal.azure.com
2. **Navigate to**: Azure Active Directory > App registrations
3. **Create New Registration**:
   - Name: `SchoolConnect`
   - Supported account types: `Accounts in this organizational directory only`
   - Redirect URI: Web > `http://localhost:3000`
4. **Get Client ID**: Copy the Application (client) ID
5. **Configure Permissions**: API permissions > Microsoft Graph > User.Read
6. **Create Environment File**:

```bash
# Create .env.local file
NEXT_PUBLIC_AZURE_CLIENT_ID=your-client-id-here
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔐 Authentication Flow

1. **User visits app** → Redirected to profile creation (if not logged in)
2. **Microsoft Login** → User authenticates with school Microsoft account
3. **Domain Validation** → Only @berkeleyprep.org emails are accepted
4. **Profile Creation** → User creates profile with role, grade, interests, etc.
5. **Access Granted** → User can now access all app features

## 👥 User Roles

### Student
- Can join clubs and participate in activities
- Grade level tracking
- Interest-based recommendations

### Club Sponsor
- Can create and manage club pages
- Department affiliation
- Club verification capabilities

### Administrator
- Full system access
- User management
- Content moderation

## 🏗️ Project Structure

```
school-social-app/
├── app/                    # Next.js app directory
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── login-screen.tsx  # Login interface
│   ├── profile-creation.tsx # Profile setup
│   └── navigation.tsx    # Main navigation
├── contexts/             # React contexts
│   └── auth-context.tsx  # Authentication state
├── lib/                  # Utility functions
│   └── auth-config.ts    # Azure configuration
└── public/               # Static assets
```

## 🔧 Configuration

### Environment Variables

```bash
# Required
NEXT_PUBLIC_AZURE_CLIENT_ID=your-azure-client-id

# Optional
NEXT_PUBLIC_AZURE_TENANT_ID=your-tenant-id
NEXT_PUBLIC_REDIRECT_URI=http://localhost:3000
```

### Azure App Registration Settings

- **Redirect URIs**: `http://localhost:3000` (dev), `https://yourdomain.com` (prod)
- **API Permissions**: Microsoft Graph > User.Read
- **Authentication**: Enable implicit grant for access tokens

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect Repository**: Link your GitHub repo to Vercel
2. **Environment Variables**: Add your Azure client ID
3. **Deploy**: Automatic deployment on push to main branch

### Other Platforms

- **Netlify**: Similar process, add environment variables
- **Azure Static Web Apps**: Native Azure integration
- **Self-hosted**: Build and deploy to your server

## 🔒 Security Features

- **Domain Restriction**: Only Berkeley Prep emails allowed
- **Microsoft OAuth**: Secure authentication through Azure AD
- **Role-Based Access**: Different permissions for different user types
- **Session Management**: Secure token handling and storage

## 🧪 Testing

```bash
# Build the project
npm run build

# Run linting
npm run lint

# Type checking
npx tsc --noEmit
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support or questions:
- Check the Azure configuration guide
- Review the authentication flow documentation
- Open an issue in the repository

## 🔮 Roadmap

- [ ] Backend API development
- [ ] Database integration
- [ ] Real-time features
- [ ] Mobile app
- [ ] Advanced club management
- [ ] Event calendar integration
- [ ] Push notifications
- [ ] Analytics dashboard

---

**Built with ❤️ for Berkeley Prep School**
