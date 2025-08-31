import { z } from 'zod'

// Base response schemas
export const SuccessResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional()
})

export const ErrorResponseSchema = z.object({
  error: z.string(),
  details: z.any().optional()
})

// Pagination schema
export const PaginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20)
})

// Product schema
export const ProductSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  price: z.number(),
  currency: z.string(),
  stripeProductId: z.string().nullable(),
  stripePriceId: z.string().nullable(),
  createdAt: z.string().optional()
})

// User profile schemas
export const UserProfileSchema = z.object({
  id: z.string(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  emailAddresses: z.array(z.object({
    emailAddress: z.string().email()
  }))
})

export const UpdateProfileRequestSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional()
})

// Payment intent schemas
export const PaymentIntentRequestSchema = z.object({
  productId: z.number(),
  quantity: z.number().min(1).default(1),
  customerInfo: z.object({
    customerId: z.string(),
    customerEmail: z.string().email().optional(),
    customerName: z.string().optional(),
    customerPhone: z.string().optional()
  }).optional()
})

export const PaymentIntentResponseSchema = z.object({
  clientSecret: z.string(),
  amount: z.number(),
  currency: z.string()
})

// Order schema
export const OrderSchema = z.object({
  id: z.number(),
  userId: z.number().nullable(),
  productId: z.number(),
  stripePaymentIntentId: z.string(),
  quantity: z.number(),
  amount: z.number(),
  currency: z.string(),
  status: z.string(),
  customerEmail: z.string().nullable(),
  customerName: z.string().nullable(),
  customerPhone: z.string().nullable(),
  isProvisional: z.boolean().optional(),
  provisionalCreatedAt: z.string().nullable().optional(),
  syncAttempts: z.number().optional(),
  lastSyncAttempt: z.string().nullable().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
})

// Provisional order schema
export const CreateProvisionalOrderSchema = z.object({
  paymentIntentId: z.string(),
  productId: z.number(),
  quantity: z.number().min(1).default(1),
  customerInfo: z.object({
    customerId: z.string().optional(),
    customerEmail: z.string().email().optional(),
    customerName: z.string().optional(),
    customerPhone: z.string().optional()
  }).optional()
})

// Sync stats schema
export const SyncStatsSchema = z.object({
  totalOrders: z.number(),
  syncedOrders: z.number(),
  pendingOrders: z.number(),
  failedOrders: z.number(),
  lastSyncAt: z.string().nullable()
})

// Invoice schema
export const InvoiceResponseSchema = z.object({
  downloadUrl: z.string().nullable(),
  invoiceId: z.string().optional(),
  invoiceNumber: z.string().optional(),
  chargeId: z.string().optional(),
  message: z.string().optional()
})
