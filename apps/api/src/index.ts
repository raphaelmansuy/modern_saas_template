import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { cors } from 'hono/cors'
import { createClerkClient } from '@clerk/clerk-sdk-node'
import Stripe from 'stripe'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { pgTable, serial, text, timestamp, integer } from 'drizzle-orm/pg-core'
import { eq } from 'drizzle-orm'

// Define database schema locally
const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
})

const subscriptions = pgTable('subscriptions', {
  id: serial('id').primaryKey(),
  userId: serial('user_id').references(() => users.id),
  stripeId: text('stripe_id').notNull(),
  status: text('status').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
})

const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  price: integer('price').notNull(),
  currency: text('currency').default('usd'),
  stripeProductId: text('stripe_product_id'),
  stripePriceId: text('stripe_price_id'),
  createdAt: timestamp('created_at').defaultNow(),
})

// Database connection
const connectionString = process.env.DATABASE_URL!
const client = postgres(connectionString)
const db = drizzle(client, { schema: { users, subscriptions, products } })

const app = new Hono()

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

// Get allowed origins from environment variables
const allowedOrigins = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
  : []

// Add CORS middleware
app.use('/*', cors({
  origin: allowedOrigins,
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}))

// Initialize Clerk client
const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!
})

// Profile update schema
const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
})

// Update user profile endpoint
app.put('/api/user/profile', zValidator('json', updateProfileSchema), async (c) => {
  try {
    const authHeader = c.req.header('Authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    // Verify the token and get user info
    const payload = await clerkClient.verifyToken(token)

    if (!payload.sub) {
      return c.json({ error: 'Invalid token' }, 401)
    }

    const userId = payload.sub
    const body = c.req.valid('json')

    // Update user profile using Clerk
    const updatedUser = await clerkClient.users.updateUser(userId, {
      firstName: body.firstName,
      lastName: body.lastName,
    })

    return c.json({
      success: true,
      user: {
        id: updatedUser.id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        emailAddresses: updatedUser.emailAddresses,
      }
    })
  } catch (error) {
    console.error('Error updating user profile:', error)
    return c.json({ error: 'Failed to update profile' }, 500)
  }
})

// Get all products
app.get('/api/products', async (c) => {
  try {
    const allProducts = await db.select().from(products)
    return c.json({ products: allProducts })
  } catch (error) {
    console.error('Error fetching products:', error)
    return c.json({ error: 'Failed to fetch products' }, 500)
  }
})

// Get a single product
app.get('/api/products/:id', async (c) => {
  try {
    const productId = parseInt(c.req.param('id'))
    const product = await db.select().from(products).where(eq(products.id, productId)).limit(1)
    
    if (product.length === 0) {
      return c.json({ error: 'Product not found' }, 404)
    }
    
    return c.json({ product: product[0] })
  } catch (error) {
    console.error('Error fetching product:', error)
    return c.json({ error: 'Failed to fetch product' }, 500)
  }
})

// Create payment intent schema
const createPaymentIntentSchema = z.object({
  productId: z.number(),
  quantity: z.number().min(1).default(1),
})

// Create payment intent for a product
app.post('/api/create-payment-intent', zValidator('json', createPaymentIntentSchema), async (c) => {
  try {
    const { productId, quantity } = c.req.valid('json')
    
    // Get product from database
    const product = await db.select().from(products).where(eq(products.id, productId)).limit(1)
    
    if (product.length === 0) {
      return c.json({ error: 'Product not found' }, 404)
    }
    
    const selectedProduct = product[0]
    const amount = selectedProduct.price * quantity
    
    let clientSecret: string
    
    // Check if Stripe is properly configured
    if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'sk_test_...') {
      // Create real payment intent with Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: selectedProduct.currency || 'usd',
        metadata: {
          productId: productId.toString(),
          quantity: quantity.toString(),
        },
      })
      clientSecret = paymentIntent.client_secret!
    } else {
      // Mock payment intent for development/demo purposes
      console.log('Using mock payment intent - Stripe not configured')
      clientSecret = `pi_mock_${Date.now()}_${Math.random().toString(36).substring(2)}`
    }
    
    return c.json({
      clientSecret: clientSecret,
      amount: amount,
      currency: selectedProduct.currency,
    })
  } catch (error) {
    console.error('Error creating payment intent:', error)
    
    // If it's a Stripe authentication error, provide a helpful message
    if (error instanceof Error && error.message.includes('authentication')) {
      return c.json({ 
        error: 'Stripe is not properly configured. Please set a valid STRIPE_SECRET_KEY in your environment variables.' 
      }, 500)
    }
    
    return c.json({ error: 'Failed to create payment intent' }, 500)
  }
})

// Webhook endpoint for Stripe events
app.post('/api/webhooks', async (c) => {
  const body = await c.req.text()
  const sig = c.req.header('stripe-signature')
  
  let event: Stripe.Event
  
  try {
    event = stripe.webhooks.constructEvent(body, sig!, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    console.log(`Webhook signature verification failed.`, err.message)
    return c.json({ error: 'Webhook signature verification failed' }, 400)
  }
  
  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      console.log('PaymentIntent was successful!', paymentIntent.id)
      // TODO: Update order status, send confirmation email, etc.
      break
    case 'payment_method.attached':
      const paymentMethod = event.data.object as Stripe.PaymentMethod
      console.log('PaymentMethod was attached to a Customer!', paymentMethod.id)
      break
    default:
      console.log(`Unhandled event type ${event.type}`)
  }
  
  return c.json({ received: true })
})

app.get('/', (c) => {
  return c.text('Hello from Hono API!')
})

export default {
  port: 3001,
  fetch: app.fetch,
}
