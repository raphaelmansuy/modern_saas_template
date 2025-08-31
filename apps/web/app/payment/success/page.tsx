'use client'

import { useEffect, useState, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircleIcon, DocumentTextIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'

interface OrderDetails {
  order: {
    id: number
    stripePaymentIntentId: string
    quantity: number
    amount: number
    currency: string
    status: string
    customerEmail: string
    customerName: string
    createdAt: string
    isProvisional?: boolean
    provisionalCreatedAt?: string
    product: {
      id: number
      name: string
      description: string
      price: number
      currency: string
    }
  }
  invoice?: {
    downloadUrl: string | null
    invoiceId?: string
    invoiceNumber?: string
    message?: string
  }
}

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [syncStatus, setSyncStatus] = useState<'syncing' | 'synced' | 'failed'>('syncing')

  const paymentIntentId = searchParams.get('payment_intent')

  useEffect(() => {
    if (!paymentIntentId) {
      setError('Payment intent ID is missing')
      setLoading(false)
      return
    }

    fetchOrderDetails(paymentIntentId)
  }, [paymentIntentId])

  const fetchOrderDetails = async (paymentIntentId: string) => {
    // Handle mock payments for demo mode
    if (paymentIntentId.startsWith('pi_mock_demo_')) {
      setOrderDetails({
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
          isProvisional: false,
          product: {
            id: 1,
            name: 'Demo Product',
            description: 'This is a demo product for testing purposes',
            price: 2999,
            currency: 'usd',
          }
        },
        invoice: {
          downloadUrl: null,
          message: 'Invoice not available for demo payments'
        }
      })
      setSyncStatus('synced')
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${paymentIntentId}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        if (response.status === 400 && errorData.status === 'pending') {
          throw new Error('Payment has not been completed yet. Please complete your payment first.')
        } else if (response.status === 400 && errorData.status) {
          throw new Error(`Payment status: ${errorData.status}. Please contact support if you believe this is an error.`)
        } else {
          throw new Error(errorData.error || 'Failed to fetch order details')
        }
      }
      
      const data = await response.json()
      setOrderDetails(data)
      
      // Check if this is a provisional order
      if (data.order.isProvisional) {
        setSyncStatus('syncing')
        // Optional: Set up a simple check for sync status after a delay
        setTimeout(() => checkSyncStatus(paymentIntentId), 3000)
      } else {
        setSyncStatus('synced')
      }

      // Fetch invoice information
      await fetchInvoiceDetails(paymentIntentId)
    } catch (err) {
      console.error('Error fetching order details:', err)
      setError(err instanceof Error ? err.message : 'Failed to load order details')
    } finally {
      setLoading(false)
    }
  }

  const checkSyncStatus = async (paymentIntentId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${paymentIntentId}`)
      if (response.ok) {
        const data = await response.json()
        if (!data.order.isProvisional) {
          setSyncStatus('synced')
          // Update the order details if they changed
          setOrderDetails(data)
          // Fetch invoice details now that order is confirmed
          await fetchInvoiceDetails(paymentIntentId)
        } else {
          setSyncStatus('syncing')
        }
      }
    } catch (err) {
      console.error('Error checking sync status:', err)
      setSyncStatus('failed')
    }
  }

  const handleManualRetry = () => {
    if (!paymentIntentId) return
    
    setError(null)
    setLoading(true)
    fetchOrderDetails(paymentIntentId)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100)
  }

  const SyncStatusIndicator = () => {
    if (syncStatus === 'synced') {
      return (
        <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
          <CheckCircleIcon className="w-4 h-4 mr-1" />
          Order Confirmed
        </div>
      )
    } else if (syncStatus === 'syncing') {
      return (
        <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mr-1"></div>
          Confirming Order...
        </div>
      )
    } else {
      return (
        <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-100 text-red-800">
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          Sync Issue
        </div>
      )
    }
  }

  const fetchInvoiceDetails = async (paymentIntentId: string) => {
    try {
      console.log('Fetching invoice for payment intent:', paymentIntentId)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/invoices/${paymentIntentId}`)
      console.log('Invoice API response status:', response.status)
      
      if (response.ok) {
        const invoiceData = await response.json()
        console.log('Invoice data received:', invoiceData)
        setOrderDetails(prev => prev ? { ...prev, invoice: invoiceData } : null)
      } else {
        const errorData = await response.json()
        console.log('Invoice API error:', errorData)
      }
    } catch (err) {
      console.error('Error fetching invoice details:', err)
      // Don't show error for invoice fetch failure, just log it
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your order details...</p>
        </div>
      </div>
    )
  }

  if (error || !orderDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-red-500 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Order</h1>
          <p className="text-gray-600 mb-6">{error || 'Unable to load order details'}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleManualRetry}
              className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Try Again
            </button>
            <Link
              href="/products"
              className="inline-flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back to Products
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const { order } = orderDetails

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4 print:hidden">
            <CheckCircleIcon className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 print:text-2xl">Payment Successful!</h1>
          <p className="text-lg text-gray-600 print:text-base">Thank you for your purchase. Your order has been confirmed.</p>
          <div className="hidden print:block text-center mt-4 text-sm text-gray-600">
            <p>Order Confirmation Receipt</p>
            <p>Generated on {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6 print:shadow-none print:border-0">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Order Details</h2>
              <SyncStatusIndicator />
            </div>
            <p className="text-sm text-gray-600">Order #{order.id}</p>
            {order.isProvisional && (
              <p className="text-xs text-yellow-600 mt-1">
                Provisional order created {order.provisionalCreatedAt ? formatDate(order.provisionalCreatedAt) : 'recently'}
              </p>
            )}
          </div>

          <div className="px-6 py-6">
            {/* Product Information */}
            <div className="flex items-start space-x-4 mb-6">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900 mb-2">{order.product.name}</h3>
                {order.product.description && (
                  <p className="text-gray-600 mb-3">{order.product.description}</p>
                )}
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>Quantity: {order.quantity}</span>
                  <span>•</span>
                  <span>Unit Price: {formatCurrency(order.product.price, order.currency)}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(order.amount, order.currency)}
                </p>
              </div>
            </div>

            {/* Order Information */}
            <div className="border-t border-gray-200 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Order Information</h4>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Order Date:</dt>
                      <dd className="text-sm text-gray-900">{formatDate(order.createdAt)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Order Status:</dt>
                      <dd className="text-sm">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Payment ID:</dt>
                      <dd className="text-sm text-gray-900 font-mono">{order.stripePaymentIntentId}</dd>
                    </div>
                    {orderDetails?.invoice?.invoiceNumber && (
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">Invoice:</dt>
                        <dd className="text-sm text-gray-900 font-mono">{orderDetails.invoice.invoiceNumber}</dd>
                      </div>
                    )}
                  </dl>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Customer Information</h4>
                  <dl className="space-y-2">
                    {order.customerName && (
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">Name:</dt>
                        <dd className="text-sm text-gray-900">{order.customerName}</dd>
                      </div>
                    )}
                    {order.customerEmail && (
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">Email:</dt>
                        <dd className="text-sm text-gray-900">{order.customerEmail}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center print:hidden">
          <Link
            href="/products"
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Continue Shopping
          </Link>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center justify-center px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors print:hidden"
          >
            <DocumentTextIcon className="w-4 h-4 mr-2" />
            Print Receipt
          </button>

          {orderDetails?.invoice?.downloadUrl && (
            <a
              href={orderDetails.invoice.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <DocumentTextIcon className="w-4 h-4 mr-2" />
              Download {orderDetails.invoice.invoiceId ? 'Invoice' : 'Receipt'}
            </a>
          )}
        </div>

        {/* Additional Information */}
        <div className="mt-8 text-center print:hidden">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h3 className="text-sm font-medium text-blue-800 mb-2">What's Next?</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• A confirmation email has been sent to your email address</li>
              <li>• Your order is being processed and will be shipped soon</li>
              <li>• You can track your order status in your account dashboard</li>
              {orderDetails?.invoice?.downloadUrl && (
                <li>• Download your invoice PDF for your records</li>
              )}
            </ul>
          </div>
          <p className="text-sm text-gray-600">
            If you have any questions about your order, please contact our{' '}
            <a href="mailto:support@example.com" className="text-blue-600 hover:text-blue-800">
              support team
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
