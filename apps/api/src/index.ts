import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { cors } from 'hono/cors'
import { createClerkClient } from '@clerk/clerk-sdk-node'
import Stripe from 'stripe'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { eq } from 'drizzle-orm'
import { users, subscriptions, products, orders } from '../packages/db'

// Database connection
const connectionString = process.env.DATABASE_URL!
const client = postgres(connectionString)
const db = drizzle(client)

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

// Create mock order for demo purposes
app.post('/api/create-mock-order', async (c) => {
  try {
    const body = await c.req.json()
    const { productId, paymentIntentId, customerInfo } = body
    
    // Get product from database
    const product = await db.select().from(products).where(eq(products.id, productId)).limit(1)
    
    if (product.length === 0) {
      return c.json({ error: 'Product not found' }, 404)
    }
    
    const selectedProduct = product[0]
    
    // Check if order already exists
    const existingOrder = await db
      .select()
      .from(orders)
      .where(eq(orders.stripePaymentIntentId, paymentIntentId))
      .limit(1)
    
    if (existingOrder.length > 0) {
      return c.json({ success: true, message: 'Order already exists' })
    }
    
    // Find or create user
    let userId: number | null = null
    if (customerInfo?.customerId) {
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, customerInfo.customerEmail || ''))
        .limit(1)
      
      if (existingUser.length > 0) {
        userId = existingUser[0].id
      } else {
        // Create new user if doesn't exist
        const newUser = await db
          .insert(users)
          .values({
            email: customerInfo.customerEmail || '',
          })
          .returning()
        userId = newUser[0].id
      }
    }
    
    // Create mock order record
    await db.insert(orders).values({
      userId,
      productId,
      stripePaymentIntentId: paymentIntentId,
      quantity: 1,
      amount: selectedProduct.price,
      currency: selectedProduct.currency || 'usd',
      status: 'completed',
      customerEmail: customerInfo?.customerEmail,
      customerName: customerInfo?.customerName,
      customerPhone: customerInfo?.customerPhone,
    })
    
    console.log('Mock order created successfully for payment:', paymentIntentId)
    
    return c.json({ success: true })
  } catch (error) {
    console.error('Error creating mock order:', error)
    return c.json({ error: 'Failed to create mock order' }, 500)
  }
})

// Create payment intent schema
const createPaymentIntentSchema = z.object({
  productId: z.number(),
  quantity: z.number().min(1).default(1),
  customerInfo: z.object({
    customerId: z.string(),
    customerEmail: z.string().email().optional(),
    customerName: z.string().optional(),
    customerPhone: z.string().optional(),
  }).optional(),
})

// Create payment intent for a product
app.post('/api/create-payment-intent', zValidator('json', createPaymentIntentSchema), async (c) => {
  try {
    const { productId, quantity, customerInfo } = c.req.valid('json')
    
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
      // Prepare metadata for Stripe payment intent
      const metadata: Record<string, string> = {
        productId: productId.toString(),
        quantity: quantity.toString(),
        productName: selectedProduct.name,
        productDescription: selectedProduct.description || '',
        currency: selectedProduct.currency || 'usd',
      }

      // Add customer information to metadata if available
      if (customerInfo) {
        if (customerInfo.customerId) metadata.customerId = customerInfo.customerId
        if (customerInfo.customerEmail) metadata.customerEmail = customerInfo.customerEmail
        if (customerInfo.customerName) metadata.customerName = customerInfo.customerName
        if (customerInfo.customerPhone) metadata.customerPhone = customerInfo.customerPhone
      }

      // Create real payment intent with Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: selectedProduct.currency || 'usd',
        metadata: {
          ...metadata,
          paymentIntentId: '', // Will be set after creation
        },
        // Include customer information if email is available
        ...(customerInfo?.customerEmail && {
          receipt_email: customerInfo.customerEmail,
        }),
        // Add description with customer name if available
        ...(customerInfo?.customerName && {
          description: `Purchase by ${customerInfo.customerName} - ${selectedProduct.name}`,
        }),
      })
      
      // Update metadata with the actual payment intent ID
      await stripe.paymentIntents.update(paymentIntent.id, {
        metadata: {
          ...metadata,
          paymentIntentId: paymentIntent.id,
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
      
      try {
        // Check if order already exists (idempotency)
        const existingOrder = await db
          .select()
          .from(orders)
          .where(eq(orders.stripePaymentIntentId, paymentIntent.id))
          .limit(1)
        
        if (existingOrder.length > 0) {
          console.log('Order already exists for payment:', paymentIntent.id)
          break
        }
        
        // Extract order information from metadata
        const productId = parseInt(paymentIntent.metadata.productId)
        const quantity = parseInt(paymentIntent.metadata.quantity || '1')
        
        // Get product details
        const product = await db
          .select()
          .from(products)
          .where(eq(products.id, productId))
          .limit(1)
        
        if (product.length === 0) {
          console.error('Product not found for payment:', paymentIntent.id)
          break
        }
        
        // Find or create user
        let userId: number | null = null
        if (paymentIntent.metadata.customerEmail) {
          const existingUser = await db
            .select()
            .from(users)
            .where(eq(users.email, paymentIntent.metadata.customerEmail))
            .limit(1)
          
          if (existingUser.length > 0) {
            userId = existingUser[0].id
          } else {
            // Create new user if doesn't exist
            const newUser = await db
              .insert(users)
              .values({
                email: paymentIntent.metadata.customerEmail,
              })
              .returning()
            userId = newUser[0].id
          }
        }
        
        // Create order record
        await db.insert(orders).values({
          userId,
          productId,
          stripePaymentIntentId: paymentIntent.id,
          quantity,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          status: 'completed',
          customerEmail: paymentIntent.metadata.customerEmail,
          customerName: paymentIntent.metadata.customerName,
          customerPhone: paymentIntent.metadata.customerPhone,
        })
        
        console.log('Order created successfully for payment:', paymentIntent.id)
        
        // TODO: Send confirmation email to customer
      } catch (error) {
        console.error('Error processing successful payment:', error)
      }
      break
    case 'payment_intent.payment_failed':
      const failedPaymentIntent = event.data.object as Stripe.PaymentIntent
      console.log('PaymentIntent failed:', failedPaymentIntent.id)
      
      try {
        // Update order status if it exists
        await db
          .update(orders)
          .set({ status: 'failed' })
          .where(eq(orders.stripePaymentIntentId, failedPaymentIntent.id))
      } catch (error) {
        console.error('Error updating failed payment:', error)
      }
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

// Get order details by payment intent ID
app.get('/api/orders/:paymentIntentId', async (c) => {
  try {
    const paymentIntentId = c.req.param('paymentIntentId')
    console.log('Fetching order for payment intent:', paymentIntentId)
    
    // Handle mock payments
    if (paymentIntentId.startsWith('pi_mock_')) {
      console.log('Handling mock payment:', paymentIntentId)
      
      // For mock payments, create a temporary order response
      // In a real application, you might want to store mock orders differently
      const mockOrder = {
        order: {
          id: Math.floor(Math.random() * 10000),
          stripePaymentIntentId: paymentIntentId,
          quantity: 1,
          amount: 2999, // Mock amount
          currency: 'usd',
          status: 'completed',
          customerEmail: 'demo@example.com',
          customerName: 'Demo User',
          createdAt: new Date().toISOString(),
          product: {
            id: 1,
            name: 'Demo Product',
            description: 'This is a demo product for testing purposes',
            price: 2999,
            currency: 'usd',
          }
        }
      }
      
      return c.json(mockOrder)
    }
    
    // First, check if the order exists
    const orderExists = await db
      .select()
      .from(orders)
      .where(eq(orders.stripePaymentIntentId, paymentIntentId))
      .limit(1)
    
    console.log('Order exists check:', orderExists.length > 0)
    
    if (orderExists.length === 0) {
      // Order doesn't exist yet - this could be because:
      // 1. Webhook hasn't processed yet
      // 2. Payment failed
      // 3. Invalid payment intent ID
      
      // Check if payment intent exists in Stripe (for real payments)
      if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('sk_test_...')) {
        try {
          const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
          
          if (paymentIntent.status === 'succeeded') {
            // Payment succeeded but webhook hasn't processed yet
            return c.json({ 
              error: 'Order is being processed. Please try again in a few moments.',
              status: 'processing'
            }, 202)
          } else if (paymentIntent.status === 'requires_payment_method' || paymentIntent.status === 'requires_confirmation') {
            // Payment not completed yet
            return c.json({ 
              error: 'Payment not completed yet.',
              status: 'pending'
            }, 400)
          } else {
            // Payment failed or cancelled
            return c.json({ 
              error: 'Payment was not successful.',
              status: paymentIntent.status
            }, 400)
          }
        } catch (stripeError) {
          console.error('Error retrieving payment intent from Stripe:', stripeError)
          return c.json({ error: 'Invalid payment intent ID' }, 404)
        }
      } else {
        // Stripe not configured or in demo mode
        return c.json({ error: 'Order not found' }, 404)
      }
    }
    
    const order = await db
      .select({
        order: orders,
        product: products,
        user: users,
      })
      .from(orders)
      .leftJoin(products, eq(orders.productId, products.id))
      .leftJoin(users, eq(orders.userId, users.id))
      .where(eq(orders.stripePaymentIntentId, paymentIntentId))
      .limit(1)
    
    console.log('Order query result:', order.length)
    
    if (order.length === 0) {
      return c.json({ error: 'Order not found' }, 404)
    }
    
    return c.json({ 
      order: {
        ...order[0].order,
        product: order[0].product,
        user: order[0].user,
      }
    })
  } catch (error) {
    console.error('Error fetching order:', error)
    return c.json({ error: 'Failed to fetch order' }, 500)
  }
})

app.get('/', (c) => {
  return c.text('Hello from Hono API!')
})

export default {
  port: 3001,
  fetch: app.fetch,
}
