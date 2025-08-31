# Order History Page Specification

## Overview

This specification outlines the design and implementation of a comprehensive order history page for the SaaS platform. The page will display past orders for authenticated users, providing detailed information about their purchases, order status, and related actions.

## Current System Analysis

### Technology Stack
- **Frontend**: Next.js 13+ with App Router, TypeScript, Tailwind CSS
- **Authentication**: Clerk
- **Database**: PostgreSQL with Drizzle ORM
- **Payment Processing**: Stripe
- **UI Components**: Shadcn/ui with custom components
- **Icons**: Heroicons

### Database Schema
```typescript
// Orders table structure
{
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  productId: integer('product_id').references(() => products.id).notNull(),
  stripePaymentIntentId: text('stripe_payment_intent_id').notNull(),
  quantity: integer('quantity').notNull(),
  amount: integer('amount').notNull(), // Amount in cents
  currency: text('currency').notNull(),
  status: text('status').notNull(), // 'pending', 'processing', 'completed', 'failed', 'refunded'
  customerEmail: text('customer_email'),
  customerName: text('customer_name'),
  customerPhone: text('customer_phone'),
  isProvisional: boolean('is_provisional').default(false),
  provisionalCreatedAt: timestamp('provisional_created_at'),
  syncAttempts: integer('sync_attempts').default(0),
  lastSyncAttempt: timestamp('last_sync_attempt'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}
```

### Existing UI Patterns
- **Layout**: PageLayout component with breadcrumbs and consistent structure
- **Cards**: Used for content sections with hover effects and colored borders
- **Navigation**: SidebarLayout for profile-related pages
- **Status Indicators**: Badge components with color coding
- **Responsive Design**: Mobile-first approach with responsive grids
- **Loading States**: Skeleton components and loading indicators

## Page Requirements

### Core Functionality
1. **Order Listing**: Display all orders for the authenticated user
2. **Order Details**: Show comprehensive information for each order
3. **Status Tracking**: Visual status indicators with color coding
4. **Filtering & Sorting**: Filter by status, date range, and sort by various criteria
5. **Pagination**: Handle large numbers of orders efficiently
6. **Search**: Search orders by product name, order ID, or payment intent ID
7. **Actions**: Download invoices, view receipts, request refunds (where applicable)

### User Experience Requirements
1. **Intuitive Navigation**: Easy access from dashboard and profile sections
2. **Clear Information Hierarchy**: Important information prominently displayed
3. **Responsive Design**: Works seamlessly on all device sizes
4. **Loading States**: Smooth loading experiences with skeleton states
5. **Error Handling**: Graceful error states with actionable messages
6. **Accessibility**: WCAG 2.1 AA compliance
7. **Performance**: Fast loading with optimized queries and pagination

## Page Structure

### URL Structure
```
/orders - Main orders page
/orders/[id] - Individual order details (future enhancement)
```

### Navigation Integration
Add "Order History" to:
- Dashboard quick actions
- Profile sidebar navigation
- Main navigation menu (if applicable)

## UI Design Specification

### Layout Components
```typescript
// Main page layout using existing PageLayout
<PageLayout
  title="Order History"
  description="View and manage your past orders"
  breadcrumbs={[
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Order History' }
  ]}
>
```

### Header Section
```typescript
// Hero section with summary statistics
<div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-100">
  <div className="flex items-center justify-between">
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Order History</h1>
      <p className="text-gray-600">Track your purchases and download receipts</p>
    </div>
    <div className="flex items-center space-x-4">
      <Badge variant="secondary" className="text-sm">
        {totalOrders} Total Orders
      </Badge>
      <Badge variant="outline" className="text-sm">
        ${totalSpent} Total Spent
      </Badge>
    </div>
  </div>
</div>
```

### Filters and Search Section
```typescript
// Filter controls
<div className="bg-white rounded-lg border border-gray-200 p-4">
  <div className="flex flex-col md:flex-row gap-4">
    {/* Search Input */}
    <div className="flex-1">
      <Input
        placeholder="Search orders by product name or order ID..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full"
      />
    </div>

    {/* Status Filter */}
    <Select value={statusFilter} onValueChange={setStatusFilter}>
      <SelectTrigger className="w-full md:w-48">
        <SelectValue placeholder="Filter by status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Orders</SelectItem>
        <SelectItem value="completed">Completed</SelectItem>
        <SelectItem value="processing">Processing</SelectItem>
        <SelectItem value="pending">Pending</SelectItem>
        <SelectItem value="failed">Failed</SelectItem>
        <SelectItem value="refunded">Refunded</SelectItem>
      </SelectContent>
    </Select>

    {/* Date Range Filter */}
    <div className="flex items-center space-x-2">
      <Calendar className="w-4 h-4 text-gray-400" />
      <Select value={dateFilter} onValueChange={setDateFilter}>
        <SelectTrigger className="w-full md:w-48">
          <SelectValue placeholder="Date range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Time</SelectItem>
          <SelectItem value="last30">Last 30 Days</SelectItem>
          <SelectItem value="last90">Last 90 Days</SelectItem>
          <SelectItem value="lastyear">Last Year</SelectItem>
        </SelectContent>
      </Select>
    </div>
  </div>
</div>
```

### Orders Table/List View
```typescript
// Responsive table with mobile card fallback
<div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
  {/* Desktop Table View */}
  <div className="hidden md:block">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order</TableHead>
          <TableHead>Product</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell>
              <div className="font-medium">#{order.id}</div>
              <div className="text-sm text-gray-500">{order.stripePaymentIntentId}</div>
            </TableCell>
            <TableCell>
              <div className="font-medium">{order.product.name}</div>
              <div className="text-sm text-gray-500">Qty: {order.quantity}</div>
            </TableCell>
            <TableCell>
              <OrderStatusBadge status={order.status} />
            </TableCell>
            <TableCell>
              <div className="font-medium">
                ${(order.amount / 100).toFixed(2)} {order.currency.toUpperCase()}
              </div>
            </TableCell>
            <TableCell>
              <div className="text-sm">
                {new Date(order.createdAt).toLocaleDateString()}
              </div>
              <div className="text-xs text-gray-500">
                {new Date(order.createdAt).toLocaleTimeString()}
              </div>
            </TableCell>
            <TableCell>
              <OrderActions order={order} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>

  {/* Mobile Card View */}
  <div className="md:hidden space-y-4 p-4">
    {orders.map((order) => (
      <OrderCard key={order.id} order={order} />
    ))}
  </div>
</div>
```

### Order Status Component
```typescript
// Status badge with color coding
function OrderStatusBadge({ status }: { status: string }) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
        return { variant: 'default', color: 'bg-green-100 text-green-800' }
      case 'processing':
        return { variant: 'secondary', color: 'bg-blue-100 text-blue-800' }
      case 'pending':
        return { variant: 'outline', color: 'bg-yellow-100 text-yellow-800' }
      case 'failed':
        return { variant: 'destructive', color: 'bg-red-100 text-red-800' }
      case 'refunded':
        return { variant: 'outline', color: 'bg-gray-100 text-gray-800' }
      default:
        return { variant: 'outline', color: 'bg-gray-100 text-gray-800' }
    }
  }

  const config = getStatusConfig(status)

  return (
    <Badge variant={config.variant} className={config.color}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}
```

### Order Actions Component
```typescript
// Action buttons for each order
function OrderActions({ order }: { order: Order }) {
  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleViewDetails(order)}
      >
        <EyeIcon className="w-4 h-4 mr-1" />
        View
      </Button>

      {order.status === 'completed' && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleDownloadInvoice(order)}
        >
          <DocumentIcon className="w-4 h-4 mr-1" />
          Invoice
        </Button>
      )}

      {canRequestRefund(order) && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleRequestRefund(order)}
        >
          <ArrowPathIcon className="w-4 h-4 mr-1" />
          Refund
        </Button>
      )}
    </div>
  )
}
```

### Mobile Order Card
```typescript
// Mobile-optimized card view
function OrderCard({ order }: { order: Order }) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="font-medium">#{order.id}</span>
            <OrderStatusBadge status={order.status} />
          </div>

          <h3 className="font-medium text-gray-900 mb-1">
            {order.product.name}
          </h3>

          <div className="text-sm text-gray-600 space-y-1">
            <div>Quantity: {order.quantity}</div>
            <div>
              {new Date(order.createdAt).toLocaleDateString()} at{' '}
              {new Date(order.createdAt).toLocaleTimeString()}
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="font-bold text-lg">
            ${(order.amount / 100).toFixed(2)}
          </div>
          <div className="text-sm text-gray-500">
            {order.currency.toUpperCase()}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end space-x-2 mt-4 pt-4 border-t">
        <OrderActions order={order} />
      </div>
    </Card>
  )
}
```

### Pagination Component
```typescript
// Pagination with page size selection
<div className="flex items-center justify-between">
  <div className="flex items-center space-x-2">
    <span className="text-sm text-gray-600">
      Showing {startIndex + 1}-{endIndex} of {totalOrders} orders
    </span>
  </div>

  <div className="flex items-center space-x-4">
    <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
      <SelectTrigger className="w-24">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="10">10</SelectItem>
        <SelectItem value="25">25</SelectItem>
        <SelectItem value="50">50</SelectItem>
        <SelectItem value="100">100</SelectItem>
      </SelectContent>
    </Select>

    <div className="flex items-center space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setCurrentPage(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeftIcon className="w-4 h-4" />
        Previous
      </Button>

      <span className="text-sm">
        Page {currentPage} of {totalPages}
      </span>

      <Button
        variant="outline"
        size="sm"
        onClick={() => setCurrentPage(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
        <ChevronRightIcon className="w-4 h-4" />
      </Button>
    </div>
  </div>
</div>
```

### Loading and Empty States
```typescript
// Loading state
function OrdersLoadingState() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i} className="p-4">
          <div className="animate-pulse">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

// Empty state
function OrdersEmptyState() {
  return (
    <div className="text-center py-12">
      <div className="mb-6">
        <ShoppingBagIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No orders yet
        </h3>
        <p className="text-gray-600 mb-6">
          When you make your first purchase, it will appear here.
        </p>
      </div>
      <Link href="/products">
        <Button>
          <ShoppingBagIcon className="w-4 h-4 mr-2" />
          Browse Products
        </Button>
      </Link>
    </div>
  )
}
```

## API Integration

### Backend Endpoints Needed
```typescript
// Get user orders with pagination and filters
GET /api/user/orders
Query parameters:
- page: number
- limit: number
- status: string
- search: string
- dateFrom: string
- dateTo: string
- sortBy: string
- sortOrder: 'asc' | 'desc'

// Get single order details
GET /api/user/orders/[id]

// Download invoice/receipt
GET /api/user/orders/[id]/invoice

// Request refund
POST /api/user/orders/[id]/refund
```

### Frontend API Calls
```typescript
// Fetch orders with filters
const fetchOrders = async (params: OrderFilters) => {
  const queryString = new URLSearchParams(params as any).toString()
  const response = await fetch(`/api/user/orders?${queryString}`)
  return response.json()
}

// Download invoice
const downloadInvoice = async (orderId: string) => {
  const response = await fetch(`/api/user/orders/${orderId}/invoice`)
  const blob = await response.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `invoice-${orderId}.pdf`
  a.click()
}
```

## Implementation Plan

### Phase 1: Core Functionality
1. Create orders page with basic listing
2. Implement API endpoint for fetching user orders
3. Add pagination and basic filtering
4. Style with responsive design

### Phase 2: Enhanced Features
1. Add search functionality
2. Implement advanced filtering (date ranges, status)
3. Add sorting options
4. Create mobile-optimized card view

### Phase 3: Actions and Details
1. Add order details modal/page
2. Implement invoice download
3. Add refund request functionality
4. Create order tracking features

### Phase 4: Polish and Optimization
1. Add loading states and error handling
2. Implement caching and performance optimizations
3. Add accessibility features
4. Create comprehensive test coverage

## Technical Considerations

### Performance
- Implement pagination to handle large datasets
- Use React Query for caching and state management
- Optimize database queries with proper indexing
- Implement virtual scrolling for very large lists

### Security
- Ensure users can only access their own orders
- Validate all API inputs
- Implement rate limiting for API endpoints
- Use proper authentication checks

### Accessibility
- Semantic HTML structure
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Focus management in modals

### Error Handling
- Network error states
- Empty state handling
- Permission error handling
- Graceful degradation for failed API calls

## Success Metrics

### User Experience
- Page load time < 2 seconds
- Mobile responsiveness across all devices
- Intuitive navigation and filtering
- Clear status indicators and actions

### Technical Performance
- API response time < 500ms
- Smooth pagination transitions
- Efficient memory usage
- Minimal bundle size impact

### Business Value
- Increased user engagement with order history
- Improved customer support through self-service
- Better conversion through easy reordering
- Enhanced trust through transparent order tracking

## Future Enhancements

1. **Order Details Page**: Dedicated page for comprehensive order information
2. **Reorder Functionality**: One-click reordering of previous purchases
3. **Order Tracking**: Real-time delivery tracking integration
4. **Export Options**: CSV/PDF export of order history
5. **Order Analytics**: Personal spending insights and trends
6. **Subscription Management**: Integration with recurring orders
7. **Review System**: Product review and rating functionality
8. **Order Sharing**: Share order details with others

This specification provides a comprehensive foundation for implementing a world-class order history page that enhances user experience and provides valuable business insights.</content>
<parameter name="filePath">/Users/raphaelmansuy/Github/10-demos/stack01/specs/07_order_page.md
