import { Configuration, PopupRequest } from "@azure/msal-browser"

// MSAL configuration
export const msalConfig: Configuration = {
  auth: {
    clientId: process.env.NEXT_PUBLIC_AZURE_CLIENT_ID || "", // You'll need to get this from Azure Portal
    authority: "https://login.microsoftonline.com/common", // Use "common" for multi-tenant
    redirectUri: typeof window !== "undefined" ? window.location.origin : "",
  },
  cache: {
    cacheLocation: "sessionStorage", // This configures where your cache will be stored
    storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
  },
}

// Add scopes here for ID token to be used at Microsoft identity platform endpoints.
export const loginRequest: PopupRequest = {
  scopes: ["User.Read", "User.ReadBasic.All", "email", "profile", "openid"],
}

// Berkeley Prep School domain validation
export const ALLOWED_DOMAINS = [
  "berkeleyprep.org",
  "berkeleyprep.com",
  // Add any other official Berkeley Prep domains here
]

export const isBerkeleyPrepEmail = (email: string | undefined | null): boolean => {
  if (!email || typeof email !== 'string') {
    return false
  }
  const domain = email.split("@")[1]?.toLowerCase()
  return ALLOWED_DOMAINS.includes(domain || "")
}

// Profile creation requirements
export interface UserProfile {
  id: string
  email: string
  name: string
  role: "student" | "sponsor" | "admin"
  grade?: string // For students
  department?: string // For sponsors
  profilePicture?: string
  bio?: string
  interests?: string[]
  createdAt: Date
  updatedAt: Date
}
