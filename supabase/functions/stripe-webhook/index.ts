import { corsHeaders } from "../_shared/cors.ts";
import Stripe from 'npm:stripe@12.0.0';

// Initialize Stripe with your secret key
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

// Webhook secret for verifying events
const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return new Response(
        JSON.stringify({ error: 'Missing stripe-signature header' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Verify webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return new Response(
        JSON.stringify({ error: `Webhook signature verification failed: ${err.message}` }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      case 'invoice.paid':
        await handleInvoicePaid(event.data.object);
        break;
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error processing webhook:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: 'Failed to process webhook'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

// Handler functions for different webhook events

async function handleCheckoutSessionCompleted(session) {
  // Get customer and subscription details
  const subscription = await stripe.subscriptions.retrieve(session.subscription);
  const customerId = session.customer;
  const userId = session.metadata.userId;

  if (!userId) {
    console.error('No userId found in session metadata');
    return;
  }

  // Determine subscription plan
  const planId = getPlanIdFromPriceId(subscription.items.data[0].price.id);

  // Update or create user subscription in Supabase
  await updateUserSubscription(userId, customerId, subscription.id, planId, subscription.status, subscription.current_period_start, subscription.current_period_end, subscription.cancel_at_period_end);

  // Record subscription event
  await recordSubscriptionEvent(userId, 'subscription_created', session.id, subscription.items.data[0].price.unit_amount / 100, planId);
}

async function handleSubscriptionCreated(subscription) {
  // Get customer details
  const customer = await stripe.customers.retrieve(subscription.customer);
  const userId = customer.metadata.userId;

  if (!userId) {
    console.error('No userId found in customer metadata');
    return;
  }

  // Determine subscription plan
  const planId = getPlanIdFromPriceId(subscription.items.data[0].price.id);

  // Update or create user subscription in Supabase
  await updateUserSubscription(userId, subscription.customer, subscription.id, planId, subscription.status, subscription.current_period_start, subscription.current_period_end, subscription.cancel_at_period_end);

  // Record subscription event
  await recordSubscriptionEvent(userId, 'subscription_created', subscription.id, subscription.items.data[0].price.unit_amount / 100, planId);
}

async function handleSubscriptionUpdated(subscription) {
  // Get customer details
  const customer = await stripe.customers.retrieve(subscription.customer);
  const userId = customer.metadata.userId;

  if (!userId) {
    console.error('No userId found in customer metadata');
    return;
  }

  // Determine subscription plan
  const planId = getPlanIdFromPriceId(subscription.items.data[0].price.id);

  // Update user subscription in Supabase
  await updateUserSubscription(userId, subscription.customer, subscription.id, planId, subscription.status, subscription.current_period_start, subscription.current_period_end, subscription.cancel_at_period_end);

  // Record subscription event
  await recordSubscriptionEvent(userId, 'subscription_updated', subscription.id, 0, planId);
}

async function handleSubscriptionDeleted(subscription) {
  // Get customer details
  const customer = await stripe.customers.retrieve(subscription.customer);
  const userId = customer.metadata.userId;

  if (!userId) {
    console.error('No userId found in customer metadata');
    return;
  }

  // Update user subscription in Supabase
  await updateUserSubscription(userId, subscription.customer, subscription.id, 'free', 'canceled', null, null, false);

  // Record subscription event
  await recordSubscriptionEvent(userId, 'subscription_canceled', subscription.id, 0, 'free');
}

async function handleInvoicePaid(invoice) {
  if (!invoice.subscription) return;

  // Get subscription details
  const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
  const customer = await stripe.customers.retrieve(subscription.customer);
  const userId = customer.metadata.userId;

  if (!userId) {
    console.error('No userId found in customer metadata');
    return;
  }

  // Determine subscription plan
  const planId = getPlanIdFromPriceId(subscription.items.data[0].price.id);

  // Update user subscription in Supabase
  await updateUserSubscription(userId, subscription.customer, subscription.id, planId, subscription.status, subscription.current_period_start, subscription.current_period_end, subscription.cancel_at_period_end);

  // Record subscription event
  await recordSubscriptionEvent(userId, 'invoice_paid', invoice.id, invoice.amount_paid / 100, planId);
}

async function handleInvoicePaymentFailed(invoice) {
  if (!invoice.subscription) return;

  // Get subscription details
  const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
  const customer = await stripe.customers.retrieve(subscription.customer);
  const userId = customer.metadata.userId;

  if (!userId) {
    console.error('No userId found in customer metadata');
    return;
  }

  // Record subscription event
  await recordSubscriptionEvent(userId, 'payment_failed', invoice.id, 0, null);
}

// Helper functions

function getPlanIdFromPriceId(priceId) {
  // Map Stripe price IDs to our plan IDs
  const priceToPlans = {
    'price_monthly': 'premium_monthly',
    'price_yearly': 'premium_yearly'
  };
  
  return priceToPlans[priceId] || 'premium_monthly';
}

async function updateUserSubscription(userId, customerId, subscriptionId, planId, status, periodStart, periodEnd, cancelAtPeriodEnd) {
  try {
    // Check if subscription exists
    const { data: existingSubscriptions, error: checkError } = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/rest/v1/user_subscriptions?user_id=eq.${userId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
        }
      }
    ).then(res => res.json());

    if (checkError) throw checkError;

    const subscriptionData = {
      user_id: userId,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      plan: planId,
      status,
      current_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : null,
      current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
      cancel_at_period_end: cancelAtPeriodEnd,
      updated_at: new Date().toISOString()
    };

    if (existingSubscriptions && existingSubscriptions.length > 0) {
      // Update existing subscription
      const { error: updateError } = await fetch(
        `${Deno.env.get('SUPABASE_URL')}/rest/v1/user_subscriptions?user_id=eq.${userId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
          },
          body: JSON.stringify(subscriptionData)
        }
      );

      if (updateError) throw updateError;
    } else {
      // Create new subscription
      const { error: insertError } = await fetch(
        `${Deno.env.get('SUPABASE_URL')}/rest/v1/user_subscriptions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
          },
          body: JSON.stringify({
            ...subscriptionData,
            created_at: new Date().toISOString()
          })
        }
      );

      if (insertError) throw insertError;
    }
  } catch (error) {
    console.error('Error updating user subscription:', error);
    throw error;
  }
}

async function recordSubscriptionEvent(userId, type, stripeEventId, amount, plan) {
  try {
    const { error } = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/rest/v1/subscription_events`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
        },
        body: JSON.stringify({
          user_id: userId,
          type,
          stripe_event_id: stripeEventId,
          amount,
          plan,
          created_at: new Date().toISOString()
        })
      }
    );

    if (error) throw error;
  } catch (error) {
    console.error('Error recording subscription event:', error);
    throw error;
  }
}