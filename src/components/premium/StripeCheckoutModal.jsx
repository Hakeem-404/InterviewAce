import React, { useState } from 'react';
import { X, CreditCard, CheckCircle, ArrowRight } from 'lucide-react';
import { useSubscription } from '../../context/SubscriptionContext';
import StripeCheckout from './StripeCheckout';

const StripeCheckoutModal = ({ isOpen, onClose, planId }) => {
  const { SUBSCRIPTION_PLANS, upgradeToPremium } = useSubscription();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  // Get plan details
  const plan = Object.values(SUBSCRIPTION_PLANS).find(p => p.id === planId) || SUBSCRIPTION_PLANS.PREMIUM_MONTHLY;

  const handleSuccess = () => {
    setIsSuccess(true);
    setTimeout(() => {
      onClose();
    }, 3000);
  };

  const handleDirectCheckout = async () => {
    setIsProcessing(true);
    try {
      await upgradeToPremium(
        planId,
        `${window.location.origin}/subscription/success`,
        `${window.location.origin}/pricing`
      );
    } catch (error) {
      console.error('Failed to start checkout:', error);
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>

          {isSuccess ? (
            <div className="p-8 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
              <p className="text-gray-600 mb-6">
                Your subscription has been activated. Redirecting you to your account...
              </p>
              <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            </div>
          ) : (
            <>
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8 rounded-t-2xl">
                <h2 className="text-2xl font-bold mb-2">Upgrade to {plan.name}</h2>
                <p className="text-blue-100">Unlock all premium features and take your interview preparation to the next level</p>
                
                <div className="mt-6 bg-white bg-opacity-10 rounded-lg p-4">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Price</span>
                    <span className="font-bold">${plan.price}</span>
                  </div>
                  <div className="flex justify-between text-sm text-blue-100">
                    <span>Billing</span>
                    <span>{plan.interval ? `${plan.interval}ly` : 'one-time'}</span>
                  </div>
                </div>
              </div>

              <div className="p-8">
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-4">What you'll get:</h3>
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={handleDirectCheckout}
                    disabled={isProcessing}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-5 w-5" />
                        <span>Checkout with Stripe</span>
                        <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </button>
                  
                  <p className="text-center text-sm text-gray-500">
                    Secure payment processing by Stripe
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StripeCheckoutModal;