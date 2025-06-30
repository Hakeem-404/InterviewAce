import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, Calendar, CreditCard, Shield } from 'lucide-react';
import { useSubscription } from '../context/SubscriptionContext';
import { useToast } from '../hooks/useToast';
import Button from '../components/Button';

const SubscriptionSuccessPage = () => {
  const { refreshSubscription, getCurrentPlan, formatSubscriptionEndDate } = useSubscription();
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Refresh subscription data when page loads
    const loadData = async () => {
      try {
        await refreshSubscription();
        addToast('Subscription activated successfully!', 'success');
      } catch (error) {
        console.error('Failed to refresh subscription:', error);
      }
    };

    loadData();
  }, []);

  const currentPlan = getCurrentPlan();
  const nextBillingDate = formatSubscriptionEndDate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-16">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Subscription Activated!
          </h1>
          
          <p className="text-xl text-gray-600 mb-8">
            Thank you for upgrading to InterviewAce {currentPlan.name}
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
            <h2 className="text-lg font-semibold text-blue-900 mb-4">Subscription Details</h2>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div>
                <div className="flex items-center gap-2 text-blue-700 mb-2">
                  <CreditCard className="h-5 w-5" />
                  <span className="font-medium">Plan</span>
                </div>
                <p className="text-gray-900">{currentPlan.name}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-blue-700 mb-2">
                  <Calendar className="h-5 w-5" />
                  <span className="font-medium">Next Billing</span>
                </div>
                <p className="text-gray-900">{nextBillingDate}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-blue-700 mb-2">
                  <Shield className="h-5 w-5" />
                  <span className="font-medium">Status</span>
                </div>
                <p className="text-green-600 font-medium">Active</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4 mb-8">
            <h3 className="font-semibold text-gray-900">You now have access to:</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {currentPlan.features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate('/upload')}
              size="lg"
              className="flex items-center justify-center gap-2"
            >
              Start Practicing Now
              <ArrowRight className="h-5 w-5" />
            </Button>
            
            <Button
              onClick={() => navigate('/profile')}
              variant="outline"
              size="lg"
            >
              View Subscription Details
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionSuccessPage;