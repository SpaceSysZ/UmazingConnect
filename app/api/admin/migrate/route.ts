import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { readFileSync } from "fs"
import { join } from "path"

export async function POST(request: NextRequest) {
  try {
    // Security: Only allow in development or with special key
    const authHeader = request.headers.get("authorization")
    const migrationKey = process.env.MIGRATION_KEY || "dev-migration-key"
    
    if (authHeader !== `Bearer ${migrationKey}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Read and execute migration SQL
    const migrationPath = join(process.cwd(), "migrations", "add_admin_system_tables.sql")
    const migrationSQL = readFileSync(migrationPath, "utf-8")

    // Split by semicolon and execute each statement
    const statements = migrationSQL
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"))

    for (const statement of statements) {
      try {
        await db.query(statement)
      } catch (error: any) {
        // Log but continue if table already exists
        if (!error.message?.includes("already exists")) {
          console.error("Migration statement error:", error)
          throw error
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Migration completed successfully",
      statementsExecuted: statements.length,
    })
  } catch (error: any) {
    console.error("Migration error:", error)
    return NextResponse.json(
      { error: "Migration failed", details: error.message },
      { status: 500 }
    )
  }
}
