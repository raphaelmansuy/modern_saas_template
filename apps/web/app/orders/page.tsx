'use client'

import { useState, useEffect } from 'react'
import { useUser, useAuth } from '@clerk/nextjs'
import { apiClient } from '../../lib/api'
import { PageLayout } from '../../components/layout/PageLayout'
import { BreadcrumbItem } from '../../lib/store/navigation'
import {
  Button,
  Card,
  CardContent,
  Input,
  Badge,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Skeleton
} from '../../components/ui'
import {
  ShoppingBagIcon,
  EyeIcon,
  DocumentIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline'

const breadcrumbs: BreadcrumbItem[] = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Order History' }
]

interface Order {
  id: number
  userId: number
  productId: number
  stripePaymentIntentId: string
  quantity: number
  amount: number
  currency: string
  status: string
  customerEmail: string
  customerName: string
  customerPhone: string
  isProvisional: boolean
  createdAt: string
  updatedAt: string
  product: {
    id: number
    name: string
    description: string | null
    price: number
    currency: string
  }
}

interface OrdersResponse {
  orders: Order[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
  filters: {
    status: string
    search: string
    dateFrom: string
    dateTo: string
    sortBy: string
    sortOrder: string
  }
}

export default function OrdersPage() {
  const { user, isLoaded } = useUser()
  const { getToken } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters and pagination state
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalOrders, setTotalOrders] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  // Calculate summary statistics
  const totalSpent = orders.reduce((sum, order) => sum + order.amount, 0)

  useEffect(() => {
    if (isLoaded && user) {
      fetchOrders()
    }
  }, [isLoaded, user, searchQuery, statusFilter, dateFilter, currentPage, pageSize])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
        status: statusFilter,
        search: searchQuery,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      })

      // Add date filtering
      if (dateFilter !== 'all') {
        const now = new Date()
        let dateFrom: Date

        switch (dateFilter) {
          case 'last30':
            dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
            break
          case 'last90':
            dateFrom = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
            break
          case 'lastyear':
            dateFrom = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
            break
          default:
            dateFrom = new Date(0)
        }

        params.append('dateFrom', dateFrom.toISOString())
      }

      const response = await apiClient.get(`/api/user/orders?${params}`, {
        headers: {
          'Authorization': `Bearer ${await getToken()}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch orders')
      }

      const data: OrdersResponse = await response.json()
      setOrders(data.orders)
      setTotalOrders(data.pagination.total)
      setTotalPages(data.pagination.totalPages)
    } catch (err) {
      console.error('Error fetching orders:', err)
      setError('Failed to load orders. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (order: Order) => {
    // TODO: Implement order details modal/page
    console.log('View order details:', order)
  }

  const handleDownloadInvoice = async (order: Order) => {
    try {
      const response = await apiClient.get(`/api/invoices/${order.stripePaymentIntentId}`)
      const data = await response.json()

      if (data.downloadUrl) {
        window.open(data.downloadUrl, '_blank')
      } else {
        alert(data.message || 'Invoice not available')
      }
    } catch (error) {
      console.error('Error downloading invoice:', error)
      alert('Failed to download invoice')
    }
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
        return { variant: 'default' as const, color: 'bg-green-100 text-green-800' }
      case 'processing':
        return { variant: 'secondary' as const, color: 'bg-blue-100 text-blue-800' }
      case 'pending':
        return { variant: 'outline' as const, color: 'bg-yellow-100 text-yellow-800' }
      case 'failed':
        return { variant: 'destructive' as const, color: 'bg-red-100 text-red-800' }
      case 'refunded':
        return { variant: 'outline' as const, color: 'bg-gray-100 text-gray-800' }
      default:
        return { variant: 'outline' as const, color: 'bg-gray-100 text-gray-800' }
    }
  }

  if (!isLoaded) {
    return (
      <PageLayout
        title="Order History"
        description="Loading your orders..."
        breadcrumbs={breadcrumbs}
      >
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout
      title="Order History"
      description="View and manage your past orders"
      breadcrumbs={breadcrumbs}
    >
      <div className="space-y-8">
        {/* Header Section */}
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
                ${totalSpent.toFixed(2)} Total Spent
              </Badge>
            </div>
          </div>
        </div>

        {/* Filters and Search Section */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search orders by product name or order ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-full"
                  />
                </div>
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
                </SelectContent>
              </Select>

              {/* Date Range Filter */}
              <div className="flex items-center space-x-2">
                <CalendarDaysIcon className="w-4 h-4 text-gray-400" />
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
          </CardContent>
        </Card>

        {/* Orders Table/List View */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="p-6 text-center">
                <div className="text-red-600 mb-4">{error}</div>
                <Button onClick={fetchOrders}>Try Again</Button>
              </div>
            ) : orders.length === 0 ? (
              <div className="p-12 text-center">
                <ShoppingBagIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No orders found
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery || statusFilter !== 'all' || dateFilter !== 'all'
                    ? 'Try adjusting your filters to see more orders.'
                    : 'When you make your first purchase, it will appear here.'
                  }
                </p>
                {(searchQuery || statusFilter !== 'all' || dateFilter !== 'all') && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery('')
                      setStatusFilter('all')
                      setDateFilter('all')
                      setCurrentPage(1)
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
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
                      {orders.map((order) => {
                        const statusConfig = getStatusConfig(order.status)
                        return (
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
                              <Badge variant={statusConfig.variant} className={statusConfig.color}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">
                                ${order.amount.toFixed(2)} {order.currency.toUpperCase()}
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
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4 p-4">
                  {orders.map((order) => {
                    const statusConfig = getStatusConfig(order.status)
                    return (
                      <Card key={order.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="font-medium">#{order.id}</span>
                              <Badge variant={statusConfig.variant} className={statusConfig.color}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </Badge>
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
                              ${order.amount.toFixed(2)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {order.currency.toUpperCase()}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-end space-x-2 mt-4 pt-4 border-t">
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
                        </div>
                      </Card>
                    )
                  })}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                Showing {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, totalOrders)} of {totalOrders} orders
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <Select value={pageSize.toString()} onValueChange={(value) => {
                setPageSize(Number(value))
                setCurrentPage(1)
              }}>
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
        )}
      </div>
    </PageLayout>
  )
}
