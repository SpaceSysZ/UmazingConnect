import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET() {
  try {
    // Check if DATABASE_URL exists
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        success: false,
        error: 'DATABASE_URL environment variable is not set',
        hasEnvVar: false
      })
    }

    // Try to connect
    const client = await pool.connect()
    
    // Test query
    const result = await client.query('SELECT NOW() as time, version() as version')
    
    // Check if users table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'users'
      ) as users_exists
    `)
    
    client.release()

    return NextResponse.json({
      success: true,
      hasEnvVar: true,
      connected: true,
      serverTime: result.rows[0].time,
      postgresVersion: result.rows[0].version,
      usersTableExists: tableCheck.rows[0].users_exists,
      message: 'Database connection successful!'
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      hasEnvVar: !!process.env.DATABASE_URL,
      connected: false,
      error: error.message,
      errorCode: error.code,
      errorDetail: error.detail
    }, { status: 500 })
  }
}
