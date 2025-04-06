import { createServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import Stripe from 'stripe';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

/**
 * Handle OPTIONS requests for CORS preflight
 */
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

/**
 * Handle Stripe webhook events
 */
export async function POST(request: NextRequest) {
  try {
    // Get the stripe signature from the request headers
    const signature = request.headers.get('stripe-signature');
    
    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' }, 
        { status: 400, headers: corsHeaders }
      );
    }
    
    // Get the raw request body
    const body = await request.text();
    
    // Verify webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (error: any) {
      console.error('Webhook signature verification failed:', error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    // Create Supabase client
    const cookieStore = cookies();
    const supabase = createServerClient(cookieStore);
    
    // Process different webhook events
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        // Check if this is for a featured listing
        if (paymentIntent.metadata?.group_id && paymentIntent.metadata?.promotion_type) {
          await handlePromotionPaymentSuccess(supabase, paymentIntent);
        }
        
        break;
      }
      
      case 'invoice.paid': {
        // Handle subscription invoice payment
        const invoice = event.data.object as Stripe.Invoice;
        await handleSubscriptionInvoicePaid(supabase, invoice);
        break;
      }
      
      case 'invoice.payment_failed': {
        // Handle subscription payment failure
        const invoice = event.data.object as Stripe.Invoice;
        await handleSubscriptionPaymentFailed(supabase, invoice);
        break;
      }
      
      case 'customer.subscription.deleted': {
        // Handle subscription cancellation
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCancelled(supabase, subscription);
        break;
      }
      
      case 'customer.subscription.updated': {
        // Handle subscription update
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(supabase, subscription);
        break;
      }
    }
    
    // Return a success response with CORS headers
    return NextResponse.json({ received: true }, { headers: corsHeaders });
  } catch (error) {
    console.error('Unexpected error in Stripe webhook handler:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * Handle successful promotion payment
 */
async function handlePromotionPaymentSuccess(supabase: any, paymentIntent: Stripe.PaymentIntent) {
  const { group_id, user_id, promotion_type } = paymentIntent.metadata;
  
  // Update featured listing status to active
  await supabase
    .from('featured_listings')
    .update({ status: 'active' })
    .eq('group_id', group_id)
    .eq('user_id', user_id)
    .eq('promotion_type', promotion_type)
    .eq('status', 'pending');
  
  // Update payment history
  await supabase
    .from('payment_history')
    .update({ status: 'completed' })
    .eq('reference_id', paymentIntent.id)
    .eq('user_id', user_id);
}

/**
 * Handle successful subscription invoice payment
 */
async function handleSubscriptionInvoicePaid(supabase: any, invoice: Stripe.Invoice) {
  if (!invoice.subscription) return;
  
  // Update subscription status
  await supabase
    .from('subscriptions')
    .update({ status: 'active' })
    .eq('stripe_subscription_id', invoice.subscription);
  
  // Get user ID from the subscription
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('user_id, plan_id')
    .eq('stripe_subscription_id', invoice.subscription)
    .single();
  
  if (subscription) {
    // Update user's subscription status
    await supabase
      .from('users')
      .update({ 
        subscription_status: 'active',
        subscription_tier: subscription.plan_id
      })
      .eq('id', subscription.user_id);
    
    // Add to payment history
    await supabase.from('payment_history').insert({
      user_id: subscription.user_id,
      amount: invoice.amount_paid / 100, // Convert from cents
      currency: invoice.currency,
      payment_method: 'card',
      status: 'completed',
      type: 'subscription',
      reference_id: invoice.id,
    });
  }
}

/**
 * Handle failed subscription invoice payment
 */
async function handleSubscriptionPaymentFailed(supabase: any, invoice: Stripe.Invoice) {
  if (!invoice.subscription) return;
  
  // Update subscription status
  await supabase
    .from('subscriptions')
    .update({ status: 'past_due' })
    .eq('stripe_subscription_id', invoice.subscription);
  
  // Get user ID from the subscription
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_subscription_id', invoice.subscription)
    .single();
  
  if (subscription) {
    // Update user's subscription status
    await supabase
      .from('users')
      .update({ subscription_status: 'past_due' })
      .eq('id', subscription.user_id);
    
    // Add to payment history
    await supabase.from('payment_history').insert({
      user_id: subscription.user_id,
      amount: invoice.amount_due / 100, // Convert from cents
      currency: invoice.currency,
      payment_method: 'card',
      status: 'failed',
      type: 'subscription',
      reference_id: invoice.id,
    });
  }
}

/**
 * Handle subscription cancellation
 */
async function handleSubscriptionCancelled(supabase: any, subscription: Stripe.Subscription) {
  // Update subscription status
  await supabase
    .from('subscriptions')
    .update({ status: 'cancelled' })
    .eq('stripe_subscription_id', subscription.id);
  
  // Get user ID from the subscription
  const { data: subscriptionData } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_subscription_id', subscription.id)
    .single();
  
  if (subscriptionData) {
    // Update user's subscription status
    await supabase
      .from('users')
      .update({ 
        subscription_status: 'none',
        subscription_tier: 'basic'
      })
      .eq('id', subscriptionData.user_id);
  }
}

/**
 * Handle subscription update
 */
async function handleSubscriptionUpdated(supabase: any, subscription: Stripe.Subscription) {
  // Update subscription record
  await supabase
    .from('subscriptions')
    .update({ 
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);
  
  // Get user ID from the subscription
  const { data: subscriptionData } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_subscription_id', subscription.id)
    .single();
  
  if (subscriptionData) {
    // Update user's subscription status
    await supabase
      .from('users')
      .update({ subscription_status: subscription.status })
      .eq('id', subscriptionData.user_id);
  }
} 