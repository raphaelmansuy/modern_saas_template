import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { eq, and, or, lt, count, sql } from 'drizzle-orm'
import { orders } from '@saas/db'
import Stripe from 'stripe'

// Database connection
const connectionString = process.env.DATABASE_URL!
const client = postgres(connectionString)
const db = drizzle(client)

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export class StripeOrderSyncService {
  async syncPendingOrders() {
    console.log('Starting background sync of pending orders...')

    try {
      // Find orders that need syncing:
      // 1. Provisional orders
      // 2. Processing orders that haven't been synced recently
      const pendingOrders = await db
        .select()
        .from(orders)
        .where(
          or(
            eq(orders.isProvisional, true),
            and(
              eq(orders.status, 'processing'),
              or(
                eq(orders.lastSyncAttempt, null),
                lt(orders.lastSyncAttempt, new Date(Date.now() - 5 * 60 * 1000)) // 5 minutes ago
              )
            )
          )
        )

      console.log(`Found ${pendingOrders.length} orders to sync`)
      if (pendingOrders.length > 0) {
        console.log('Pending orders:', pendingOrders.map(o => ({
          id: o.id,
          status: o.status,
          isProvisional: o.isProvisional,
          lastSyncAttempt: o.lastSyncAttempt
        })))
      }

      let synced = 0
      let failed = 0
      let skipped = 0

      for (const order of pendingOrders) {
        try {
          const result = await this.syncOrderWithStripe(order)
          if (result === 'synced') synced++
          else if (result === 'failed') failed++
          else if (result === 'skipped') skipped++
        } catch (error) {
          console.error(`Error syncing order ${order.id}:`, error)
          failed++
        }
      }

      console.log(`Sync completed: ${synced} synced, ${failed} failed, ${skipped} skipped`)
      return { synced, failed, skipped }
    } catch (error) {
      console.error('Error in syncPendingOrders:', error)
      throw error
    }
  }

  private async syncOrderWithStripe(order: any): Promise<'synced' | 'failed' | 'skipped'> {
    try {
      console.log(`Syncing order ${order.id} with Stripe payment ${order.stripePaymentIntentId}`)

      // Retrieve payment intent from Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(order.stripePaymentIntentId)

      if (paymentIntent.status === 'succeeded') {
        if (order.isProvisional) {
          // Confirm provisional order
          await this.confirmOrder(order, paymentIntent)
          console.log(`Order ${order.id} confirmed from provisional`)
          return 'synced'
        } else {
          console.log(`Order ${order.id} already confirmed`)
          return 'skipped'
        }
      } else if (paymentIntent.status === 'failed' || paymentIntent.status === 'canceled') {
        // Mark order as failed
        await this.failOrder(order, paymentIntent)
        console.log(`Order ${order.id} marked as failed`)
        return 'synced'
      } else {
        // Payment still processing
        console.log(`Order ${order.id} still processing (status: ${paymentIntent.status})`)
        return 'skipped'
      }
    } catch (stripeError: any) {
      console.error(`Stripe error syncing order ${order.id}:`, stripeError.message)
      console.error('Full Stripe error:', stripeError)

      // Update sync metadata even on failure
      try {
        await this.updateSyncMetadata(order.id, false)
      } catch (dbError) {
        console.error(`Database error updating sync metadata for order ${order.id}:`, dbError)
      }
      return 'failed'
    }
  }

  private async confirmOrder(order: any, paymentIntent: Stripe.PaymentIntent) {
    await db
      .update(orders)
      .set({
        status: 'completed',
        isProvisional: false,
        updatedAt: new Date()
      })
      .where(eq(orders.id, order.id))

    await this.updateSyncMetadata(order.id, true)
  }

  private async failOrder(order: any, paymentIntent: Stripe.PaymentIntent) {
    await db
      .update(orders)
      .set({
        status: paymentIntent.status === 'failed' ? 'failed' : 'refunded',
        isProvisional: false,
        updatedAt: new Date()
      })
      .where(eq(orders.id, order.id))

    await this.updateSyncMetadata(order.id, true)
  }

  private async updateSyncMetadata(orderId: number, success: boolean) {
    // First get the current sync attempts
    const order = await db
      .select({ syncAttempts: orders.syncAttempts })
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1)

    if (order.length === 0) return

    const currentAttempts = order[0].syncAttempts || 0

    await db
      .update(orders)
      .set({
        syncAttempts: currentAttempts + 1,
        lastSyncAttempt: new Date()
      })
      .where(eq(orders.id, orderId))
  }

  // Manual sync for specific orders (admin function)
  async syncOrderById(orderId: number) {
    const order = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1)

    if (order.length === 0) {
      throw new Error('Order not found')
    }

    return await this.syncOrderWithStripe(order[0])
  }

  // Get sync statistics
  async getSyncStats() {
    const stats = await db
      .select({
        status: orders.status,
        isProvisional: orders.isProvisional,
        count: count()
      })
      .from(orders)
      .groupBy(orders.status, orders.isProvisional)

    return stats
  }
}

// CLI runner for background sync
if (require.main === module) {
  const syncService = new StripeOrderSyncService()

  syncService.syncPendingOrders()
    .then((results) => {
      console.log('Background sync completed:', results)
      process.exit(0)
    })
    .catch((error) => {
      console.error('Background sync failed:', error)
      process.exit(1)
    })
}
