# Stripe Integration Documentation

## API Keys

The following API keys are configured for the Facebook Group Discovery platform:

### Test Environment Keys

These keys are currently being used for testing and development:

- **Publishable Key**: `pk_test_51RALhqPYjlAr0Vm65UaVQIT151ZcKNHb698saQOGnLEXy4dGBu3C1YYmFneRJyDPvJvbkvmb5GI071LX2RM419RT00zDoWgvZk`
- **Secret Key**: `sk_test_51RALhqPYjlAr0Vm6CqJMZRZ6xYBGFEhjMOyUYXLW5CLhDBeSzeLmacTeyhjYREaGIJyF1Fm2I06dCd81Q6RAvAKJ00D4Ck0KSW`
- **Restricted Key** (for Stripe Agent Toolkit): `rk_test_51RALhqPYjlAr0Vm6jNcfXMshAKqOMhN03tOZLP45177yeXxC2HY1Py3Fzbb67v8meWs60XogQILzlXR28qGDWvaZ00ZwD05Tv8`

> ⚠️ **WARNING**: These keys should be stored securely in environment variables, not in version-controlled files. They are documented here for reference only.

## Webhook Configuration

### Current Webhook Endpoint

The current production webhook endpoint is set to:

```
https://fb-group-discovery-site.vercel.app/api/webhooks/stripe
```

> ⚠️ **IMPORTANT**: Update this to the custom domain once available. The Vercel deployment URLs change with each deployment.

### Webhook Events

The following webhook events are configured:

- `payment_intent.succeeded` - For handling successful payments (featured listings)
- `invoice.paid` - For handling successful subscription payments
- `invoice.payment_failed` - For handling failed subscription payments
- `customer.subscription.deleted` - For handling subscription cancellations
- `customer.subscription.updated` - For handling subscription updates

## Environment Variables

Add these variables to your Vercel environment or `.env.local` file (never commit this file):

```
STRIPE_SECRET_KEY=sk_test_51RALhqPYjlAr0Vm6CqJMZRZ6xYBGFEhjMOyUYXLW5CLhDBeSzeLmacTeyhjYREaGIJyF1Fm2I06dCd81Q6RAvAKJ00D4Ck0KSW
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51RALhqPYjlAr0Vm65UaVQIT151ZcKNHb698saQOGnLEXy4dGBu3C1YYmFneRJyDPvJvbkvmb5GI071LX2RM419RT00zDoWgvZk
STRIPE_WEBHOOK_SECRET=whsec_cLRGThUijHNYI7UtaGrWj...
```

## Migrating to Production

When ready to move to production:

1. Replace all test keys with production keys in the Vercel environment variables
2. Update the webhook endpoint URL to your production domain
3. Register the new webhook endpoint in the Stripe dashboard
4. Obtain a new webhook signing secret and update the environment variable

## API Usage

Our app uses Stripe for:

1. **Premium Memberships** - Subscription-based tiers
2. **Featured Listings** - One-time promotional payments
3. **Verified Group Program** - Application fee processing

## Stripe Agent Toolkit Configuration

The Stripe Agent Toolkit is configured with a restricted API key that has the following permissions:

- Customers: Write
- Products: Read
- Prices: Read
- Subscriptions: Write
- Payment Intents: Write
- Checkout Sessions: Write
- Webhook Endpoints: Write

To run the toolkit locally:

```
npx @stripe/agent-toolkit --stripe-api-key=rk_test_51RALhqPYjlAr0Vm6jNcfXMshAKqOMhN03tOZLP45177yeXxC2HY1Py3Fzbb67v8meWs60XogQILzlXR28qGDWvaZ00ZwD05Tv8
```

## Testing

For local webhook testing, use the Stripe CLI:

```
stripe listen --forward-to http://localhost:3000/api/webhooks/stripe
```

## Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Stripe Agent Toolkit Documentation](https://github.com/stripe/stripe-agent-toolkit) 