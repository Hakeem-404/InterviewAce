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
    const { userId, returnUrl } = await req.json();
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Missing userId parameter' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get user's Stripe customer ID
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

    if (!subscriptions || subscriptions.length === 0 || !subscriptions[0].stripe_customer_id) {
      throw new Error('No Stripe customer found for this user');
    }

    const customerId = subscriptions[0].stripe_customer_id;

    // Create a customer portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl || `${Deno.env.get('SITE_URL')}/profile`,
    });

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error creating customer portal session:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: 'Failed to create customer portal session'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});