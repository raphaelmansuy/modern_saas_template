'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { SignedIn, SignedOut, SignInButton, useUser } from '@clerk/nextjs'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

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
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Purchase {product.name}</h2>
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
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50"
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!stripe || isProcessing}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                'Pay Now'
              )}
            </button>
          </div>
        </form>
      </div>
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading products...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Products</h1>
          <p className="text-xl text-gray-600">Choose from our selection of premium products</p>
        </div>

        <SignedIn>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{product.name}</h3>
                  {product.description && (
                    <p className="text-gray-600 mb-4">{product.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-gray-900">
                      ${(product.price / 100).toFixed(2)} {product.currency.toUpperCase()}
                    </span>
                    <button
                      onClick={() => handlePurchase(product)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
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
            <p className="text-gray-600 mb-4">Please sign in to view and purchase products.</p>
            <SignInButton mode="modal">
              <button className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors">
                Sign In
              </button>
            </SignInButton>
          </div>
        </SignedOut>
      </div>

      {showCheckout && selectedProduct && (
        <Elements stripe={stripePromise}>
          <CheckoutForm
            product={selectedProduct}
            onSuccess={handlePaymentSuccess}
            onCancel={handleCancel}
          />
        </Elements>
      )}
    </div>
  )
}
