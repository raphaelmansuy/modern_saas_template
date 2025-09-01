import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'
import * as schema from './schema'
import { seedDatabase } from './seed'

async function setupDatabase() {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is required')
  }

  console.log('🚀 Setting up database...')

  // Create connection for migrations (single connection to avoid issues)
  const migrationClient = postgres(connectionString, { max: 1 })

  try {
    // Initialize Drizzle with schema
    const db = drizzle(migrationClient, { schema })

    // Run migrations
    console.log('📦 Running migrations...')
    await migrate(db, {
      migrationsFolder: './drizzle',
      migrationsTable: 'drizzle_migrations'
    })
    console.log('✅ Migrations completed successfully!')

    // Close migration connection
    await migrationClient.end()

    // Run seeding with a new connection
    console.log('🌱 Running database seeding...')
    await seedDatabase()
    console.log('✅ Database seeding completed!')

  } catch (error) {
    console.error('❌ Database setup failed:', error)
    await migrationClient.end()
    process.exit(1)
  }
}

// Run setup if this script is executed directly
if (require.main === module) {
  setupDatabase()
    .then(() => {
      console.log('🎉 Database setup completed successfully!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Database setup failed:', error)
      process.exit(1)
    })
}

export { setupDatabase }
