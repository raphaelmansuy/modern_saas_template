import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'

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
