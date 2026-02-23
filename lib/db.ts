import { Pool } from 'pg'

// Database connection pool.
//
// In production (Vercel serverless) each Lambda instance gets its own pool.
// Many instances run concurrently, so a large max here multiplies across all
// instances and exhausts Postgres / Supabase connection limits quickly.
// Keep max small (2-5) and rely on Supabase PgBouncer (transaction mode,
// port 6543) to multiplex at the infrastructure level.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: process.env.NODE_ENV === 'production' ? 3 : 20,
  idleTimeoutMillis: 10000,        // Release idle clients faster in serverless
  connectionTimeoutMillis: 5000,   // Give a little more time under high concurrency
})

// Test database connection
export async function testConnection() {
  try {
    const client = await pool.connect()
    const result = await client.query('SELECT NOW()')
    client.release()
    console.log('Database connected successfully:', result.rows[0])
    return true
  } catch (error) {
    console.error('Database connection failed:', error)
    return false
  }
}

// Query helper function
export async function query(text: string, params?: any[]) {
  try {
    return await pool.query(text, params)
  } catch (error) {
    console.error('Query error:', error)
    throw error
  }
}

// Transaction helper
export async function transaction(callback: (client: any) => Promise<any>) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await callback(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export const db = {
  query,
  transaction,
  pool,
}

export default pool
