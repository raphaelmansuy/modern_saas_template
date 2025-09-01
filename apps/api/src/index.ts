import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { cors } from 'hono/cors'
import { createClerkClient } from '@clerk/clerk-sdk-node'
import Stripe from 'stripe'
import { eq, gte, lte, like, or, and, asc, desc, count } from 'drizzle-orm'
import { db, pool, testConnection, getPoolStats } from '@saas/db'
import { users, subscriptions, products, orders } from '@saas/db'
import { StripeOrderSyncService } from './scripts/sync-orders'

// Database connection is now handled by the shared @saas/db package
// Test database connection on startup
testConnection().then((connected) => {
  if (connected) {
    console.log('Database connection pool initialized successfully')
    console.log('Pool stats:', getPoolStats())
  } else {
    console.error('Failed to connect to database')
    process.exit(1)
  }
})

const app = new Hono()

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

// Get allowed origins from environment variables
const allowedOrigins = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
  : []

// Add CORS middleware
app.use('/*', cors({
  origin: allowedOrigins,
  allowHeaders: ['*'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}))

// Initialize Clerk client
const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!
})

// OpenAPI specification
const openApiSpec = {
  openapi: '3.1.0',
  info: {
    title: 'SaaS API',
    version: '1.0.0',
    description: 'Payment processing and user management API for the SaaS platform'
  },
  servers: [
    {
      url: process.env.NODE_ENV === 'production'
        ? 'https://api.yourdomain.com'
        : 'http://localhost:3001',
      description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
    }
  ],
  paths: {
    '/health': {
      get: {
        summary: 'Health check with database status',
        description: 'Returns the health status of the API and database connection pool',
        responses: {
          '200': {
            description: 'Service is healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'healthy' },
                    timestamp: { type: 'string', format: 'date-time' },
                    database: {
                      type: 'object',
                      properties: {
                        connected: { type: 'boolean' },
                        pool: {
                          type: 'object',
                          properties: {
                            totalCount: { type: 'number' },
                            idleCount: { type: 'number' },
                            waitingCount: { type: 'number' }
                          }
                        }
                      }
                    },
                    uptime: { type: 'number' }
                  }
                }
              }
            }
          },
          '503': {
            description: 'Service is unhealthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'unhealthy' },
                    timestamp: { type: 'string', format: 'date-time' },
                    error: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/products': {
      get: {
        summary: 'Get all products',
        description: 'Retrieve all available products',
        responses: {
          '200': {
            description: 'List of products',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    products: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'number' },
                          name: { type: 'string' },
                          description: { type: 'string', nullable: true },
                          price: { type: 'number' },
                          currency: { type: 'string' },
                          stripeProductId: { type: 'string', nullable: true },
                          stripePriceId: { type: 'string', nullable: true },
                          createdAt: { type: 'string', format: 'date-time', nullable: true }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          '500': {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/create-payment-intent': {
      post: {
        summary: 'Create payment intent',
        description: 'Create a Stripe payment intent for a product',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  productId: { type: 'number' },
                  quantity: { type: 'number', minimum: 1, default: 1 },
                  customerInfo: {
                    type: 'object',
                    properties: {
                      customerId: { type: 'string' },
                      customerEmail: { type: 'string', format: 'email' },
                      customerName: { type: 'string' },
                      customerPhone: { type: 'string' }
                    }
                  }
                },
                required: ['productId']
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Payment intent created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    clientSecret: { type: 'string' },
                    amount: { type: 'number' },
                    currency: { type: 'string' }
                  }
                }
              }
            }
          },
          '404': {
            description: 'Product not found'
          },
          '500': {
            description: 'Internal server error'
          }
        }
      }
    },
    '/api/orders/{paymentIntentId}': {
      get: {
        summary: 'Get order by payment intent ID',
        description: 'Retrieve order details using the Stripe payment intent ID',
        parameters: [
          {
            name: 'paymentIntentId',
            in: 'path',
            required: true,
            schema: {
              type: 'string'
            }
          }
        ],
        responses: {
          '200': {
            description: 'Order details retrieved successfully'
          },
          '202': {
            description: 'Order is being processed'
          },
          '400': {
            description: 'Payment not completed or invalid status'
          },
          '404': {
            description: 'Order not found'
          },
          '500': {
            description: 'Internal server error'
          }
        }
      }
    },
    '/api/webhooks': {
      post: {
        summary: 'Stripe webhooks',
        description: 'Handle Stripe webhook events for payment processing',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                description: 'Stripe webhook payload'
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Webhook processed successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    received: { type: 'boolean' }
                  }
                }
              }
            }
          },
          '400': {
            description: 'Webhook signature verification failed'
          }
        }
      }
    },
    '/api/create-provisional-order': {
      post: {
        summary: 'Create provisional order',
        description: 'Create a provisional order immediately after payment confirmation',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  paymentIntentId: { type: 'string' },
                  productId: { type: 'number' },
                  quantity: { type: 'number', minimum: 1, default: 1 },
                  customerInfo: {
                    type: 'object',
                    properties: {
                      customerEmail: { type: 'string', format: 'email' },
                      customerName: { type: 'string' },
                      customerPhone: { type: 'string' }
                    }
                  }
                },
                required: ['paymentIntentId', 'productId']
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Provisional order created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    orderId: { type: 'number' },
                    isProvisional: { type: 'boolean' }
                  }
                }
              }
            }
          },
          '404': {
            description: 'Product not found'
          },
          '500': {
            description: 'Internal server error'
          }
        }
      }
    },
    '/api/admin/sync-orders': {
      post: {
        summary: 'Sync orders manually',
        description: 'Manually trigger order synchronization with Stripe (Admin only)',
        security: [
          {
            bearerAuth: []
          }
        ],
        responses: {
          '200': {
            description: 'Order sync completed successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    synced: { type: 'number' },
                    failed: { type: 'number' },
                    skipped: { type: 'number' }
                  }
                }
              }
            }
          },
          '401': {
            description: 'Unauthorized - Admin access required'
          },
          '500': {
            description: 'Internal server error'
          }
        }
      }
    },
    '/api/admin/sync-stats': {
      get: {
        summary: 'Get sync statistics',
        description: 'Get order synchronization statistics (Admin only)',
        security: [
          {
            bearerAuth: []
          }
        ],
        responses: {
          '200': {
            description: 'Sync statistics retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    stats: {
                      type: 'object',
                      properties: {
                        totalOrders: { type: 'number' },
                        syncedOrders: { type: 'number' },
                        pendingOrders: { type: 'number' },
                        failedOrders: { type: 'number' }
                      }
                    }
                  }
                }
              }
            }
          },
          '401': {
            description: 'Unauthorized - Admin access required'
          },
          '500': {
            description: 'Internal server error'
          }
        }
      }
    },
    '/api/invoices/{paymentIntentId}': {
      get: {
        summary: 'Get invoice download URL',
        description: 'Get the download URL for an invoice or receipt by payment intent ID',
        parameters: [
          {
            name: 'paymentIntentId',
            in: 'path',
            required: true,
            schema: {
              type: 'string'
            }
          }
        ],
        responses: {
          '200': {
            description: 'Invoice/receipt information retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    downloadUrl: { type: 'string', nullable: true },
                    message: { type: 'string' },
                    invoiceId: { type: 'string' },
                    invoiceNumber: { type: 'string' },
                    chargeId: { type: 'string' }
                  }
                }
              }
            }
          },
          '500': {
            description: 'Internal server error'
          }
        }
      }
    }
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  }
}

// Serve OpenAPI specification as JSON
app.get('/doc', (c) => {
  return c.json(openApiSpec)
})

// Serve Swagger UI
app.get('/docs', (c) => {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="description" content="SwaggerUI" />
  <title>SaaS API Documentation</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css" />
</head>
<body>
<div id="swagger-ui"></div>
<script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.js" crossorigin></script>
<script>
  window.onload = () => {
    window.ui = SwaggerUIBundle({
      url: '/doc',
      dom_id: '#swagger-ui',
      presets: [
        SwaggerUIBundle.presets.apis,
        SwaggerUIBundle.presets.standalone,
      ],
    });
  };
</script>
</body>
</html>`
  return c.html(html)
})

// Health check route with database pool stats
app.get('/health', async (c) => {
  try {
    // Test database connection
    const isDbConnected = await testConnection()
    const poolStats = getPoolStats()

    const health = {
      status: isDbConnected ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      database: {
        connected: isDbConnected,
        pool: poolStats,
      },
      uptime: process.uptime(),
    }

    return c.json(health, isDbConnected ? 200 : 503)
  } catch (error) {
    console.error('Health check failed:', error)
    return c.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    }, 503)
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

// Update user profile endpoint
app.put('/api/user/profile', async (c) => {
  try {
    const authHeader = c.req.header('Authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    // Verify the token and get user info
    let payload
    try {
      payload = await clerkClient.verifyToken(token)
    } catch (tokenError) {
      console.error('Token verification failed:', tokenError)
      return c.json({ error: 'Invalid or expired authentication token' }, 401)
    }

    if (!payload.sub) {
      return c.json({ error: 'Invalid token' }, 401)
    }

    const userId = payload.sub
    const body = await c.req.json()

    // Prepare update data - only include fields that are provided
    const updateData: any = {}
    if (body.firstName !== undefined) {
      updateData.firstName = body.firstName || null
    }
    if (body.lastName !== undefined) {
      updateData.lastName = body.lastName || null
    }

    // If no fields to update, return success
    if (Object.keys(updateData).length === 0) {
      return c.json({
        success: true,
        user: {
          id: payload.sub,
          firstName: null, // We don't have the current values
          lastName: null,
          emailAddresses: [],
        }
      })
    }

    // Update user profile using Clerk
    const updatedUser = await clerkClient.users.updateUser(userId, updateData)

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
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('token')) {
        return c.json({ error: 'Authentication error' }, 401)
      }
      if (error.message.includes('user')) {
        return c.json({ error: 'User not found' }, 404)
      }
    }
    
    return c.json({ error: 'Failed to update profile' }, 500)
  }
})

// Get user orders with pagination and filtering
app.get('/api/user/orders', async (c) => {
  try {
    const authHeader = c.req.header('Authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    // Verify the token and get user info
    let payload
    try {
      payload = await clerkClient.verifyToken(token)
    } catch (tokenError) {
      console.error('Token verification failed:', tokenError)
      return c.json({ error: 'Invalid or expired authentication token' }, 401)
    }

    if (!payload.sub) {
      return c.json({ error: 'Invalid token' }, 401)
    }

    const clerkUserId = payload.sub

    // Get user details from Clerk to find email
    let clerkUser
    try {
      clerkUser = await clerkClient.users.getUser(clerkUserId)
    } catch (userError) {
      console.error('Error fetching user from Clerk:', userError)
      return c.json({ error: 'Failed to get user information' }, 500)
    }

    const userEmail = clerkUser.primaryEmailAddress?.emailAddress
    if (!userEmail) {
      return c.json({ error: 'User email not found' }, 400)
    }

    // Find user in database by email
    const dbUser = await db
      .select()
      .from(users)
      .where(eq(users.email, userEmail))
      .limit(1)

    if (dbUser.length === 0) {
      // User doesn't exist in database yet, return empty orders
      return c.json({
        orders: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
        filters: {
          status: 'all',
          search: '',
          dateFrom: '',
          dateTo: '',
          sortBy: 'createdAt',
          sortOrder: 'desc',
        }
      })
    }

    const dbUserId = dbUser[0].id

    // Get query parameters
    const page = parseInt(c.req.query('page') || '1')
    const limit = parseInt(c.req.query('limit') || '10')
    const status = c.req.query('status')
    const search = c.req.query('search')
    const dateFrom = c.req.query('dateFrom')
    const dateTo = c.req.query('dateTo')
    const sortBy = c.req.query('sortBy') || 'createdAt'
    const sortOrder = c.req.query('sortOrder') || 'desc'

    // Build where conditions
    const whereConditions = [eq(orders.userId, dbUserId)]

    if (status && status !== 'all') {
      whereConditions.push(eq(orders.status, status))
    }

    // Date filtering
    if (dateFrom) {
      whereConditions.push(gte(orders.createdAt, new Date(dateFrom)))
    }
    if (dateTo) {
      whereConditions.push(lte(orders.createdAt, new Date(dateTo)))
    }

    // Search functionality
    let searchConditions = []
    if (search) {
      // Search by product name, description, or payment intent ID
      searchConditions = [
        like(products.name, `%${search}%`),
        like(products.description, `%${search}%`),
        like(orders.stripePaymentIntentId, `%${search}%`)
      ]
    }

    // Calculate offset
    const offset = (page - 1) * limit

    // Build the query
    let query = db
      .select({
        order: orders,
        product: products,
      })
      .from(orders)
      .leftJoin(products, eq(orders.productId, products.id))
      .where(and(...whereConditions))

    // Add search conditions if any
    if (searchConditions.length > 0) {
      query = query.where(or(...searchConditions))
    }

    // Add sorting
    const sortColumn = sortBy === 'amount' ? orders.amount :
                      sortBy === 'status' ? orders.status :
                      sortBy === 'createdAt' ? orders.createdAt : orders.createdAt

    query = sortOrder === 'asc' ? query.orderBy(asc(sortColumn)) : query.orderBy(desc(sortColumn))

    // Get total count for pagination
    const totalQuery = db
      .select({ count: count() })
      .from(orders)
      .leftJoin(products, eq(orders.productId, products.id))
      .where(and(...whereConditions))

    if (searchConditions.length > 0) {
      totalQuery.where(or(...searchConditions))
    }

    const [totalResult] = await totalQuery
    const total = totalResult?.count || 0

    // Add pagination
    const ordersResult = await query.limit(limit).offset(offset)

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return c.json({
      orders: ordersResult.map(item => ({
        ...item.order,
        product: item.product,
        amount: item.order.amount / 100, // Convert cents to dollars
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
      filters: {
        status: status || 'all',
        search: search || '',
        dateFrom: dateFrom || '',
        dateTo: dateTo || '',
        sortBy,
        sortOrder,
      }
    })
  } catch (error) {
    console.error('Error fetching user orders:', error)
    return c.json({ error: 'Failed to fetch orders' }, 500)
  }
})

// Create payment intent for a product
app.post('/api/create-payment-intent', async (c) => {
  try {
    const body = await c.req.json()
    const { productId, quantity = 1, customerInfo } = body
    
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
        // Disable automatic payment methods (prevents Link from appearing)
        automatic_payment_methods: {
          enabled: false,
        },
        // Only allow card payments
        payment_method_types: ['card'],
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
      currency: selectedProduct.currency || 'usd',
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
        // Check if order already exists (both provisional and confirmed)
        const existingOrder = await db
          .select()
          .from(orders)
          .where(eq(orders.stripePaymentIntentId, paymentIntent.id))
          .limit(1)
        
        if (existingOrder.length > 0) {
          const order = existingOrder[0]
          
          if (order.isProvisional) {
            // Update provisional order to confirmed
            await db
              .update(orders)
              .set({
                status: 'completed',
                isProvisional: false,
                updatedAt: new Date()
              })
              .where(eq(orders.id, order.id))
            
            console.log('Provisional order confirmed for payment:', paymentIntent.id)
          } else {
            console.log('Order already exists and is confirmed for payment:', paymentIntent.id)
          }
          break
        }
        
        // No existing order found - create new order (fallback for missed provisional creation)
        console.log('No existing order found, creating new order for payment:', paymentIntent.id)
        
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
        user: order[0].user ? {
          id: order[0].user.id,
          email: order[0].user.email
        } : undefined,
      }
    })
  } catch (error) {
    console.error('Error fetching order:', error)
    return c.json({ error: 'Failed to fetch order' }, 500)
  }
})

// Create provisional order immediately after payment confirmation
app.post('/api/create-provisional-order', async (c) => {
  try {
    const { paymentIntentId, productId, quantity = 1, customerInfo } = await c.req.json()
    
    // Check if provisional order already exists
    const existingOrder = await db
      .select()
      .from(orders)
      .where(eq(orders.stripePaymentIntentId, paymentIntentId))
      .limit(1)
    
    if (existingOrder.length > 0) {
      return c.json({ 
        success: true, 
        message: 'Order already exists',
        orderId: existingOrder[0].id,
        isProvisional: existingOrder[0].isProvisional
      })
    }
    
    // Get product details
    const product = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1)
    
    if (product.length === 0) {
      return c.json({ error: 'Product not found' }, 404)
    }
    
    const selectedProduct = product[0]
    
    // Find or create user
    let userId: number | null = null
    if (customerInfo?.customerEmail) {
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, customerInfo.customerEmail))
        .limit(1)
      
      if (existingUser.length > 0) {
        userId = existingUser[0].id
      } else {
        // Create new user if doesn't exist
        const newUser = await db
          .insert(users)
          .values({
            email: customerInfo.customerEmail,
          })
          .returning()
        userId = newUser[0].id
      }
    }
    
    // Create provisional order
    const provisionalOrder = await db
      .insert(orders)
      .values({
        userId,
        productId,
        stripePaymentIntentId: paymentIntentId,
        quantity,
        amount: selectedProduct.price * quantity,
        currency: selectedProduct.currency || 'usd',
        status: 'processing', // New status for provisional orders
        customerEmail: customerInfo?.customerEmail,
        customerName: customerInfo?.customerName,
        customerPhone: customerInfo?.customerPhone,
        isProvisional: true,
        provisionalCreatedAt: new Date(),
        syncAttempts: 0,
      })
      .returning()
    
    console.log('Provisional order created successfully for payment:', paymentIntentId)
    
    return c.json({ 
      success: true,
      orderId: provisionalOrder[0].id,
      isProvisional: true
    })
  } catch (error) {
    console.error('Error creating provisional order:', error)
    return c.json({ error: 'Failed to create provisional order' }, 500)
  }
})

// Admin endpoint for manual order sync
app.post('/api/admin/sync-orders', async (c) => {
  try {
    console.log('Starting manual order sync...')
    // TODO: Add authentication check for admin users
    const syncService = new StripeOrderSyncService()
    const results = await syncService.syncPendingOrders()
    console.log('Manual sync completed:', results)

    return c.json({
      success: true,
      synced: results.synced,
      failed: results.failed,
      skipped: results.skipped
    })
  } catch (error) {
    console.error('Error in manual sync:', error)
    console.error('Full error details:', error)
    return c.json({ error: 'Failed to sync orders' }, 500)
  }
})

// Admin endpoint to get sync statistics
app.get('/api/admin/sync-stats', async (c) => {
  try {
    console.log('Getting sync statistics...')
    // TODO: Add authentication check for admin users
    const syncService = new StripeOrderSyncService()
    const stats = await syncService.getSyncStats()
    console.log('Sync stats retrieved:', stats)

    return c.json({
      success: true,
      stats
    })
  } catch (error) {
    console.error('Error getting sync stats:', error)
    console.error('Full error details:', error)
    return c.json({ error: 'Failed to get sync statistics' }, 500)
  }
})

// Get invoice download URL by payment intent ID
app.get('/api/invoices/:paymentIntentId', async (c) => {
  try {
    const paymentIntentId = c.req.param('paymentIntentId')
    
    // Handle mock payments
    if (paymentIntentId.startsWith('pi_mock_')) {
      return c.json({ 
        downloadUrl: null,
        message: 'Invoice not available for demo payments'
      })
    }
    
    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('sk_test_...')) {
      return c.json({ 
        downloadUrl: null,
        message: 'Invoice service not available in demo mode'
      })
    }
    
    // Retrieve the payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {
      expand: ['latest_charge']
    })
    
    if (!paymentIntent.latest_charge) {
      return c.json({ 
        downloadUrl: null,
        message: 'No charge found for this payment'
      })
    }
    
    // Get the charge
    const charge = paymentIntent.latest_charge as Stripe.Charge
    
    // First, try to get the invoice if it exists
    if (charge.invoice) {
      try {
        const invoice = await stripe.invoices.retrieve(charge.invoice as string)
        
        if (invoice.hosted_invoice_url) {
          return c.json({ 
            downloadUrl: invoice.hosted_invoice_url,
            invoiceId: invoice.id,
            invoiceNumber: invoice.number
          })
        }
      } catch (invoiceError) {
        console.log('Error retrieving invoice:', invoiceError)
        // Continue to try receipt
      }
    }
    
    // If no invoice or invoice doesn't have URL, use the charge receipt
    if (charge.receipt_url) {
      return c.json({ 
        downloadUrl: charge.receipt_url,
        message: 'Receipt (no invoice available)',
        chargeId: charge.id
      })
    }
    
    return c.json({ 
      downloadUrl: null,
      message: 'No receipt or invoice available for this payment'
    })
  } catch (error) {
    console.error('Error retrieving invoice/receipt:', error)
    return c.json({
      downloadUrl: null,
      message: 'Failed to retrieve invoice or receipt'
    }, 500)
  }
})

export default {
  port: 3001,
  hostname: '0.0.0.0',
  fetch: app.fetch,
}
