import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { Pool } from 'pg'
import * as schema from './schema'
import { getDatabaseConfig, logPoolStats, HEALTH_CHECK_QUERY, RETRY_CONFIG } from './config'

// Legacy postgres-js client for backward compatibility
const connectionString = process.env.DATABASE_URL!

console.log('DATABASE_URL:', connectionString)

// Create postgres-js client (for legacy compatibility)
const postgresClient = postgres(connectionString)
export const legacyDb = drizzle(postgresClient, { schema })

// Create PostgreSQL connection pool with environment-specific configuration
let pool: Pool | null = null

if (process.env.DATABASE_URL) {
  pool = new Pool(getDatabaseConfig())

  // Handle pool events for monitoring
  pool.on('connect', (client) => {
    console.log('New client connected to the database pool')
  })

  pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err)
    // Don't exit the process, just log the error
  })

  // Graceful shutdown handling
  process.on('SIGINT', async () => {
    console.log('Received SIGINT, closing database pool...')
    if (pool) await pool.end()
    console.log('Database pool closed')
    process.exit(0)
  })

  process.on('SIGTERM', async () => {
    console.log('Received SIGTERM, closing database pool...')
    if (pool) await pool.end()
    console.log('Database pool closed')
    process.exit(0)
  })
} else {
  console.warn('DATABASE_URL not set - database operations will not be available')
}

// Export pool (will be null if DATABASE_URL is not set)
export { pool }

// Test the connection pool with retry logic
export const testConnection = async (): Promise<boolean> => {
  if (!pool) {
    console.error('Database pool not initialized - DATABASE_URL not set')
    return false
  }

  let lastError: Error | null = null

  for (let attempt = 1; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
    try {
      const client = await pool.connect()
      await client.query(HEALTH_CHECK_QUERY)
      client.release()
      console.log(`Database connection pool test successful (attempt ${attempt})`)
      return true
    } catch (error) {
      lastError = error as Error
      console.warn(`Database connection test failed (attempt ${attempt}/${RETRY_CONFIG.maxRetries}):`, error)

      if (attempt < RETRY_CONFIG.maxRetries) {
        const delay = RETRY_CONFIG.retryDelay * Math.pow(RETRY_CONFIG.retryBackoff, attempt - 1)
        console.log(`Retrying in ${delay}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  console.error('Database connection pool test failed after all retries:', lastError)
  return false
}

// Get pool statistics with optional logging
export const getPoolStats = (log: boolean = false) => {
  if (!pool) {
    return { totalCount: 0, idleCount: 0, waitingCount: 0 }
  }

  const stats = {
    totalCount: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount,
  }

  if (log) {
    logPoolStats(pool)
  }

  return stats
}

// Export the pool for direct usage if needed
export { pool as dbPool }

// For Drizzle ORM with connection pooling, we'll still use postgres-js for now
// as Drizzle has better integration with postgres-js, but we can use the pool
// for raw queries when needed
export const db = legacyDb

export * from './schema'
