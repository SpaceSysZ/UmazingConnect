// Role and permission management utilities

import { db } from "@/lib/db"

export type UserRole = "coordinator" | "sponsor" | "president" | "officer" | "member"

export interface RoleCheck {
  isCoordinator: boolean
  isSponsor: boolean
  isPresident: boolean
  isOfficer: boolean
  sponsoredClubIds: string[]
  presidentClubIds: string[]
}

/**
 * Get comprehensive role information for a user
 */
export async function getUserRoles(userId: string): Promise<RoleCheck> {
  try {
    // Check if user is a coordinator
    const coordinatorCheck = await db.query(
      `SELECT id FROM user_roles WHERE user_id = $1 AND role = 'coordinator' LIMIT 1`,
      [userId]
    )
    const isCoordinator = coordinatorCheck.rows.length > 0

    // Get clubs where user is a sponsor
    const sponsorCheck = await db.query(
      `SELECT club_id FROM club_sponsors WHERE user_id = $1 AND status = 'active'`,
      [userId]
    )
    const sponsoredClubIds = sponsorCheck.rows.map((row) => row.club_id)
    const isSponsor = sponsoredClubIds.length > 0

    // Get clubs where user is a president
    const presidentCheck = await db.query(
      `SELECT club_id FROM club_members WHERE user_id = $1 AND role = 'president'`,
      [userId]
    )
    const presidentClubIds = presidentCheck.rows.map((row) => row.club_id)
    const isPresident = presidentClubIds.length > 0

    // Check if user is an officer in any club
    const officerCheck = await db.query(
      `SELECT id FROM club_members WHERE user_id = $1 AND role IN ('officer', 'leader') LIMIT 1`,
      [userId]
    )
    const isOfficer = officerCheck.rows.length > 0

    return {
      isCoordinator,
      isSponsor,
      sponsoredClubIds,
      isPresident,
      presidentClubIds,
      isOfficer,
    }
  } catch (error) {
    console.error("Error getting user roles:", error)
    return {
      isCoordinator: false,
      isSponsor: false,
      sponsoredClubIds: [],
      isPresident: false,
      presidentClubIds: [],
      isOfficer: false,
    }
  }
}

/**
 * Check if user is a coordinator
 */
export async function isCoordinator(userId: string): Promise<boolean> {
  try {
    const result = await db.query(
      `SELECT id FROM user_roles WHERE user_id = $1 AND role = 'coordinator' LIMIT 1`,
      [userId]
    )
    return result.rows.length > 0
  } catch (error) {
    console.error("Error checking coordinator status:", error)
    return false
  }
}

/**
 * Check if user is a sponsor of a specific club
 */
export async function isSponsorOfClub(userId: string, clubId: string): Promise<boolean> {
  try {
    const result = await db.query(
      `SELECT id FROM club_sponsors WHERE user_id = $1 AND club_id = $2 AND status = 'active' LIMIT 1`,
      [userId, clubId]
    )
    return result.rows.length > 0
  } catch (error) {
    console.error("Error checking sponsor status:", error)
    return false
  }
}

/**
 * Check if user is a president of a specific club
 */
export async function isPresidentOfClub(userId: string, clubId: string): Promise<boolean> {
  try {
    const result = await db.query(
      `SELECT id FROM club_members WHERE user_id = $1 AND club_id = $2 AND role = 'president' LIMIT 1`,
      [userId, clubId]
    )
    return result.rows.length > 0
  } catch (error) {
    console.error("Error checking president status:", error)
    return false
  }
}

/**
 * Check if user can moderate a specific club (coordinator or sponsor)
 */
export async function canModerateClub(userId: string, clubId: string): Promise<boolean> {
  const roles = await getUserRoles(userId)
  return roles.isCoordinator || roles.sponsoredClubIds.includes(clubId)
}

/**
 * Check if user can manage leadership in a club (coordinator, sponsor, or president)
 */
export async function canManageLeadership(userId: string, clubId: string): Promise<boolean> {
  const roles = await getUserRoles(userId)
  return (
    roles.isCoordinator ||
    roles.sponsoredClubIds.includes(clubId) ||
    roles.presidentClubIds.includes(clubId)
  )
}

/**
 * Check if user is a teacher/sponsor (based on user_type from Azure AD)
 */
export async function isTeacher(userId: string): Promise<boolean> {
  try {
    const result = await db.query(
      `SELECT user_type FROM users WHERE id = $1 LIMIT 1`,
      [userId]
    )
    // Teachers have user_type = 'None' in Azure AD
    return result.rows.length > 0 && result.rows[0].user_type === "None"
  } catch (error) {
    console.error("Error checking teacher status:", error)
    return false
  }
}

/**
 * Check if user email is in the coordinator list (from env)
 */
export function isCoordinatorEmail(email: string): boolean {
  const coordinatorEmails = process.env.COORDINATOR_EMAILS?.split(",").map((e) => e.trim().toLowerCase()) || []
  return coordinatorEmails.includes(email.toLowerCase())
}

/**
 * Get all presidents of a club
 */
export async function getClubPresidents(clubId: string): Promise<string[]> {
  try {
    const result = await db.query(
      `SELECT user_id FROM club_members WHERE club_id = $1 AND role = 'president'`,
      [clubId]
    )
    return result.rows.map((row) => row.user_id)
  } catch (error) {
    console.error("Error getting club presidents:", error)
    return []
  }
}

/**
 * Get all sponsors of a club
 */
export async function getClubSponsors(clubId: string): Promise<string[]> {
  try {
    const result = await db.query(
      `SELECT user_id FROM club_sponsors WHERE club_id = $1 AND status = 'active'`,
      [clubId]
    )
    return result.rows.map((row) => row.user_id)
  } catch (error) {
    console.error("Error getting club sponsors:", error)
    return []
  }
}
