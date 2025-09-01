'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { SignedIn, SignedOut, SignInButton, useUser } from '@clerk/nextjs'
import { PageLayout } from '@/components/layout/PageLayout'
import { Button } from '@/components/ui'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui'
import { BreadcrumbItem } from '@/lib/store/navigation'
import { ShoppingBagIcon, StarIcon, ShieldCheckIcon, TruckIcon, CreditCardIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

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
  const [step, setStep] = useState<'details' | 'payment'>('details')

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
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <ShoppingBagIcon className="w-6 h-6" />
            <span>Complete Your Purchase</span>
          </DialogTitle>
          <DialogDescription>
            Review your order and complete the payment process
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start space-x-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{product.name}</h3>
                  {product.description && (
                    <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                  )}
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-sm text-gray-500">Quantity: 1</span>
                    <Badge variant="secondary">Digital Product</Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">
                    ${(product.price / 100).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500">{product.currency.toUpperCase()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Multi-step Checkout */}
          {step === 'details' ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Review & Confirm</CardTitle>
                <CardDescription>Please review your order details before proceeding to payment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <CheckCircleIcon className="w-4 h-4 text-green-600" />
                  <span>Instant digital delivery</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <CheckCircleIcon className="w-4 h-4 text-green-600" />
                  <span>Secure payment processing</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <CheckCircleIcon className="w-4 h-4 text-green-600" />
                  <span>30-day money-back guarantee</span>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total:</span>
                    <span className="text-2xl font-bold text-gray-900">
                      ${(product.price / 100).toFixed(2)} {product.currency.toUpperCase()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payment Information</CardTitle>
                <CardDescription>Enter your payment details to complete the purchase</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Card Details
                    </label>
                    <div className="border border-gray-300 rounded-md p-3 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
                      <CardElement options={cardElementOptions} />
                    </div>
                  </div>

                  {message && (
                    <div className={`text-sm p-3 rounded-md ${message.includes('successful') ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                      {message}
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex justify-between pt-6">
          {step === 'details' ? (
            <>
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button onClick={() => setStep('payment')}>
                Continue to Payment
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setStep('details')}>
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!stripe || isProcessing}
                loading={isProcessing}
              >
                {isProcessing ? 'Processing...' : `Pay $${(product.price / 100).toFixed(2)}`}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
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
        <div className="space-y-8">
          {/* Header Section */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Premium Products</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover our carefully curated selection of high-quality products designed to enhance your experience.
            </p>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <ShieldCheckIcon className="w-5 h-5 text-green-600" />
              <span>Secure Payments</span>
            </div>
            <div className="flex items-center space-x-2">
              <TruckIcon className="w-5 h-5 text-blue-600" />
              <span>Instant Delivery</span>
            </div>
            <div className="flex items-center space-x-2">
              <StarIcon className="w-5 h-5 text-yellow-500" />
              <span>Premium Quality</span>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl mb-2">{product.name}</CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        Digital Product
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">
                        ${(product.price / 100).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">{product.currency.toUpperCase()}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {product.description && (
                    <CardDescription className="text-base mb-4">
                      {product.description}
                    </CardDescription>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <CheckCircleIcon className="w-4 h-4 text-green-600" />
                      <span>Instant download after purchase</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <CheckCircleIcon className="w-4 h-4 text-green-600" />
                      <span>Lifetime access</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <CheckCircleIcon className="w-4 h-4 text-green-600" />
                      <span>30-day money-back guarantee</span>
                    </div>
                  </div>

                  <Button
                    onClick={() => handlePurchase(product)}
                    className="w-full mt-6"
                    size="lg"
                  >
                    <CreditCardIcon className="w-4 h-4 mr-2" />
                    Purchase Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {products.length === 0 && (
            <div className="text-center py-12">
              <div className="mb-6">
                <ShoppingBagIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No products available</h3>
                <p className="text-gray-600">We're working on adding new products. Check back soon!</p>
              </div>
            </div>
          )}
        </div>
      </SignedIn>

      <SignedOut>
        <div className="text-center py-12">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6">
              <div className="mb-6">
                <ShoppingBagIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Sign In Required
                </h2>
                <p className="text-gray-600 mb-4">
                  Please sign in to browse and purchase our premium products.
                </p>
              </div>
              <SignInButton mode="modal">
                <Button size="lg">
                  Sign In to Continue
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
