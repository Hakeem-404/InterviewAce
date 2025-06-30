import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { CreditCard, CheckCircle, AlertCircle, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';
import Button from '../Button';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Wrapper component for Stripe Elements
const StripeCheckout = ({ planId, planName, amount, onSuccess, onCancel }) => {
  if (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="h-6 w-6 text-yellow-600" />
          <h3 className="text-lg font-semibold text-yellow-800">Stripe Not Configured</h3>
        </div>
        <p className="text-yellow-700 mb-4">
          Stripe integration is not fully configured. Please add your Stripe API keys to the environment variables.
        </p>
        <div className="bg-white p-4 rounded border border-yellow-200">
          <p className="text-sm font-mono mb-2">Add to your .env file:</p>
          <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
            VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
          </pre>
        </div>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm 
        planId={planId} 
        planName={planName} 
        amount={amount} 
        onSuccess={onSuccess}
        onCancel={onCancel}
      />
    </Elements>
  );
};

// Checkout form component
const CheckoutForm = ({ planId, planName, amount, onSuccess, onCancel }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Reset state when plan changes
    setPaymentError('');
    setPaymentSuccess(false);
    setCardComplete(false);
  }, [planId]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet
      return;
    }

    if (!cardComplete) {
      addToast('Please complete your card details', 'warning');
      return;
    }

    setIsProcessing(true);
    setPaymentError('');

    try {
      // Create payment method
      const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement),
      });

      if (paymentMethodError) {
        throw new Error(paymentMethodError.message);
      }

      // Call your backend to create the subscription
      const response = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentMethodId: paymentMethod.id,
          planId,
          userId: user.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process payment');
      }

      // Handle subscription status
      if (data.status === 'active') {
        setPaymentSuccess(true);
        addToast('Subscription activated successfully!', 'success');
        setTimeout(() => {
          onSuccess?.();
          navigate('/subscription/success');
        }, 2000);
      } else if (data.status === 'incomplete') {
        // Subscription requires additional action
        const { error: confirmError } = await stripe.confirmCardPayment(data.clientSecret);
        if (confirmError) {
          throw new Error(confirmError.message);
        } else {
          setPaymentSuccess(true);
          addToast('Subscription activated successfully!', 'success');
          setTimeout(() => {
            onSuccess?.();
            navigate('/subscription/success');
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentError(error.message || 'An unexpected error occurred');
      addToast('Payment failed: ' + error.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCardChange = (event) => {
    setCardComplete(event.complete);
    setPaymentError(event.error ? event.error.message : '');
  };

  const CARD_ELEMENT_OPTIONS = {
    style: {
      base: {
        color: '#32325d',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a',
      },
    },
  };

  return (
    <div className="bg-white rounded-xl shadow-soft p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-xl">
            <CreditCard className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Subscribe to {planName}</h3>
            <p className="text-gray-600">${amount} {planId.includes('yearly') ? '/year' : '/month'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Lock className="h-4 w-4" />
          <span>Secure payment</span>
        </div>
      </div>

      {paymentSuccess ? (
        <div className="text-center py-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Payment Successful!</h3>
          <p className="text-gray-600 mb-6">
            Your subscription has been activated. Redirecting you to your account...
          </p>
          <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Card Details
            </label>
            <div className="border border-gray-300 rounded-lg p-4 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
              <CardElement options={CARD_ELEMENT_OPTIONS} onChange={handleCardChange} />
            </div>
            {paymentError && (
              <div className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                <span>{paymentError}</span>
              </div>
            )}
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-gray-900 mb-2">Subscription Summary</h4>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">{planName}</span>
              <span className="font-medium text-gray-900">${amount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Billed {planId.includes('yearly') ? 'annually' : 'monthly'}</span>
              <span className="text-gray-500">Cancel anytime</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="submit"
              disabled={isProcessing || !stripe}
              loading={isProcessing}
              className="flex-1"
              size="lg"
            >
              {isProcessing ? 'Processing...' : `Subscribe for $${amount}`}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isProcessing}
              className="flex-1"
              size="lg"
            >
              Cancel
            </Button>
          </div>

          <div className="mt-4 text-center text-xs text-gray-500">
            <p>
              By subscribing, you agree to our{' '}
              <a href="#" className="text-blue-600 hover:text-blue-800">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-blue-600 hover:text-blue-800">
                Privacy Policy
              </a>
            </p>
          </div>
        </form>
      )}
    </div>
  );
};

export default StripeCheckout;