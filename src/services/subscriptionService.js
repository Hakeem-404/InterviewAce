import { supabase } from '../lib/supabaseClient';
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Subscription plans
export const SUBSCRIPTION_PLANS = {
  FREE: {
    id: 'free',
    name: 'Free',
    description: 'Basic features with limited usage',
    price: 0,
    features: [
      '5 interview questions per month',
      'Basic AI feedback',
      'Text-only interface',
      'Limited question types'
    ],
    limitations: [
      'No voice features',
      'No advanced analytics',
      'Limited question customization',
      'No interview history'
    ],
    monthlyQuestionLimit: 5
  },
  PREMIUM_MONTHLY: {
    id: 'premium_monthly',
    name: 'Premium Monthly',
    description: 'Full access with monthly billing',
    price: 19.99,
    interval: 'month',
    features: [
      'Unlimited interview questions',
      'Advanced AI feedback',
      'Voice mode with 6 AI voices',
      'Detailed analytics',
      'Custom interview configurations',
      'Full interview history',
      'Priority support'
    ],
    stripePriceId: import.meta.env.VITE_STRIPE_PRICE_MONTHLY || 'price_monthly'
  },
  PREMIUM_YEARLY: {
    id: 'premium_yearly',
    name: 'Premium Yearly',
    description: 'Full access with annual billing (save 17%)',
    price: 199.99,
    interval: 'year',
    features: [
      'All Premium Monthly features',
      'Save 17% compared to monthly',
      'Early access to new features',
      'Downloadable interview reports',
      'Interview readiness score'
    ],
    stripePriceId: import.meta.env.VITE_STRIPE_PRICE_YEARLY || 'price_yearly'
  }
};

export const subscriptionService = {
  // Get current user's subscription
  async getUserSubscription(userId) {
    try {
      if (!userId) return null;

      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        // If no subscription found, return free tier
        if (error.code === 'PGRST116') {
          return {
            plan: SUBSCRIPTION_PLANS.FREE.id,
            status: 'active',
            current_period_end: null,
            cancel_at_period_end: false
          };
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to get user subscription:', error);
      // Default to free tier on error
      return {
        plan: SUBSCRIPTION_PLANS.FREE.id,
        status: 'active',
        current_period_end: null,
        cancel_at_period_end: false
      };
    }
  },

  // Check if user has premium features
  async hasPremiumAccess(userId) {
    try {
      const subscription = await this.getUserSubscription(userId);
      
      if (!subscription) return false;
      
      // Check if subscription is active and premium
      return (
        subscription.status === 'active' && 
        (subscription.plan === SUBSCRIPTION_PLANS.PREMIUM_MONTHLY.id || 
         subscription.plan === SUBSCRIPTION_PLANS.PREMIUM_YEARLY.id)
      );
    } catch (error) {
      console.error('Failed to check premium access:', error);
      return false;
    }
  },

  // Get user's usage for the current month
  async getUserUsage(userId) {
    try {
      if (!userId) return { used: 0, limit: 0, remaining: 0 };

      // Get current month's first and last day
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      // Query usage_tracking table
      const { data, error } = await supabase
        .from('usage_tracking')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', firstDay.toISOString())
        .lte('created_at', lastDay.toISOString());

      if (error) throw error;

      // Get subscription to determine limit
      const subscription = await this.getUserSubscription(userId);
      const isPremium = subscription && 
        (subscription.plan === SUBSCRIPTION_PLANS.PREMIUM_MONTHLY.id || 
         subscription.plan === SUBSCRIPTION_PLANS.PREMIUM_YEARLY.id);

      // Calculate usage
      const questionCount = data.reduce((sum, record) => sum + (record.questions_used || 0), 0);
      const limit = isPremium ? Infinity : SUBSCRIPTION_PLANS.FREE.monthlyQuestionLimit;
      const remaining = isPremium ? Infinity : Math.max(0, limit - questionCount);

      return {
        used: questionCount,
        limit,
        remaining,
        isPremium
      };
    } catch (error) {
      console.error('Failed to get user usage:', error);
      return { used: 0, limit: 0, remaining: 0, isPremium: false };
    }
  },

  // Track usage of questions
  async trackUsage(userId, questionCount = 1, featureType = 'question') {
    try {
      if (!userId) return false;

      const { error } = await supabase
        .from('usage_tracking')
        .insert([{
          user_id: userId,
          questions_used: questionCount,
          feature_type: featureType,
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Failed to track usage:', error);
      return false;
    }
  },

  // Check if user can use a feature (has enough remaining usage)
  async canUseFeature(userId, featureType = 'question', count = 1) {
    try {
      // If premium, always allow
      const hasPremium = await this.hasPremiumAccess(userId);
      if (hasPremium) return true;

      // For free tier, check usage limits
      if (featureType === 'question') {
        const usage = await this.getUserUsage(userId);
        return usage.remaining >= count;
      }

      // For premium-only features
      if (['voice', 'analytics', 'history', 'custom'].includes(featureType)) {
        return false; // These features require premium
      }

      return true; // Default allow for other features
    } catch (error) {
      console.error('Failed to check feature access:', error);
      return false;
    }
  },

  // Create Stripe Checkout session
  async createCheckoutSession(userId, priceId, successUrl, cancelUrl) {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          userId,
          priceId,
          successUrl,
          cancelUrl
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to create checkout session:', error);
      throw error;
    }
  },

  // Create Stripe Customer Portal session
  async createCustomerPortalSession(userId, returnUrl) {
    try {
      const { data, error } = await supabase.functions.invoke('create-customer-portal', {
        body: {
          userId,
          returnUrl
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to create customer portal session:', error);
      throw error;
    }
  },

  // Redirect to Stripe Checkout
  async redirectToCheckout(planId, successUrl, cancelUrl) {
    try {
      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe failed to load');

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get price ID from plan
      const plan = Object.values(SUBSCRIPTION_PLANS).find(p => p.id === planId);
      if (!plan || !plan.stripePriceId) {
        throw new Error('Invalid plan or missing price ID');
      }

      // Create checkout session
      const { sessionId } = await this.createCheckoutSession(
        user.id,
        plan.stripePriceId,
        successUrl || window.location.origin + '/profile',
        cancelUrl || window.location.origin + '/pricing'
      );

      // Redirect to checkout
      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) throw error;

    } catch (error) {
      console.error('Failed to redirect to checkout:', error);
      throw error;
    }
  },

  // Redirect to Customer Portal
  async redirectToCustomerPortal(returnUrl) {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create portal session
      const { url } = await this.createCustomerPortalSession(
        user.id,
        returnUrl || window.location.origin + '/profile'
      );

      // Redirect to portal
      window.location.href = url;
    } catch (error) {
      console.error('Failed to redirect to customer portal:', error);
      throw error;
    }
  },

  // Get subscription analytics
  async getSubscriptionAnalytics(userId) {
    try {
      if (!userId) return null;

      // Get subscription history
      const { data, error } = await supabase
        .from('subscription_events')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Calculate metrics
      const subscriptionStart = data.find(event => event.type === 'subscription_created')?.created_at;
      const upgrades = data.filter(event => event.type === 'subscription_updated').length;
      const renewals = data.filter(event => event.type === 'subscription_renewed').length;

      return {
        subscriptionStart,
        totalSpent: data.reduce((sum, event) => sum + (event.amount || 0), 0),
        upgrades,
        renewals,
        lifetimeValue: data.reduce((sum, event) => sum + (event.amount || 0), 0),
        events: data
      };
    } catch (error) {
      console.error('Failed to get subscription analytics:', error);
      return null;
    }
  }
};