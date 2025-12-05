import { NextRequest, NextResponse } from "next/server"
import { isTeacherEmail } from "@/lib/teacher-verification"

// GET /api/users/check-teacher - Check if email is a verified teacher
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email required" },
        { status: 400 }
      )
    }

    const isTeacher = isTeacherEmail(email)

    return NextResponse.json({
      success: true,
      isTeacher,
      email: email.toLowerCase(),
    })
  } catch (error) {
    console.error("Error checking teacher status:", error)
    return NextResponse.json(
      { success: false, error: "Failed to check teacher status" },
      { status: 500 }
    )
  }
}
