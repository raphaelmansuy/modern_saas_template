import { db, products, orders, users } from './index'
import { sql } from 'drizzle-orm'

async function seedDatabase() {
  try {
    console.log('Creating tables if they don\'t exist...')

    // Create the users table if it doesn't exist
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `)

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

    // Create the orders table if it doesn't exist
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        product_id INTEGER REFERENCES products(id),
        stripe_payment_intent_id TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        amount INTEGER NOT NULL,
        currency TEXT NOT NULL,
        status TEXT NOT NULL,
        customer_email TEXT,
        customer_name TEXT,
        customer_phone TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
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
      {
        name: 'AssistGenie',
        description: 'AI-powered assistant for productivity and automation',
        price: 1000, // HK$10.00 in cents
        currency: 'hkd',
        stripeProductId: 'prod_OCXhAmrul7KbCq',
      },
    ]

    for (const product of sampleProducts) {
      await db.insert(products).values(product)
      console.log(`Inserted product: ${product.name}`)
    }

    console.log('Seeding completed successfully!')
  } catch (error) {
    console.error('Error seeding database:', error)
  } finally {
    process.exit(0)
  }
}

seedDatabase()
