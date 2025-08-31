# Stripe Webhook Setup Guide

This guide explains how to properly set up Stripe webhooks to ensure orders are created after successful payments.

## 🚀 Quick Setup

### 1. Install Stripe CLI
```bash
# Using npm
npm install -g stripe

# Using Homebrew (macOS)
brew install stripe/stripe-cli/stripe
```

### 2. Login to Stripe
```bash
stripe login
```

### 3. Run Setup Script
```bash
# For local development
./setup-webhook.sh http://localhost:3001/api/webhooks

# For Docker development
./setup-webhook.sh http://api:3001/api/webhooks

# For production
./setup-webhook.sh https://yourdomain.com/api/webhooks
```

## 🔧 Manual Setup (Alternative)

If the automated script doesn't work:

1. Go to [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Enter your webhook URL:
   - Local: `http://localhost:3001/api/webhooks`
   - Docker: `http://api:3001/api/webhooks`
   - Production: `https://yourdomain.com/api/webhooks`
4. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the webhook secret and add to your `.env`:
   ```env
   STRIPE_WEBHOOK_SECRET="whsec_..."
   ```

## 🧪 Testing Webhooks

### Using Stripe CLI (Recommended)
```bash
# Start listening for webhooks
stripe listen --forward-to="http://localhost:3001/api/webhooks"

# In another terminal, trigger a test event
stripe trigger payment_intent.succeeded
```

### Using Stripe Dashboard
1. Go to [Stripe Dashboard > Events](https://dashboard.stripe.com/events)
2. Find a successful payment event
3. Click "Send test webhook"

## 🔍 Troubleshooting

### Common Issues

#### 1. "Failed to fetch order details"
**Cause**: Webhook didn't process or order wasn't created
**Solution**:
- Check webhook endpoint is configured correctly
- Verify `STRIPE_WEBHOOK_SECRET` is set in `.env`
- Check API logs for webhook processing errors
- Ensure database is accessible

#### 2. "Webhook signature verification failed"
**Cause**: Webhook secret mismatch
**Solution**:
- Verify `STRIPE_WEBHOOK_SECRET` matches the one from Stripe Dashboard
- Ensure webhook secret is properly quoted in `.env`
- Check for extra spaces or characters

#### 3. "Order not found" for real payments
**Cause**: Webhook processing delay or failure
**Solution**:
- Wait a few seconds and refresh the success page
- Check Stripe Dashboard for webhook delivery status
- Verify webhook endpoint is accessible from Stripe

#### 4. Webhook not receiving events
**Cause**: Network connectivity or URL issues
**Solution**:
- For local development, use ngrok or similar tunneling service
- Ensure webhook URL is publicly accessible
- Check firewall settings
- Verify SSL certificate for HTTPS URLs

### Debugging Steps

1. **Check webhook delivery**:
   ```bash
   # View recent webhook attempts in Stripe Dashboard
   # Look for failed deliveries and error messages
   ```

2. **Test webhook endpoint**:
   ```bash
   curl -X POST http://localhost:3001/api/webhooks \
     -H "Content-Type: application/json" \
     -d '{"type":"payment_intent.succeeded","data":{"object":{"id":"pi_test"}}}'
   ```

3. **Check API logs**:
   ```bash
   # View Docker logs
   docker-compose logs -f api

   # Or check local logs
   tail -f /path/to/api/logs
   ```

4. **Verify database connectivity**:
   ```bash
   docker-compose exec db psql -U user -d saas_db -c "SELECT * FROM orders;"
   ```

## 📋 Webhook Events Handled

### `payment_intent.succeeded`
- Creates order record in database
- Links order to user (creates user if doesn't exist)
- Sets order status to 'completed'
- Includes all payment and customer metadata

### `payment_intent.payment_failed`
- Updates order status to 'failed' if order exists
- Logs payment failure for debugging

## 🔒 Security Best Practices

1. **Always verify webhook signatures** - Never trust unsigned webhooks
2. **Use HTTPS** - Stripe requires HTTPS for production webhooks
3. **Implement idempotency** - Handle duplicate webhook events gracefully
4. **Validate event data** - Ensure required fields are present
5. **Monitor webhook health** - Set up alerts for failed deliveries

## 🚀 Production Deployment

### Environment Variables
```env
STRIPE_WEBHOOK_SECRET="whsec_your_production_secret"
STRIPE_SECRET_KEY="sk_live_..."
```

### Webhook URL
- Use your production domain
- Ensure SSL certificate is valid
- Configure proper firewall rules

### Monitoring
- Set up webhook delivery monitoring in Stripe Dashboard
- Implement logging for webhook processing
- Create alerts for failed webhook deliveries

## 📞 Support

If you continue having issues:

1. Check [Stripe Webhook Documentation](https://stripe.com/docs/webhooks)
2. Review [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)
3. Contact Stripe Support with webhook ID and error details
