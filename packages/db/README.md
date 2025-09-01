# @saas/db - Database Package

This package provides a shared database connection with connection pooling for the SaaS application.

## Features

- **Connection Pooling**: Uses PostgreSQL connection pooling for better performance and scalability
- **Environment-specific Configuration**: Different pool settings for development, test, and production
- **Health Monitoring**: Built-in health checks and pool statistics
- **Graceful Shutdown**: Proper connection cleanup on application termination
- **Retry Logic**: Automatic retry for connection failures

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | Required | PostgreSQL connection string |
| `DB_POOL_MAX` | 20 (dev), 50 (prod), 5 (test) | Maximum connections in pool |
| `DB_POOL_MIN` | 2 (dev), 5 (prod), 1 (test) | Minimum connections in pool |
| `DB_POOL_IDLE_TIMEOUT` | 30000ms (dev), 60000ms (prod), 10000ms (test) | Idle timeout |
| `DB_POOL_CONNECTION_TIMEOUT` | 2000ms (dev), 10000ms (prod), 5000ms (test) | Connection timeout |
| `DB_POOL_ACQUIRE_TIMEOUT` | 60000ms (dev), 120000ms (prod), 30000ms (test) | Acquire timeout |
| `DB_RETRY_MAX` | 3 | Maximum retry attempts for connection |
| `DB_RETRY_DELAY` | 1000ms | Base delay between retries |
| `DB_RETRY_BACKOFF` | 2 | Exponential backoff multiplier |

### Pool Configuration by Environment

#### Development

- Max connections: 20
- Min connections: 2
- Timeouts optimized for development workflow

#### Production

- Max connections: 50
- Min connections: 5
- Longer timeouts for stability
- SSL enabled

#### Test

- Max connections: 5
- Min connections: 1
- Shorter timeouts for faster tests

## Usage

### Basic Usage

```typescript
import { db, pool, testConnection, getPoolStats } from '@saas/db'

// Use Drizzle ORM
const users = await db.select().from(usersTable)

// Direct pool access for raw queries
const client = await pool.connect()
const result = await client.query('SELECT * FROM users')
client.release()

// Health check
const isConnected = await testConnection()

// Get pool statistics
const stats = getPoolStats()
console.log(`Pool: ${stats.idleCount}/${stats.totalCount} idle, ${stats.waitingCount} waiting`)
```

### Health Monitoring

The package includes a health check endpoint that can be used for monitoring:

```typescript
// In your API routes
app.get('/health', async (c) => {
  const isConnected = await testConnection()
  const stats = getPoolStats()

  return c.json({
    database: {
      connected: isConnected,
      pool: stats
    }
  })
})
```

### Error Handling

The connection pool includes comprehensive error handling:

```typescript
pool.on('error', (err, client) => {
  console.error('Database pool error:', err)
  // Handle pool errors appropriately
})
```

## Migration from Single Connections

If you're migrating from single database connections:

1. **Remove local connection creation**:

   ```typescript
   // OLD
   const client = postgres(connectionString)
   const db = drizzle(client)

   // NEW
   import { db } from '@saas/db'
   ```

2. **Update imports**:

   ```typescript
   // OLD
   import postgres from 'postgres'
   import { drizzle } from 'drizzle-orm/postgres-js'

   // NEW
   import { db, pool } from '@saas/db'
   ```

3. **Use pool for raw queries**:

   ```typescript
   // OLD
   const result = await client.query('SELECT 1')

   // NEW
   const client = await pool.connect()
   const result = await client.query('SELECT 1')
   client.release()
   ```

## Performance Considerations

- **Connection Limits**: Monitor your PostgreSQL `max_connections` setting
- **Pool Sizing**: Adjust pool size based on your application load
- **Idle Timeouts**: Balance between keeping connections alive and resource usage
- **Monitoring**: Use the health check endpoint for monitoring pool health

## Troubleshooting

### Common Issues

1. **Connection timeouts**: Increase `DB_POOL_CONNECTION_TIMEOUT` or check network connectivity
2. **Pool exhausted**: Increase `DB_POOL_MAX` or optimize query performance
3. **Idle connections**: Adjust `DB_POOL_IDLE_TIMEOUT` based on usage patterns
4. **SSL issues**: Ensure proper SSL configuration for production environments

### Monitoring Queries

```sql
-- Check active connections
SELECT count(*) as active_connections
FROM pg_stat_activity
WHERE datname = 'your_database_name';

-- Check connection pool stats (from application logs)
-- Use the /health endpoint to monitor pool statistics
```

## Local Development

### Running Tests

```bash
cd packages/db
bun test
```

### Database Operations

```bash
# Generate migrations
bun run generate

# Push schema changes
bun run push

# Run seed data
bun run seed
```
