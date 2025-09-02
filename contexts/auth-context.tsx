"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { PublicClientApplication, AccountInfo, AuthenticationResult } from "@azure/msal-browser"
import { msalConfig, loginRequest, isBerkeleyPrepEmail, UserProfile } from "@/lib/auth-config"
import { DEMO_MODE, DEMO_USER } from "@/lib/demo-mode"
import { debugMSAL } from "@/lib/debug-msal"

interface AuthContextType {
  user: UserProfile | null
  isAuthenticated: boolean
  isLoading: boolean
  hasProfile: boolean
  login: () => Promise<void>
  logout: () => void
  createProfile: (profileData: Partial<UserProfile>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Initialize MSAL
const msalInstance = new PublicClientApplication(msalConfig)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hasProfile, setHasProfile] = useState(false)

  useEffect(() => {
    // Demo mode - skip Azure authentication
    if (DEMO_MODE) {
      setUser(DEMO_USER)
      setIsAuthenticated(true)
      setHasProfile(true)
      setIsLoading(false)
      return
    }

    // Check if Azure client ID is configured
    if (!process.env.NEXT_PUBLIC_AZURE_CLIENT_ID) {
      console.error("Azure Client ID not configured. Please set NEXT_PUBLIC_AZURE_CLIENT_ID in your .env.local file")
      setIsLoading(false)
      return
    }

    // Initialize MSAL and check authentication status
    const initializeAuth = async () => {
      try {
        await msalInstance.initialize()
        
        // Check if user is already signed in
        const accounts = msalInstance.getAllAccounts()
        if (accounts.length > 0) {
          await handleAuthSuccess(accounts[0])
        } else {
          setIsLoading(false)
        }
      } catch (error) {
        console.error("Failed to initialize MSAL:", error)
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

    const handleAuthSuccess = async (account: AccountInfo) => {
    try {
      // Get user info from Microsoft Graph
      const response = await msalInstance.acquireTokenSilent({
        ...loginRequest,
        account: account,
      })

      if (response) {
        try {
          // Debug: Log account info
          debugMSAL.logAccountInfo(account)
          
          const userInfo = await getUserInfo(response.accessToken)
          
          // Check if userInfo has required properties
          if (!userInfo || !userInfo.email) {
            console.error("Failed to get user info from Microsoft Graph")
            setIsLoading(false)
            return
          }
          
          // Check if email is from Berkeley Prep
          if (!isBerkeleyPrepEmail(userInfo.email)) {
            alert("Only Berkeley Prep School email addresses are allowed to access this application.")
            logout()
            return
          }

          // Check if user profile exists in localStorage (in a real app, this would be in a database)
          const existingProfile = localStorage.getItem(`userProfile_${userInfo.email}`)
          if (existingProfile) {
            const profile = JSON.parse(existingProfile)
            setUser(profile)
            setIsAuthenticated(true)
            setHasProfile(true)
          } else {
            // User is authenticated but needs to create profile
            setIsAuthenticated(true)
            setHasProfile(false)
          }
        } catch (graphError) {
          console.error("Microsoft Graph API error:", graphError)
          
          // Fallback: try to get basic info from the account
          if (account.username) {
            console.log("Using fallback account info:", account)
            
            // Check if email is from Berkeley Prep
            if (!isBerkeleyPrepEmail(account.username)) {
              alert("Only Berkeley Prep School email addresses are allowed to access this application.")
              logout()
              return
            }

            // Check if user profile exists
            const existingProfile = localStorage.getItem(`userProfile_${account.username}`)
            if (existingProfile) {
              const profile = JSON.parse(existingProfile)
              setUser(profile)
              setIsAuthenticated(true)
              setHasProfile(true)
            } else {
              // User is authenticated but needs to create profile
              setIsAuthenticated(true)
              setHasProfile(false)
            }
          } else {
            console.error("No fallback email available")
            setIsLoading(false)
          }
        }
      }
    } catch (error) {
      console.error("Error handling auth success:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getUserInfo = async (accessToken: string) => {
    try {
      // Try to get user info with email field explicitly requested
      const response = await fetch("https://graph.microsoft.com/v1.0/me?$select=id,displayName,mail,userPrincipalName,email", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      
      if (!response.ok) {
        throw new Error(`Microsoft Graph API error: ${response.status} ${response.statusText}`)
      }
      
      const userInfo = await response.json()
      console.log("Microsoft Graph API response:", userInfo) // Debug log
      
      // Check for email in various possible fields
      const email = userInfo.mail || userInfo.email || userInfo.userPrincipalName
      
      if (!userInfo || !email) {
        console.error("User info received:", userInfo)
        throw new Error("Microsoft Graph API returned incomplete user information. Email field not found.")
      }
      
      // Return userInfo with email field normalized
      return {
        ...userInfo,
        email: email
      }
    } catch (error) {
      console.error("Error fetching user info:", error)
      throw error
    }
  }

  const login = async () => {
    try {
      setIsLoading(true)
      
      // Demo mode - simulate login
      if (DEMO_MODE) {
        setUser(DEMO_USER)
        setIsAuthenticated(true)
        setHasProfile(true)
        setIsLoading(false)
        return
      }
      
      // Ensure MSAL is initialized
      if (!msalInstance.getActiveAccount() && msalInstance.getAllAccounts().length === 0) {
        await msalInstance.initialize()
      }
      
      const response: AuthenticationResult = await msalInstance.loginPopup(loginRequest)
      if (response.account) {
        await handleAuthSuccess(response.account)
      }
    } catch (error) {
      console.error("Login error:", error)
      setIsLoading(false)
    }
  }

  const logout = () => {
    msalInstance.logout()
    setUser(null)
    setIsAuthenticated(false)
    setHasProfile(false)
    // Clear any stored profile data
    if (user?.email) {
      localStorage.removeItem(`userProfile_${user.email}`)
    }
  }

    const createProfile = async (profileData: Partial<UserProfile>) => {
    try {
      // Ensure MSAL is initialized
      if (!msalInstance.getActiveAccount() && msalInstance.getAllAccounts().length === 0) {
        await msalInstance.initialize()
      }
      
      const accounts = msalInstance.getAllAccounts()
      if (accounts.length === 0) {
        throw new Error("No authenticated user found")
      }

      const account = accounts[0]
      let email = ""
      let displayName = ""

      try {
        // Try to get user info from Microsoft Graph
        const response = await msalInstance.acquireTokenSilent({
          ...loginRequest,
          account: account,
        })

        if (response) {
          const userInfo = await getUserInfo(response.accessToken)
          email = userInfo.email
          displayName = userInfo.displayName || ""
        }
      } catch (graphError) {
        console.error("Microsoft Graph API error, using fallback:", graphError)
        // Fallback to account username
        email = account.username || ""
        displayName = account.name || ""
      }

      if (!email) {
        throw new Error("Could not retrieve user email from Microsoft Graph or account")
      }
      
      const newProfile: UserProfile = {
        id: account.localAccountId || email,
        email: email,
        name: displayName || profileData.name || "",
        role: profileData.role || "student",
        grade: profileData.grade,
        department: profileData.department,
        profilePicture: profileData.profilePicture,
        bio: profileData.bio,
        interests: profileData.interests || [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      // Store profile in localStorage (in a real app, this would be in a database)
      localStorage.setItem(`userProfile_${newProfile.email}`, JSON.stringify(newProfile))
      
      setUser(newProfile)
      setIsAuthenticated(true)
      setHasProfile(true)
    } catch (error) {
      console.error("Error creating profile:", error)
      throw error
    }
  }

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    hasProfile,
    login,
    logout,
    createProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
