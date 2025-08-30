import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { cors } from 'hono/cors'
import { createClerkClient } from '@clerk/clerk-sdk-node'

const app = new Hono()

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

app.get('/', (c) => {
  return c.text('Hello from Hono API!')
})

export default {
  port: 3001,
  fetch: app.fetch,
}
