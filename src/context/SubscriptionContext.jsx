import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { subscriptionService, SUBSCRIPTION_PLANS } from '../services/subscriptionService';
import { useToast } from '../hooks/useToast';

const SubscriptionContext = createContext();

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

export const SubscriptionProvider = ({ children }) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [subscription, setSubscription] = useState(null);
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);

  // Load subscription data when user changes
  useEffect(() => {
    if (user) {
      loadSubscriptionData();
    } else {
      // Reset to free tier when logged out
      setSubscription({
        plan: SUBSCRIPTION_PLANS.FREE.id,
        status: 'active',
        current_period_end: null,
        cancel_at_period_end: false
      });
      setUsage({
        used: 0,
        limit: SUBSCRIPTION_PLANS.FREE.monthlyQuestionLimit,
        remaining: SUBSCRIPTION_PLANS.FREE.monthlyQuestionLimit,
        isPremium: false
      });
      setLoading(false);
    }
  }, [user]);

  const loadSubscriptionData = async () => {
    try {
      setLoading(true);
      
      // Load subscription, usage, and analytics in parallel
      const [subscriptionData, usageData, analyticsData] = await Promise.all([
        subscriptionService.getUserSubscription(user.id),
        subscriptionService.getUserUsage(user.id),
        subscriptionService.getSubscriptionAnalytics(user.id)
      ]);
      
      setSubscription(subscriptionData);
      setUsage(usageData);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Failed to load subscription data:', error);
      addToast('Failed to load subscription data', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Check if user has premium access
  const isPremium = subscription && 
    (subscription.plan === SUBSCRIPTION_PLANS.PREMIUM_MONTHLY.id || 
     subscription.plan === SUBSCRIPTION_PLANS.PREMIUM_YEARLY.id) &&
    subscription.status === 'active';

  // Check if user can use a specific feature
  const canUseFeature = async (featureType = 'question', count = 1) => {
    if (!user) return false;
    
    try {
      return await subscriptionService.canUseFeature(user.id, featureType, count);
    } catch (error) {
      console.error('Failed to check feature access:', error);
      return false;
    }
  };

  // Track usage of a feature
  const trackUsage = async (featureType = 'question', count = 1) => {
    if (!user) return false;
    
    try {
      const tracked = await subscriptionService.trackUsage(user.id, count, featureType);
      
      // Refresh usage data after tracking
      if (tracked) {
        const newUsage = await subscriptionService.getUserUsage(user.id);
        setUsage(newUsage);
      }
      
      return tracked;
    } catch (error) {
      console.error('Failed to track usage:', error);
      return false;
    }
  };

  // Upgrade to premium
  const upgradeToPremium = async (planId, successUrl, cancelUrl) => {
    try {
      await subscriptionService.redirectToCheckout(
        planId, 
        successUrl || window.location.origin + '/profile',
        cancelUrl || window.location.origin + '/pricing'
      );
      return true;
    } catch (error) {
      console.error('Failed to upgrade to premium:', error);
      addToast('Failed to start checkout process', 'error');
      return false;
    }
  };

  // Manage subscription
  const manageSubscription = async (returnUrl) => {
    try {
      await subscriptionService.redirectToCustomerPortal(
        returnUrl || window.location.origin + '/profile'
      );
      return true;
    } catch (error) {
      console.error('Failed to open customer portal:', error);
      addToast('Failed to open subscription management', 'error');
      return false;
    }
  };

  // Get current plan details
  const getCurrentPlan = () => {
    if (!subscription) return SUBSCRIPTION_PLANS.FREE;
    
    const planId = subscription.plan;
    return Object.values(SUBSCRIPTION_PLANS).find(plan => plan.id === planId) || SUBSCRIPTION_PLANS.FREE;
  };

  // Format subscription end date
  const formatSubscriptionEndDate = () => {
    if (!subscription || !subscription.current_period_end) return 'N/A';
    
    return new Date(subscription.current_period_end).toLocaleDateString();
  };

  // Check if subscription is about to expire
  const isSubscriptionExpiringSoon = () => {
    if (!subscription || !subscription.current_period_end) return false;
    
    const endDate = new Date(subscription.current_period_end);
    const now = new Date();
    const daysUntilExpiry = Math.floor((endDate - now) / (1000 * 60 * 60 * 24));
    
    return daysUntilExpiry <= 7;
  };

  // Refresh subscription data
  const refreshSubscription = async () => {
    return loadSubscriptionData();
  };

  const value = {
    subscription,
    usage,
    loading,
    analytics,
    isPremium,
    canUseFeature,
    trackUsage,
    upgradeToPremium,
    manageSubscription,
    getCurrentPlan,
    formatSubscriptionEndDate,
    isSubscriptionExpiringSoon,
    refreshSubscription,
    SUBSCRIPTION_PLANS
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};