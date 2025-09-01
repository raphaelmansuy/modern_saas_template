import { testConnection, getPoolStats, pool } from './index'

// Skip tests if DATABASE_URL is not available
const skipIfNoDatabase = () => {
  if (!process.env.DATABASE_URL) {
    console.log('Skipping database tests - DATABASE_URL not set')
    return true
  }
  return false
}

describe('Database Connection Pool', () => {
  // Skip all tests if no database connection
  const shouldSkip = skipIfNoDatabase()

  beforeAll(async () => {
    if (shouldSkip) return

    // Ensure we can connect to the database
    const connected = await testConnection()
    if (!connected) {
      throw new Error('Cannot connect to database for tests')
    }
  })

  afterAll(async () => {
    if (shouldSkip) return

    // Clean up pool connections
    await pool.end()
  })

  test('should establish database connection', async () => {
    if (shouldSkip) return

    const connected = await testConnection()
    expect(connected).toBe(true)
  })

  test('should return pool statistics', () => {
    if (shouldSkip) return

    const stats = getPoolStats()
    expect(stats).toHaveProperty('totalCount')
    expect(stats).toHaveProperty('idleCount')
    expect(stats).toHaveProperty('waitingCount')
    expect(typeof stats.totalCount).toBe('number')
    expect(typeof stats.idleCount).toBe('number')
    expect(typeof stats.waitingCount).toBe('number')
  })

  test('should handle multiple concurrent connections', async () => {
    if (shouldSkip) return

    const promises = Array.from({ length: 5 }, async () => {
      const client = await pool.connect()
      const result = await client.query('SELECT 1 as test')
      client.release()
      return result.rows[0].test
    })

    const results = await Promise.all(promises)
    expect(results).toEqual([1, 1, 1, 1, 1])
  })

  test('should handle connection pool limits', async () => {
    if (shouldSkip) return

    const initialStats = getPoolStats()

    // Create multiple connections
    const connections = []
    for (let i = 0; i < Math.min(10, pool.options.max || 20); i++) {
      const client = await pool.connect()
      connections.push(client)
    }

    const peakStats = getPoolStats()
    expect(peakStats.totalCount).toBeGreaterThanOrEqual(initialStats.totalCount)

    // Release all connections
    await Promise.all(connections.map(client => client.release()))

    const finalStats = getPoolStats()
    expect(finalStats.idleCount).toBeGreaterThanOrEqual(0)
  })
})
