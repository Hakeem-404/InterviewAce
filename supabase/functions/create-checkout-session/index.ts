import { corsHeaders } from "../_shared/cors.ts";
import Stripe from 'npm:stripe@12.0.0';

// Initialize Stripe with your secret key
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { userId, priceId, successUrl, cancelUrl } = await req.json();
    
    if (!userId || !priceId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get or create Stripe customer
    let customerId;
    
    // Check if user already has a Stripe customer ID
    const { data: subscriptions, error: subscriptionError } = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/rest/v1/user_subscriptions?user_id=eq.${userId}&select=stripe_customer_id`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
        }
      }
    ).then(res => res.json());

    if (subscriptionError) throw subscriptionError;

    if (subscriptions && subscriptions.length > 0 && subscriptions[0].stripe_customer_id) {
      customerId = subscriptions[0].stripe_customer_id;
    } else {
      // Get user details from Supabase
      const { data: users, error: userError } = await fetch(
        `${Deno.env.get('SUPABASE_URL')}/rest/v1/auth/users?id=eq.${userId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
          }
        }
      ).then(res => res.json());

      if (userError) throw userError;
      if (!users || users.length === 0) {
        throw new Error('User not found');
      }

      const user = users[0];

      // Create a new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.user_metadata?.full_name || user.email,
        metadata: {
          userId
        }
      });

      customerId = customer.id;
    }

    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl || `${Deno.env.get('SITE_URL')}/subscription/success`,
      cancel_url: cancelUrl || `${Deno.env.get('SITE_URL')}/pricing`,
      metadata: {
        userId
      }
    });

    return new Response(
      JSON.stringify({ 
        sessionId: session.id,
        url: session.url
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error creating checkout session:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: 'Failed to create checkout session'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});