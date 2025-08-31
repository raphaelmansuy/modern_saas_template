# How to Test Stripe Webhooks Locally

This guide explains how to test Stripe webhooks in your local development environment using the Stripe CLI and webhook forwarding.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Method 1: Stripe CLI (Recommended)](#method-1-stripe-cli-recommended)
- [Method 2: ngrok Tunneling](#method-2-ngrok-tunneling)
- [Method 3: LocalTunnel](#method-3-localtunnel)
- [Testing Webhook Events](#testing-webhook-events)
- [Webhook Event Types](#webhook-event-types)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

## Prerequisites

Before testing webhooks locally, ensure you have:

1. **Stripe Account**: A Stripe account with API keys
2. **Local Development Environment**: Running on `http://localhost:3001` (API server)
3. **Environment Variables**: Properly configured `.env` file with:

   ```bash
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

## Method 1: Stripe CLI (Recommended)

The Stripe CLI is the official tool for testing webhooks locally.

### Step 1: Install Stripe CLI

**macOS (Homebrew):**

```bash
brew install stripe/stripe-cli/stripe
```

**Other Platforms:**
Download from: <https://stripe.com/docs/stripe-cli>

### Step 2: Login to Stripe

```bash
stripe login
```

This will open a browser window for authentication.

### Step 3: Forward Webhooks to Local Server

```bash
stripe listen --forward-to localhost:3001/api/webhooks
```

**Expected Output:**

```bash
> Ready! Your webhook signing secret is whsec_... (^C to quit)
```

### Step 4: Copy the Webhook Secret

Copy the webhook signing secret from the CLI output and add it to your `.env` file:

```bash
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Step 5: Test Webhook Events

In a new terminal, trigger test events:

```bash
# Test payment succeeded event
stripe trigger payment_intent.succeeded

# Test payment failed event
stripe trigger payment_intent.payment_failed

# Test checkout session completed
stripe trigger checkout.session.completed
```

## Method 2: ngrok Tunneling

If you prefer using ngrok for tunneling:

### Step 1: Install ngrok

```bash
# macOS
brew install ngrok/ngrok/ngrok

# Or download from: https://ngrok.com/download
```

### Step 2: Start ngrok Tunnel

```bash
ngrok http 3001
```

**Expected Output:**

```bash
ngrok by @inconshreveable

Session Status                online
Account                       your-email@example.com
Version                       3.x.x
Region                        United States (us)
Forwarding                    http://abc123.ngrok.io -> http://localhost:3001
Forwarding                    https://abc123.ngrok.io -> http://localhost:3001
```

### Step 3: Configure Webhook Endpoint

1. Go to your [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to **Developers > Webhooks**
3. Click **Add endpoint**
4. Enter your ngrok URL: `https://abc123.ngrok.io/api/webhooks`
5. Select events to listen for (see [Event Types](#webhook-event-types) below)
6. Copy the webhook signing secret to your `.env` file

### Step 4: Test Webhooks

Use the Stripe CLI to trigger events or make test payments through your application.

## Method 3: LocalTunnel

LocalTunnel is a free alternative to ngrok:

### Step 1: Install LocalTunnel

```bash
npm install -g localtunnel
```

### Step 2: Start Tunnel

```bash
lt --port 3001
```

**Expected Output:**

```bash
your url is: https://abc123.loca.lt
```

### Step 3: Configure Webhook

Follow the same steps as Method 2, but use the LocalTunnel URL instead.

## Testing Webhook Events

### Using Stripe CLI Triggers

```bash
# Payment Events
stripe trigger payment_intent.succeeded
stripe trigger payment_intent.payment_failed
stripe trigger payment_intent.canceled

# Checkout Events
stripe trigger checkout.session.completed
stripe trigger checkout.session.expired

# Customer Events
stripe trigger customer.created
stripe trigger customer.updated

# Subscription Events
stripe trigger customer.subscription.created
stripe trigger customer.subscription.updated
stripe trigger invoice.payment_succeeded
```

### Manual Testing with Test Mode

1. **Create a Test Payment:**
   - Visit your application at `http://localhost:3000`
   - Make a purchase using test card numbers
   - Complete the payment flow

2. **Monitor Webhook Logs:**
   ```bash
   # View recent webhook attempts in Stripe Dashboard
   # Or check your application logs for webhook processing
   ```

### Test Card Numbers

Use these test card numbers in Stripe test mode:

| Card Number | Description |
|-------------|-------------|
| 4242424242424242 | Succeeds |
| 4000000000000002 | Declined |
| 4000000000009995 | Insufficient funds |
| 4000000000009987 | Lost card |

## Webhook Event Types

Common webhook events for e-commerce applications:

### Payment Events

- `payment_intent.succeeded` - Payment completed successfully
- `payment_intent.payment_failed` - Payment failed
- `payment_intent.canceled` - Payment was canceled
- `payment_intent.amount_capturable_updated` - Amount became capturable

### Checkout Events

- `checkout.session.completed` - Checkout session completed
- `checkout.session.expired` - Checkout session expired
- `checkout.session.async_payment_succeeded` - Async payment succeeded
- `checkout.session.async_payment_failed` - Async payment failed

### Customer Events

- `customer.created` - New customer created
- `customer.updated` - Customer information updated
- `customer.deleted` - Customer deleted

### Subscription Events

- `customer.subscription.created` - Subscription created
- `customer.subscription.updated` - Subscription updated
- `customer.subscription.deleted` - Subscription canceled
- `invoice.payment_succeeded` - Subscription payment succeeded
- `invoice.payment_failed` - Subscription payment failed

## Troubleshooting

### Webhook Not Receiving Events

1. **Check Endpoint URL:**

   ```bash
   # Verify your local server is running
   curl http://localhost:3001/api/webhooks
   ```

2. **Verify Webhook Secret:**

   ```bash
   # Check your .env file has the correct secret
   grep STRIPE_WEBHOOK_SECRET .env
   ```

3. **Check Firewall/Network:**

   ```bash
   # Ensure port 3001 is accessible
   netstat -an | grep 3001
   ```

### Webhook Signature Verification Failed

1. **Update Webhook Secret:**

   ```bash
   # Make sure you're using the correct secret from Stripe CLI
   stripe listen --forward-to localhost:3001/api/webhooks
   ```

2. **Check Environment Variables:**

   ```bash
   # Restart your application after updating .env
   docker-compose restart
   ```

### Events Not Processing

1. **Check Application Logs:**

   ```bash
   # View API logs
   docker-compose logs -f api
   ```

2. **Verify Event Handling:**

   ```typescript
   // Check your webhook handler in apps/api/src/index.ts
   console.log('Event type:', event.type)
   ```

3. **Database Connection:**

   ```bash
   # Ensure database is running
   docker-compose ps db
   ```

### Common Issues

- **Port Already in Use:** Kill process using port 3001
- **Invalid Webhook Secret:** Regenerate using `stripe listen`
- **Network Timeout:** Check internet connection for ngrok
- **SSL Certificate Issues:** Use HTTPS URLs for production webhooks

## Best Practices

### Development

1. **Use Test Mode:** Always test with Stripe test mode first
2. **Environment Isolation:** Use different webhook endpoints for dev/staging/prod
3. **Logging:** Log all webhook events for debugging
4. **Idempotency:** Implement idempotent webhook handlers

### Security

1. **Verify Signatures:** Always verify webhook signatures
2. **HTTPS Only:** Use HTTPS URLs in production
3. **Secret Rotation:** Rotate webhook secrets regularly
4. **IP Whitelisting:** Consider whitelisting Stripe's IP addresses

### Monitoring

1. **Webhook Logs:** Monitor webhook delivery in Stripe Dashboard
2. **Error Handling:** Implement proper error handling and retries
3. **Alerts:** Set up alerts for failed webhook deliveries
4. **Metrics:** Track webhook success/failure rates

### Testing Strategy

1. **Unit Tests:** Test webhook handlers with mock events
2. **Integration Tests:** Test end-to-end payment flows
3. **Load Testing:** Test webhook handling under load
4. **Chaos Testing:** Test webhook failure scenarios

## Quick Start Commands

```bash
# 1. Install Stripe CLI
brew install stripe/stripe-cli/stripe

# 2. Login to Stripe
stripe login

# 3. Start webhook forwarding
stripe listen --forward-to localhost:3001/api/webhooks

# 4. In another terminal, trigger test events
stripe trigger payment_intent.succeeded

# 5. Check your application logs
docker-compose logs -f api
```

## Additional Resources

- [Stripe Webhooks Documentation](https://stripe.com/docs/webhooks)
- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)
- [Testing Webhooks Guide](https://stripe.com/docs/webhooks/test)
- [Webhook Best Practices](https://stripe.com/docs/webhooks/best-practices)

---

**Need Help?** Check the troubleshooting section or visit the [Stripe Discord](https://stripe.com/discord) for community support.
