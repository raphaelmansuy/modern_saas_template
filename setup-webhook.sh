#!/bin/bash

# Stripe Webhook Setup Script
# This script helps you set up webhooks for your Stripe integration

echo "🔧 Setting up Stripe webhooks for order creation..."

# Check if Stripe CLI is installed
if ! command -v stripe &> /dev/null; then
    echo "❌ Stripe CLI is not installed. Please install it first:"
    echo "   npm install -g stripe"
    echo "   # or"
    echo "   brew install stripe/stripe-cli/stripe"
    exit 1
fi

# Check if logged in to Stripe
if ! stripe config --list &> /dev/null; then
    echo "🔑 Please login to Stripe CLI first:"
    echo "   stripe login"
    exit 1
fi

# Get the webhook endpoint URL
if [ "$1" ]; then
    WEBHOOK_URL="$1"
else
    echo "🌐 What is your webhook endpoint URL?"
    echo "   For local development: http://localhost:3001/api/webhooks"
    echo "   For production: https://yourdomain.com/api/webhooks"
    read -p "Enter webhook URL: " WEBHOOK_URL
fi

if [ -z "$WEBHOOK_URL" ]; then
    echo "❌ Webhook URL is required"
    exit 1
fi

echo "📡 Setting up webhook endpoint: $WEBHOOK_URL"

# Create webhook endpoint
WEBHOOK_RESULT=$(stripe listen --forward-to="$WEBHOOK_URL" --events="payment_intent.succeeded,payment_intent.payment_failed" --api-key="$STRIPE_SECRET_KEY" 2>&1)

if [ $? -eq 0 ]; then
    # Extract webhook secret from output
    WEBHOOK_SECRET=$(echo "$WEBHOOK_RESULT" | grep -o 'whsec_[a-zA-Z0-9_]*')

    if [ -n "$WEBHOOK_SECRET" ]; then
        echo "✅ Webhook endpoint created successfully!"
        echo "🔑 Webhook Secret: $WEBHOOK_SECRET"
        echo ""
        echo "📝 Add this to your .env file:"
        echo "STRIPE_WEBHOOK_SECRET=\"$WEBHOOK_SECRET\""
        echo ""
        echo "💡 The webhook is now forwarding events to: $WEBHOOK_URL"
        echo "   Keep this terminal running to receive webhooks locally."
    else
        echo "⚠️  Webhook created but couldn't extract secret. Check the output above."
    fi
else
    echo "❌ Failed to create webhook endpoint:"
    echo "$WEBHOOK_RESULT"
    echo ""
    echo "💡 Alternative: Create webhook manually in Stripe Dashboard"
    echo "   1. Go to https://dashboard.stripe.com/webhooks"
    echo "   2. Click 'Add endpoint'"
    echo "   3. URL: $WEBHOOK_URL"
    echo "   4. Events: payment_intent.succeeded, payment_intent.payment_failed"
    echo "   5. Copy the webhook secret to your .env file"
fi
