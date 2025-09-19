# API Reference Documentation

This document provides comprehensive documentation for all API endpoints in the Modern SaaS Template.

## Base URL

- **Development**: `http://localhost:3001`
- **Production**: `https://your-domain.com/api`

## Authentication

Most API endpoints require authentication using JWT tokens provided by Clerk.

### Authentication Header
```http
Authorization: Bearer <jwt_token>
```

### Getting Authentication Tokens
Tokens are obtained through the Clerk authentication flow in the frontend application. The frontend automatically includes these tokens in API requests.

## Health & System

### Health Check
Check the system health and database connectivity.

**Endpoint**: `GET /health`

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "database": {
    "connected": true,
    "pool": {
      "totalCount": 10,
      "idleCount": 8,
      "waitingCount": 0
    }
  },
  "uptime": 3600
}
```

**Response Codes**:
- `200`: System is healthy
- `503`: System is unhealthy

## Documentation

### API Documentation
Access the interactive Swagger UI documentation.

**Endpoint**: `GET /docs`

Returns an HTML page with interactive API documentation.

### OpenAPI Specification
Get the raw OpenAPI specification in JSON format.

**Endpoint**: `GET /doc`

**Response**: OpenAPI 3.1.0 specification object

## Products

### List Products
Retrieve all available products.

**Endpoint**: `GET /api/products`

**Authentication**: Not required

**Response**:
```json
{
  "products": [
    {
      "id": 1,
      "name": "Premium Plan",
      "description": "Access to all premium features",
      "price": 2999,
      "currency": "usd",
      "stripeProductId": "prod_...",
      "stripePriceId": "price_...",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**Response Codes**:
- `200`: Success
- `500`: Internal server error

## Payments

### Create Payment Intent
Create a Stripe payment intent for purchasing a product.

**Endpoint**: `POST /api/create-payment-intent`

**Authentication**: Not required

**Request Body**:
```json
{
  "productId": 1,
  "quantity": 1,
  "customerInfo": {
    "customerEmail": "user@example.com",
    "customerName": "John Doe",
    "customerPhone": "+1234567890"
  }
}
```

**Request Schema**:
- `productId` (number, required): ID of the product to purchase
- `quantity` (number, optional): Quantity to purchase (default: 1)
- `customerInfo` (object, optional): Customer information
  - `customerEmail` (string, optional): Customer email address
  - `customerName` (string, optional): Customer full name
  - `customerPhone` (string, optional): Customer phone number

**Response**:
```json
{
  "clientSecret": "pi_..._secret_...",
  "amount": 2999,
  "currency": "usd"
}
```

**Response Codes**:
- `200`: Payment intent created successfully
- `404`: Product not found
- `500`: Internal server error

### Create Provisional Order
Create a provisional order immediately after payment confirmation.

**Endpoint**: `POST /api/create-provisional-order`

**Authentication**: Not required

**Request Body**:
```json
{
  "paymentIntentId": "pi_...",
  "productId": 1,
  "quantity": 1,
  "customerInfo": {
    "customerEmail": "user@example.com",
    "customerName": "John Doe",
    "customerPhone": "+1234567890"
  }
}
```

**Request Schema**:
- `paymentIntentId` (string, required): Stripe payment intent ID
- `productId` (number, required): ID of the purchased product
- `quantity` (number, optional): Quantity purchased (default: 1)
- `customerInfo` (object, optional): Customer information

**Response**:
```json
{
  "success": true,
  "orderId": 123,
  "isProvisional": true
}
```

**Response Codes**:
- `200`: Provisional order created successfully
- `404`: Product not found
- `500`: Internal server error

## Orders

### Get Order by Payment Intent ID
Retrieve order details using the Stripe payment intent ID.

**Endpoint**: `GET /api/orders/{paymentIntentId}`

**Authentication**: Not required

**Path Parameters**:
- `paymentIntentId` (string, required): Stripe payment intent ID

**Response**:
```json
{
  "order": {
    "id": 123,
    "userId": 456,
    "productId": 1,
    "stripePaymentIntentId": "pi_...",
    "quantity": 1,
    "amount": 2999,
    "currency": "usd",
    "status": "completed",
    "customerEmail": "user@example.com",
    "customerName": "John Doe",
    "customerPhone": "+1234567890",
    "isProvisional": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "product": {
      "id": 1,
      "name": "Premium Plan",
      "description": "Access to all premium features",
      "price": 2999,
      "currency": "usd"
    }
  }
}
```

**Response Codes**:
- `200`: Order found and returned
- `202`: Order is being processed (try again later)
- `400`: Payment not completed or invalid status
- `404`: Order not found
- `500`: Internal server error

## User Management

### Update User Profile
Update the authenticated user's profile information.

**Endpoint**: `PUT /api/user/profile`

**Authentication**: Required

**Request Body**:
```json
{
  "firstName": "John",
  "lastName": "Doe"
}
```

**Request Schema**:
- `firstName` (string, optional): User's first name
- `lastName` (string, optional): User's last name

**Response**:
```json
{
  "success": true,
  "user": {
    "id": "user_...",
    "firstName": "John",
    "lastName": "Doe",
    "emailAddresses": [
      {
        "emailAddress": "user@example.com",
        "id": "idn_..."
      }
    ]
  }
}
```

**Response Codes**:
- `200`: Profile updated successfully
- `401`: Unauthorized (invalid or missing token)
- `404`: User not found
- `500`: Internal server error

### Get User Orders
Retrieve the authenticated user's orders with pagination and filtering.

**Endpoint**: `GET /api/user/orders`

**Authentication**: Required

**Query Parameters**:
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10, max: 100)
- `status` (string, optional): Filter by order status ('all', 'pending', 'completed', 'failed')
- `search` (string, optional): Search in product names, descriptions, or payment intent IDs
- `dateFrom` (string, optional): Filter orders from this date (ISO 8601)
- `dateTo` (string, optional): Filter orders to this date (ISO 8601)
- `sortBy` (string, optional): Sort field ('createdAt', 'amount', 'status')
- `sortOrder` (string, optional): Sort direction ('asc', 'desc')

**Example**: `GET /api/user/orders?page=1&limit=10&status=completed&sortBy=createdAt&sortOrder=desc`

**Response**:
```json
{
  "orders": [
    {
      "id": 123,
      "productId": 1,
      "stripePaymentIntentId": "pi_...",
      "quantity": 1,
      "amount": 29.99,
      "currency": "usd",
      "status": "completed",
      "customerEmail": "user@example.com",
      "customerName": "John Doe",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "product": {
        "id": 1,
        "name": "Premium Plan",
        "description": "Access to all premium features",
        "price": 2999,
        "currency": "usd"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "filters": {
    "status": "completed",
    "search": "",
    "dateFrom": "",
    "dateTo": "",
    "sortBy": "createdAt",
    "sortOrder": "desc"
  }
}
```

**Response Codes**:
- `200`: Orders retrieved successfully
- `401`: Unauthorized (invalid or missing token)
- `500`: Internal server error

## Invoices

### Get Invoice Download URL
Get the download URL for an invoice or receipt by payment intent ID.

**Endpoint**: `GET /api/invoices/{paymentIntentId}`

**Authentication**: Not required

**Path Parameters**:
- `paymentIntentId` (string, required): Stripe payment intent ID

**Response**:
```json
{
  "downloadUrl": "https://invoice.stripe.com/i/...",
  "invoiceId": "in_...",
  "invoiceNumber": "12345678",
  "message": "Invoice available"
}
```

**Alternative Response (Receipt)**:
```json
{
  "downloadUrl": "https://receipt.stripe.com/r/...",
  "chargeId": "ch_...",
  "message": "Receipt (no invoice available)"
}
```

**No Document Available**:
```json
{
  "downloadUrl": null,
  "message": "No receipt or invoice available for this payment"
}
```

**Response Codes**:
- `200`: Success (download URL or explanation)
- `500`: Internal server error

## Admin Endpoints

Admin endpoints require elevated permissions. Authentication is required, but role checking is not yet implemented (TODO).

### Manual Order Sync
Manually trigger order synchronization with Stripe.

**Endpoint**: `POST /api/admin/sync-orders`

**Authentication**: Required (Admin role - TODO)

**Request Body**: None

**Response**:
```json
{
  "success": true,
  "synced": 5,
  "failed": 0,
  "skipped": 2
}
```

**Response Codes**:
- `200`: Sync completed successfully
- `401`: Unauthorized (Admin access required)
- `500`: Internal server error

### Get Sync Statistics
Retrieve order synchronization statistics.

**Endpoint**: `GET /api/admin/sync-stats`

**Authentication**: Required (Admin role - TODO)

**Response**:
```json
{
  "success": true,
  "stats": {
    "totalOrders": 100,
    "syncedOrders": 95,
    "pendingOrders": 3,
    "failedOrders": 2
  }
}
```

**Response Codes**:
- `200`: Statistics retrieved successfully
- `401`: Unauthorized (Admin access required)
- `500`: Internal server error

## Webhooks

### Stripe Webhooks
Handle Stripe webhook events for payment processing.

**Endpoint**: `POST /api/webhooks`

**Authentication**: Stripe signature verification

**Headers**:
- `stripe-signature`: Stripe webhook signature

**Request Body**: Raw Stripe webhook payload

**Supported Events**:
- `payment_intent.succeeded`: Payment completed successfully
- `payment_intent.payment_failed`: Payment failed
- `payment_method.attached`: Payment method attached to customer

**Response**:
```json
{
  "received": true
}
```

**Response Codes**:
- `200`: Webhook processed successfully
- `400`: Webhook signature verification failed

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "error": "Error message describing what went wrong"
}
```

### Common Error Codes

- `400 Bad Request`: Invalid request data or parameters
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Requested resource not found
- `500 Internal Server Error`: Server-side error occurred

### Authentication Errors

```json
{
  "error": "Unauthorized"
}
```

```json
{
  "error": "Invalid or expired authentication token"
}
```

### Validation Errors

```json
{
  "error": "Product not found"
}
```

```json
{
  "error": "Invalid request data",
  "details": {
    "field": "productId",
    "message": "Product ID is required"
  }
}
```

## Rate Limiting

API endpoints may be subject to rate limiting to prevent abuse:

- **Rate Limit**: 100 requests per 15-minute window per IP address
- **Headers**: Rate limit information is included in response headers:
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Requests remaining in current window
  - `X-RateLimit-Reset`: Time when the rate limit resets

**Rate Limit Exceeded Response**:
```json
{
  "error": "Too many requests. Please try again later."
}
```
**Response Code**: `429 Too Many Requests`

## CORS Policy

The API implements CORS (Cross-Origin Resource Sharing) to control which domains can access the API:

- **Allowed Origins**: Configured via `CORS_ORIGINS` environment variable
- **Allowed Methods**: GET, POST, PUT, DELETE, OPTIONS
- **Allowed Headers**: All headers (`*`)

## Request/Response Examples

### Complete Payment Flow Example

1. **Create Payment Intent**:
```http
POST /api/create-payment-intent
Content-Type: application/json

{
  "productId": 1,
  "quantity": 1,
  "customerInfo": {
    "customerEmail": "john@example.com",
    "customerName": "John Doe"
  }
}
```

Response:
```json
{
  "clientSecret": "pi_1234567890_secret_abcdefg",
  "amount": 2999,
  "currency": "usd"
}
```

2. **Process Payment** (Frontend with Stripe.js):
```javascript
const result = await stripe.confirmCardPayment(clientSecret, {
  payment_method: {
    card: cardElement,
    billing_details: {
      name: 'John Doe',
    },
  }
});
```

3. **Create Provisional Order**:
```http
POST /api/create-provisional-order
Content-Type: application/json

{
  "paymentIntentId": "pi_1234567890",
  "productId": 1,
  "quantity": 1,
  "customerInfo": {
    "customerEmail": "john@example.com",
    "customerName": "John Doe"
  }
}
```

4. **Check Order Status**:
```http
GET /api/orders/pi_1234567890
```

Response:
```json
{
  "order": {
    "id": 123,
    "status": "completed",
    "amount": 2999,
    "product": {
      "name": "Premium Plan"
    }
  }
}
```

### User Profile Update Example

```http
PUT /api/user/profile
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe"
}
```

Response:
```json
{
  "success": true,
  "user": {
    "id": "user_2abcd1234",
    "firstName": "John",
    "lastName": "Doe",
    "emailAddresses": [
      {
        "emailAddress": "john@example.com",
        "id": "idn_2abcd1234"
      }
    ]
  }
}
```

This API reference provides comprehensive documentation for all available endpoints in the Modern SaaS Template. For interactive testing, use the Swagger UI interface available at `/docs` when running the development server.