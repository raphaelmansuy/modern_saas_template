import { pgTable, serial, text, timestamp, integer, decimal } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
})

export const subscriptions = pgTable('subscriptions', {
  id: serial('id').primaryKey(),
  userId: serial('user_id').references(() => users.id),
  stripeId: text('stripe_id').notNull(),
  status: text('status').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
})

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  price: integer('price').notNull(), // Price in cents
  currency: text('currency').default('usd'),
  stripeProductId: text('stripe_product_id'),
  stripePriceId: text('stripe_price_id'),
  createdAt: timestamp('created_at').defaultNow(),
})

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  userId: serial('user_id').references(() => users.id),
  productId: serial('product_id').references(() => products.id),
  stripePaymentIntentId: text('stripe_payment_intent_id').notNull(),
  quantity: integer('quantity').notNull(),
  amount: integer('amount').notNull(), // Amount in cents
  currency: text('currency').notNull(),
  status: text('status').notNull(), // 'pending', 'completed', 'failed', 'refunded'
  customerEmail: text('customer_email'),
  customerName: text('customer_name'),
  customerPhone: text('customer_phone'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})
