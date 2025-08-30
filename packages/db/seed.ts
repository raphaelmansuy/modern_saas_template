import { db, products } from './index'
import { sql } from 'drizzle-orm'

async function seedProducts() {
  try {
    console.log('Creating products table if it doesn\'t exist...')

    // Create the products table if it doesn't exist
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        price INTEGER NOT NULL,
        currency TEXT DEFAULT 'usd',
        stripe_product_id TEXT,
        stripe_price_id TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `)

    console.log('Seeding products...')

    const sampleProducts = [
      {
        name: 'Premium Widget',
        description: 'A high-quality widget perfect for your needs',
        price: 2999, // $29.99 in cents
        currency: 'usd',
      },
      {
        name: 'Deluxe Gadget',
        description: 'The ultimate gadget with advanced features',
        price: 4999, // $49.99 in cents
        currency: 'usd',
      },
      {
        name: 'Basic Tool',
        description: 'Essential tool for everyday use',
        price: 1499, // $14.99 in cents
        currency: 'usd',
      },
    ]

    for (const product of sampleProducts) {
      await db.insert(products).values(product)
      console.log(`Inserted product: ${product.name}`)
    }

    console.log('Seeding completed successfully!')
  } catch (error) {
    console.error('Error seeding products:', error)
  } finally {
    process.exit(0)
  }
}

seedProducts()
