'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { SignedIn, SignedOut, SignInButton, useUser } from '@clerk/nextjs'
import { PageLayout } from '../../components/layout/PageLayout'
import { Button, Card, CardContent, CardHeader, CardTitle } from '../../components/ui'
import { BreadcrumbItem } from '../../lib/store/navigation'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

const breadcrumbs: BreadcrumbItem[] = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Products' }
]

interface Product {
  id: number
  name: string
  description: string | null
  price: number
  currency: string
  stripeProductId: string | null
  stripePriceId: string | null
}

interface CheckoutFormProps {
  product: Product
  onSuccess: () => void
  onCancel: () => void
}

function CheckoutForm({ product, onSuccess, onCancel }: CheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const { user } = useUser()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)

    try {
      // Create payment intent with customer information
      const customerInfo = user ? {
        customerId: user.id,
        customerEmail: user.primaryEmailAddress?.emailAddress,
        customerName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        customerPhone: user.phoneNumbers?.[0]?.phoneNumber,
      } : null

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: 1,
          customerInfo,
        }),
      })

      const { clientSecret, error } = await response.json()

      if (error) {
        setMessage(error)
        setIsProcessing(false)
        return
      }

      // Confirm payment
      if (clientSecret.startsWith('pi_mock_')) {
        // Handle mock payment for development
        console.log('Mock payment processed successfully')
        setMessage('Payment successful! (Demo mode)')
        // For demo mode, create a mock order record
        const mockPaymentIntentId = `pi_mock_demo_${Date.now()}`

        // Create mock order in database for demo purposes
        try {
          await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/create-mock-order`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              productId: product.id,
              paymentIntentId: mockPaymentIntentId,
              customerInfo,
            }),
          })
        } catch (error) {
          console.error('Error creating mock order:', error)
        }

        // Redirect with mock payment intent ID
        router.push(`/payment/success?payment_intent=${mockPaymentIntentId}`)
        return
      }

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        },
      })

      if (stripeError) {
        setMessage(stripeError.message || 'Payment failed')
        setIsProcessing(false)
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        setMessage('Payment successful!')

        // Create provisional order immediately
        try {
          const provisionalResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/create-provisional-order`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              paymentIntentId: paymentIntent.id,
              productId: product.id,
              quantity: 1,
              customerInfo,
            }),
          })

          if (provisionalResponse.ok) {
            const provisionalData = await provisionalResponse.json()
            console.log('Provisional order created:', provisionalData)
          } else {
            console.error('Failed to create provisional order')
          }
        } catch (error) {
          console.error('Error creating provisional order:', error)
        }

        // Redirect to success page with payment intent ID
        router.push(`/payment/success?payment_intent=${paymentIntent.id}`)
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.')
      setIsProcessing(false)
    }
  }

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
    // Hide the save payment method checkbox and disable Link
    hideIcon: false,
    disableLink: true,
    wallets: {
      applePay: 'never',
      googlePay: 'never',
    },
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Purchase {product.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Price: ${(product.price / 100).toFixed(2)} {product.currency.toUpperCase()}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Card Details
              </label>
              <div className="border border-gray-300 rounded-md p-3">
                <CardElement options={cardElementOptions} />
              </div>
            </div>

            {message && (
              <div className={`text-sm ${message.includes('successful') ? 'text-green-600' : 'text-red-600'}`}>
                {message}
              </div>
            )}

            <div className="flex space-x-3">
              <Button
                type="button"
                onClick={onCancel}
                variant="outline"
                disabled={isProcessing}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!stripe || isProcessing}
                loading={isProcessing}
                className="flex-1"
              >
                {isProcessing ? 'Processing...' : 'Pay Now'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showCheckout, setShowCheckout] = useState(false)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`)
      const data = await response.json()
      setProducts(data.products || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = (product: Product) => {
    setSelectedProduct(product)
    setShowCheckout(true)
  }

  const handlePaymentSuccess = () => {
    setShowCheckout(false)
    setSelectedProduct(null)
    // Payment success now handled by redirect to success page
  }

  const handleCancel = () => {
    setShowCheckout(false)
    setSelectedProduct(null)
  }

  if (loading) {
    return (
      <PageLayout
        title="Products"
        description="Loading our product catalog..."
        breadcrumbs={breadcrumbs}
      >
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout
      title="Our Products"
      description="Choose from our selection of premium products"
      breadcrumbs={breadcrumbs}
    >
      <SignedIn>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id}>
              <CardHeader>
                <CardTitle>{product.name}</CardTitle>
              </CardHeader>
              <CardContent>
                {product.description && (
                  <p className="text-gray-600 mb-4">{product.description}</p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-gray-900">
                    ${(product.price / 100).toFixed(2)} {product.currency.toUpperCase()}
                  </span>
                  <Button onClick={() => handlePurchase(product)}>
                    Buy Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No products available at the moment.</p>
          </div>
        )}
      </SignedIn>

      <SignedOut>
        <div className="text-center py-12">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6">
              <p className="text-gray-600 mb-4">Please sign in to view and purchase products.</p>
              <SignInButton mode="modal">
                <Button>
                  Sign In
                </Button>
              </SignInButton>
            </CardContent>
          </Card>
        </div>
      </SignedOut>

      {showCheckout && selectedProduct && (
        <Elements
          stripe={stripePromise}
          options={{
            appearance: {
              theme: 'stripe',
            },
          }}
        >
          <CheckoutForm
            product={selectedProduct}
            onSuccess={handlePaymentSuccess}
            onCancel={handleCancel}
          />
        </Elements>
      )}
    </PageLayout>
  )
}
