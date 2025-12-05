// Teacher email verification using curated list
import teacherData from './teacher-emails.json'

/**
 * Check if an email belongs to a verified teacher
 * Uses a curated list of teacher emails from teacher-emails.json
 */
export function isTeacherEmail(email: string): boolean {
  if (!email) return false
  return teacherData.teacherEmails.includes(email.toLowerCase())
}

/**
 * Get the total count of verified teachers
 */
export function getTeacherCount(): number {
  return teacherData.teacherEmails.length
}

/**
 * Check if multiple emails are teachers (batch check)
 */
export function areTeacherEmails(emails: string[]): boolean[] {
  return emails.map(email => isTeacherEmail(email))
}
