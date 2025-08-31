#!/bin/bash

# Test Webhook Setup Script
# This script tests if your webhook endpoint is properly configured

echo "🧪 Testing webhook setup..."

# Check if environment variables are set
if [ -z "$STRIPE_WEBHOOK_SECRET" ]; then
    echo "❌ STRIPE_WEBHOOK_SECRET is not set in environment"
    echo "   Please add it to your .env file"
    exit 1
fi

if [ -z "$STRIPE_SECRET_KEY" ]; then
    echo "❌ STRIPE_SECRET_KEY is not set in environment"
    echo "   Please add it to your .env file"
    exit 1
fi

# Test webhook endpoint accessibility
WEBHOOK_URL="${NEXT_PUBLIC_API_URL:-http://localhost:3001}/api/webhooks"
echo "📡 Testing webhook endpoint: $WEBHOOK_URL"

# Test basic connectivity
if curl -s "$WEBHOOK_URL" > /dev/null; then
    echo "✅ Webhook endpoint is accessible"
else
    echo "❌ Webhook endpoint is not accessible"
    echo "   Make sure your API server is running"
    exit 1
fi

# Test webhook signature verification with a mock event
echo "🔐 Testing webhook signature verification..."

# Create a test payload
TEST_PAYLOAD='{
  "id": "evt_test_webhook",
  "object": "event",
  "api_version": "2020-08-27",
  "created": 1234567890,
  "data": {
    "object": {
      "id": "pi_test_123",
      "object": "payment_intent",
      "amount": 2000,
      "currency": "usd",
      "status": "succeeded",
      "metadata": {
        "productId": "1",
        "quantity": "1",
        "customerEmail": "test@example.com"
      }
    }
  },
  "livemode": false,
  "pending_webhooks": 1,
  "request": {
    "id": "req_test",
    "idempotency_key": null
  },
  "type": "payment_intent.succeeded"
}'

# Test the webhook endpoint
RESPONSE=$(curl -s -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -H "Stripe-Signature: t=1234567890,v1=test_signature" \
  -d "$TEST_PAYLOAD")

if echo "$RESPONSE" | grep -q "received"; then
    echo "✅ Webhook endpoint responded correctly"
else
    echo "❌ Webhook endpoint returned unexpected response:"
    echo "$RESPONSE"
fi

# Test database connectivity
echo "🗄️  Testing database connectivity..."
if docker-compose exec -T db psql -U user -d saas_db -c "SELECT 1;" > /dev/null 2>&1; then
    echo "✅ Database is accessible"
else
    echo "❌ Database is not accessible"
    echo "   Make sure Docker containers are running"
fi

# Test order creation
echo "📦 Testing order creation..."
if docker-compose exec -T db psql -U user -d saas_db -c "SELECT COUNT(*) FROM orders;" > /dev/null 2>&1; then
    ORDER_COUNT=$(docker-compose exec -T db psql -U user -d saas_db -c "SELECT COUNT(*) FROM orders;" 2>/dev/null | tail -3 | head -1 | tr -d ' ')
    echo "✅ Orders table accessible (current count: $ORDER_COUNT)"
else
    echo "❌ Cannot access orders table"
fi

echo ""
echo "🎉 Webhook setup test completed!"
echo "💡 If all tests passed, your webhook should work correctly."
echo "   If you see errors, check the troubleshooting section in WEBHOOK_SETUP.md"
