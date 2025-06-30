import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Check, X, Zap, Award, Infinity, Clock, Brain, 
  CreditCard, Shield, AlertCircle, HelpCircle, 
  ChevronDown, ChevronUp, Users, Star, Mic, BarChart3
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import { useToast } from '../hooks/useToast';
import Button from '../components/Button';
import AuthModal from '../components/auth/AuthModal';

const PricingPage = () => {
  const { user } = useAuth();
  const { SUBSCRIPTION_PLANS, isPremium, getCurrentPlan, upgradeToPremium } = useSubscription();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [billingInterval, setBillingInterval] = useState('month');
  const [showFaq, setShowFaq] = useState({});

  const currentPlan = getCurrentPlan();

  const handleSelectPlan = async (planId) => {
    if (!user) {
      setSelectedPlan(planId);
      setShowAuthModal(true);
      return;
    }

    if (planId === SUBSCRIPTION_PLANS.FREE.id) {
      if (isPremium) {
        // Downgrade to free
        addToast('Please manage your subscription in your profile', 'info');
        navigate('/profile');
      } else {
        addToast('You are already on the free plan', 'info');
      }
      return;
    }

    try {
      await upgradeToPremium(
        planId,
        `${window.location.origin}/subscription/success`,
        `${window.location.origin}/pricing`
      );
    } catch (error) {
      console.error('Failed to upgrade:', error);
      addToast('Failed to start checkout process', 'error');
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    if (selectedPlan) {
      handleSelectPlan(selectedPlan);
    }
  };

  const toggleFaq = (id) => {
    setShowFaq(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const faqs = [
    {
      id: 1,
      question: 'What happens when I reach my free plan limit?',
      answer: 'Once you reach your 5 question limit for the month, you\'ll need to upgrade to a premium plan to continue practicing. Your limit resets on the first day of each month.'
    },
    {
      id: 2,
      question: 'Can I cancel my subscription anytime?',
      answer: 'Yes, you can cancel your subscription at any time. Your premium access will continue until the end of your current billing period. After that, your account will revert to the free plan.'
    },
    {
      id: 3,
      question: 'Is my payment information secure?',
      answer: 'Absolutely. We use Stripe, a PCI-compliant payment processor, to handle all payments. Your payment information is never stored on our servers.'
    },
    {
      id: 4,
      question: 'Do you offer refunds?',
      answer: 'We offer a 7-day money-back guarantee for new subscribers. If you\'re not satisfied with your premium subscription, contact our support team within 7 days of your initial payment for a full refund.'
    },
    {
      id: 5,
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit and debit cards, including Visa, Mastercard, American Express, and Discover. We also support Apple Pay and Google Pay where available.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Unlock premium features to supercharge your interview preparation and land your dream job
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center mt-8">
            <div className="relative flex items-center p-1 bg-gray-100 rounded-full">
              <button
                onClick={() => setBillingInterval('month')}
                className={`px-6 py-2 text-sm font-medium rounded-full transition-all ${
                  billingInterval === 'month'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingInterval('year')}
                className={`px-6 py-2 text-sm font-medium rounded-full transition-all ${
                  billingInterval === 'year'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Yearly
                <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                  Save 17%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {/* Free Plan */}
          <div className="bg-white rounded-2xl shadow-soft p-8 border border-gray-200 flex flex-col">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gray-100 rounded-xl">
                  <Users className="h-6 w-6 text-gray-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Free</h3>
              </div>
              <p className="text-gray-600 mb-4">Basic features to get started</p>
              <div className="flex items-baseline mb-2">
                <span className="text-4xl font-bold text-gray-900">$0</span>
                <span className="text-gray-500 ml-1">/forever</span>
              </div>
              <p className="text-sm text-gray-500">No credit card required</p>
            </div>

            <div className="space-y-4 mb-8 flex-grow">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="h-3 w-3 text-green-600" />
                </div>
                <span className="text-gray-700">5 interview questions/month</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="h-3 w-3 text-green-600" />
                </div>
                <span className="text-gray-700">Basic AI feedback</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="h-3 w-3 text-green-600" />
                </div>
                <span className="text-gray-700">CV & job description analysis</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
                  <X className="h-3 w-3 text-red-600" />
                </div>
                <span className="text-gray-500">No voice features</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
                  <X className="h-3 w-3 text-red-600" />
                </div>
                <span className="text-gray-500">No advanced analytics</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
                  <X className="h-3 w-3 text-red-600" />
                </div>
                <span className="text-gray-500">Limited question customization</span>
              </div>
            </div>

            <Button
              onClick={() => handleSelectPlan(SUBSCRIPTION_PLANS.FREE.id)}
              variant={currentPlan.id === SUBSCRIPTION_PLANS.FREE.id ? 'outline' : 'secondary'}
              className="w-full"
              size="lg"
            >
              {currentPlan.id === SUBSCRIPTION_PLANS.FREE.id ? 'Current Plan' : 'Get Started'}
            </Button>
          </div>

          {/* Premium Monthly */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-blue-500 flex flex-col relative transform hover:scale-105 transition-all duration-300">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold">
              Most Popular
            </div>
            
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Star className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Premium</h3>
              </div>
              <p className="text-gray-600 mb-4">Full access with monthly billing</p>
              <div className="flex items-baseline mb-2">
                <span className="text-4xl font-bold text-gray-900">$19.99</span>
                <span className="text-gray-500 ml-1">/month</span>
              </div>
              <p className="text-sm text-gray-500">Billed monthly, cancel anytime</p>
            </div>

            <div className="space-y-4 mb-8 flex-grow">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                  <Infinity className="h-3 w-3 text-blue-600" />
                </div>
                <span className="text-gray-700 font-medium">Unlimited interview questions</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                  <Brain className="h-3 w-3 text-blue-600" />
                </div>
                <span className="text-gray-700">Advanced AI feedback & analysis</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                  <Mic className="h-3 w-3 text-blue-600" />
                </div>
                <span className="text-gray-700">Voice mode with 6 AI voices</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                  <BarChart3 className="h-3 w-3 text-blue-600" />
                </div>
                <span className="text-gray-700">Detailed analytics & insights</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                  <Check className="h-3 w-3 text-blue-600" />
                </div>
                <span className="text-gray-700">Custom interview configurations</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                  <Check className="h-3 w-3 text-blue-600" />
                </div>
                <span className="text-gray-700">Full interview history</span>
              </div>
            </div>

            <Button
              onClick={() => handleSelectPlan(SUBSCRIPTION_PLANS.PREMIUM_MONTHLY.id)}
              className="w-full"
              size="lg"
              disabled={currentPlan.id === SUBSCRIPTION_PLANS.PREMIUM_MONTHLY.id}
            >
              {currentPlan.id === SUBSCRIPTION_PLANS.PREMIUM_MONTHLY.id ? 'Current Plan' : 'Upgrade Now'}
            </Button>
          </div>

          {/* Premium Yearly */}
          <div className={`bg-white rounded-2xl shadow-soft p-8 border border-gray-200 flex flex-col ${
            billingInterval === 'year' ? 'border-2 border-green-500 shadow-xl transform hover:scale-105 transition-all duration-300' : ''
          }`}>
            {billingInterval === 'year' && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                Best Value
              </div>
            )}
            
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-green-100 rounded-xl">
                  <Award className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Premium Annual</h3>
              </div>
              <p className="text-gray-600 mb-4">Save 17% with yearly billing</p>
              <div className="flex items-baseline mb-2">
                <span className="text-4xl font-bold text-gray-900">$199.99</span>
                <span className="text-gray-500 ml-1">/year</span>
              </div>
              <p className="text-sm text-gray-500">
                <span className="line-through">$239.88</span> 
                <span className="text-green-600 ml-2">Save $39.89</span>
              </p>
            </div>

            <div className="space-y-4 mb-8 flex-grow">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="h-3 w-3 text-green-600" />
                </div>
                <span className="text-gray-700">All Premium Monthly features</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                  <Zap className="h-3 w-3 text-green-600" />
                </div>
                <span className="text-gray-700 font-medium">17% discount vs. monthly</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="h-3 w-3 text-green-600" />
                </div>
                <span className="text-gray-700">Early access to new features</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="h-3 w-3 text-green-600" />
                </div>
                <span className="text-gray-700">Downloadable interview reports</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="h-3 w-3 text-green-600" />
                </div>
                <span className="text-gray-700">Interview readiness score</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="h-3 w-3 text-green-600" />
                </div>
                <span className="text-gray-700">Priority support</span>
              </div>
            </div>

            <Button
              onClick={() => handleSelectPlan(SUBSCRIPTION_PLANS.PREMIUM_YEARLY.id)}
              className={`w-full ${billingInterval === 'year' ? 'bg-green-600 hover:bg-green-700' : ''}`}
              size="lg"
              disabled={currentPlan.id === SUBSCRIPTION_PLANS.PREMIUM_YEARLY.id}
            >
              {currentPlan.id === SUBSCRIPTION_PLANS.PREMIUM_YEARLY.id ? 'Current Plan' : 'Upgrade Now'}
            </Button>
          </div>
        </div>

        {/* Feature Comparison */}
        <div className="max-w-6xl mx-auto mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Feature Comparison
          </h2>
          
          <div className="bg-white rounded-xl shadow-soft overflow-hidden border border-gray-200">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Feature</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Free</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-blue-900 bg-blue-50">Premium</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900">Monthly Questions</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-700">5</td>
                  <td className="px-6 py-4 text-center text-sm text-blue-700 bg-blue-50">
                    <Infinity className="h-5 w-5 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900">AI Voice Interviewer</td>
                  <td className="px-6 py-4 text-center">
                    <X className="h-5 w-5 text-red-500 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-center bg-blue-50">
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900">Advanced Analytics</td>
                  <td className="px-6 py-4 text-center">
                    <X className="h-5 w-5 text-red-500 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-center bg-blue-50">
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900">Interview History</td>
                  <td className="px-6 py-4 text-center">
                    <X className="h-5 w-5 text-red-500 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-center bg-blue-50">
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900">Custom Interview Configuration</td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-xs text-gray-500">Limited</span>
                  </td>
                  <td className="px-6 py-4 text-center bg-blue-50">
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900">AI Feedback Detail Level</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-700">Basic</td>
                  <td className="px-6 py-4 text-center text-sm text-blue-700 bg-blue-50">Comprehensive</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900">Interview Readiness Score</td>
                  <td className="px-6 py-4 text-center">
                    <X className="h-5 w-5 text-red-500 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-center bg-blue-50">
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900">Downloadable Reports</td>
                  <td className="px-6 py-4 text-center">
                    <X className="h-5 w-5 text-red-500 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-center bg-blue-50">
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div 
                key={faq.id} 
                className="bg-white rounded-xl shadow-soft border border-gray-200 overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between focus:outline-none"
                >
                  <span className="font-medium text-gray-900">{faq.question}</span>
                  {showFaq[faq.id] ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </button>
                
                {showFaq[faq.id] && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <p className="text-gray-700">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-4xl mx-auto mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Ace Your Next Interview?</h2>
            <p className="text-blue-100 text-lg mb-8">
              Join thousands of job seekers who have improved their interview skills with InterviewAce
            </p>
            <Button
              onClick={() => handleSelectPlan(SUBSCRIPTION_PLANS.PREMIUM_MONTHLY.id)}
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg"
            >
              Get Started Now
            </Button>
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-blue-100">
              <Shield className="h-4 w-4" />
              <span>Secure payment with Stripe</span>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialForm="signup"
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default PricingPage;