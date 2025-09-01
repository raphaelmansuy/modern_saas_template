import { PoolConfig } from 'pg'

// Database configuration for different environments
export const getDatabaseConfig = (): PoolConfig => {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is required')
  }

  // Base configuration
  const baseConfig: PoolConfig = {
    connectionString,
    // SSL configuration
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  }

  // Environment-specific overrides
  const envConfig: Partial<PoolConfig> = {}

  if (process.env.NODE_ENV === 'production') {
    envConfig.max = parseInt(process.env.DB_POOL_MAX || '50') // Higher for production
    envConfig.min = parseInt(process.env.DB_POOL_MIN || '5')  // Keep more connections alive
    envConfig.idleTimeoutMillis = parseInt(process.env.DB_POOL_IDLE_TIMEOUT || '60000') // 1 minute
    envConfig.connectionTimeoutMillis = parseInt(process.env.DB_POOL_CONNECTION_TIMEOUT || '10000') // 10 seconds
    envConfig.acquireTimeoutMillis = parseInt(process.env.DB_POOL_ACQUIRE_TIMEOUT || '120000') // 2 minutes
  } else if (process.env.NODE_ENV === 'test') {
    envConfig.max = parseInt(process.env.DB_POOL_MAX || '5')  // Lower for tests
    envConfig.min = parseInt(process.env.DB_POOL_MIN || '1')  // Minimal connections
    envConfig.idleTimeoutMillis = parseInt(process.env.DB_POOL_IDLE_TIMEOUT || '10000') // 10 seconds
    envConfig.connectionTimeoutMillis = parseInt(process.env.DB_POOL_CONNECTION_TIMEOUT || '5000') // 5 seconds
    envConfig.acquireTimeoutMillis = parseInt(process.env.DB_POOL_ACQUIRE_TIMEOUT || '30000') // 30 seconds
  } else {
    // Development defaults
    envConfig.max = parseInt(process.env.DB_POOL_MAX || '20')
    envConfig.min = parseInt(process.env.DB_POOL_MIN || '2')
    envConfig.idleTimeoutMillis = parseInt(process.env.DB_POOL_IDLE_TIMEOUT || '30000') // 30 seconds
    envConfig.connectionTimeoutMillis = parseInt(process.env.DB_POOL_CONNECTION_TIMEOUT || '2000') // 2 seconds
    envConfig.acquireTimeoutMillis = parseInt(process.env.DB_POOL_ACQUIRE_TIMEOUT || '60000') // 1 minute
  }

  return { ...baseConfig, ...envConfig }
}

// Connection pool monitoring utilities
export const logPoolStats = (pool: any) => {
  const stats = {
    totalCount: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount,
  }

  console.log('Database Pool Stats:', stats)
  return stats
}

// Health check query for connection validation
export const HEALTH_CHECK_QUERY = 'SELECT 1 as health_check'

// Connection retry configuration
export const RETRY_CONFIG = {
  maxRetries: parseInt(process.env.DB_RETRY_MAX || '3'),
  retryDelay: parseInt(process.env.DB_RETRY_DELAY || '1000'), // milliseconds
  retryBackoff: parseFloat(process.env.DB_RETRY_BACKOFF || '2'), // exponential backoff multiplier
}
