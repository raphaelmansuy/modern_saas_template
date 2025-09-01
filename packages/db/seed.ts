import { db, products } from './index'

export async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...')

    // Check if products already exist to avoid duplicate seeding
    const existingProducts = await db.select().from(products).limit(1)
    if (existingProducts.length > 0) {
      console.log('📋 Products already exist, skipping seeding')
      return
    }

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

    console.log('📝 Inserting sample products...')
    for (const product of sampleProducts) {
      await db.insert(products).values(product)
      console.log(`✅ Inserted product: ${product.name}`)
    }

    console.log('🎉 Seeding completed successfully!')
  } catch (error) {
    console.error('❌ Error during seeding:', error)
    throw error
  }
}

// Legacy function for backward compatibility
async function seedDatabaseLegacy() {
  await seedDatabase()
}

// Run seeding if this script is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Seeding failed:', error)
      process.exit(1)
    })
}
