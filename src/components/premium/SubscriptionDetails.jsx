import React from 'react';
import { Calendar, CreditCard, Shield, Settings, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { useSubscription } from '../../context/SubscriptionContext';
import Button from '../Button';

const SubscriptionDetails = ({ className = '' }) => {
  const { 
    subscription, 
    getCurrentPlan, 
    formatSubscriptionEndDate, 
    isSubscriptionExpiringSoon,
    manageSubscription,
    loading
  } = useSubscription();

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-soft p-6 border border-gray-200 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!subscription) return null;

  const currentPlan = getCurrentPlan();
  const isPremium = currentPlan.id !== 'free';
  const isActive = subscription.status === 'active';
  const isCancelled = subscription.cancel_at_period_end;
  const nextBillingDate = formatSubscriptionEndDate();
  const isExpiringSoon = isSubscriptionExpiringSoon();

  return (
    <div className={`bg-white rounded-xl shadow-soft p-6 border border-gray-200 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${isPremium ? 'bg-blue-100' : 'bg-gray-100'}`}>
            <CreditCard className={`h-6 w-6 ${isPremium ? 'text-blue-600' : 'text-gray-600'}`} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {currentPlan.name} Plan
            </h3>
            <p className="text-gray-600">
              {isPremium ? 'Premium subscription' : 'Free tier'}
            </p>
          </div>
        </div>
        
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          isActive && !isCancelled ? 'bg-green-100 text-green-800' : 
          isActive && isCancelled ? 'bg-yellow-100 text-yellow-800' : 
          'bg-red-100 text-red-800'
        }`}>
          {isActive && !isCancelled ? 'Active' : 
           isActive && isCancelled ? 'Cancelling' : 
           'Inactive'}
        </div>
      </div>
      
      {isPremium && (
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gray-500" />
              <span className="text-gray-900">Next billing date</span>
            </div>
            <span className="font-medium text-gray-900">{nextBillingDate}</span>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-gray-500" />
              <span className="text-gray-900">Billing amount</span>
            </div>
            <span className="font-medium text-gray-900">${currentPlan.price}</span>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <RefreshCw className="h-5 w-5 text-gray-500" />
              <span className="text-gray-900">Billing cycle</span>
            </div>
            <span className="font-medium text-gray-900 capitalize">{currentPlan.interval}ly</span>
          </div>
        </div>
      )}
      
      {/* Status Messages */}
      {isPremium && isCancelled && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <p className="text-yellow-800 font-medium">Your subscription is set to cancel</p>
            <p className="text-yellow-700 text-sm">
              You'll have access to premium features until {nextBillingDate}. After that, your account will revert to the free plan.
            </p>
          </div>
        </div>
      )}
      
      {isPremium && isExpiringSoon && !isCancelled && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <p className="text-blue-800 font-medium">Your subscription will renew soon</p>
            <p className="text-blue-700 text-sm">
              Your next billing date is {nextBillingDate}. Your card will be charged ${currentPlan.price}.
            </p>
          </div>
        </div>
      )}
      
      {/* Free Plan Message */}
      {!isPremium && (
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-gray-700 mb-3">
            You're currently on the free plan with limited features.
          </p>
          <ul className="space-y-2">
            <li className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>5 interview questions per month</span>
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Basic AI feedback</span>
            </li>
          </ul>
        </div>
      )}
      
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        {isPremium ? (
          <Button
            onClick={() => manageSubscription()}
            className="flex items-center justify-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Manage Subscription
          </Button>
        ) : (
          <Button
            onClick={() => window.location.href = '/pricing'}
            className="flex items-center justify-center gap-2"
          >
            <Shield className="h-4 w-4" />
            Upgrade to Premium
          </Button>
        )}
      </div>
    </div>
  );
};

export default SubscriptionDetails;