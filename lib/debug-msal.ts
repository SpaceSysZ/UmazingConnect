// Debug utility for MSAL and Microsoft Graph API troubleshooting

export const debugMSAL = {
  // Log all available account information
  logAccountInfo: (account: any) => {
    console.log("=== MSAL Account Debug Info ===")
    console.log("Account object:", account)
    console.log("Username:", account.username)
    console.log("Name:", account.name)
    console.log("Local Account ID:", account.localAccountId)
    console.log("Environment:", account.environment)
    console.log("Tenant ID:", account.tenantId)
    console.log("Home Account ID:", account.homeAccountId)
    console.log("================================")
  },

  // Log Microsoft Graph API response
  logGraphResponse: (response: any) => {
    console.log("=== Microsoft Graph API Response ===")
    console.log("Full response:", response)
    console.log("Available fields:", Object.keys(response))
    console.log("Email fields:")
    console.log("  - mail:", response.mail)
    console.log("  - email:", response.email)
    console.log("  - userPrincipalName:", response.userPrincipalName)
    console.log("  - id:", response.id)
    console.log("  - displayName:", response.displayName)
    console.log("================================")
  },

  // Test Microsoft Graph API with different endpoints
  testGraphEndpoints: async (accessToken: string) => {
    const endpoints = [
      "https://graph.microsoft.com/v1.0/me",
      "https://graph.microsoft.com/v1.0/me?$select=id,displayName,mail,userPrincipalName",
      "https://graph.microsoft.com/v1.0/me?$select=*",
      "https://graph.microsoft.com/v1.0/users/me"
    ]

    for (const endpoint of endpoints) {
      try {
        console.log(`Testing endpoint: ${endpoint}`)
        const response = await fetch(endpoint, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        
        if (response.ok) {
          const data = await response.json()
          console.log(`✅ ${endpoint}:`, data)
        } else {
          console.log(`❌ ${endpoint}: ${response.status} ${response.statusText}`)
        }
      } catch (error) {
        console.log(`❌ ${endpoint}: Error:`, error)
      }
    }
  }
}
