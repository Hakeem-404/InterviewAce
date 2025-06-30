import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Star, X, Check, Lock } from 'lucide-react';
import { useSubscription } from '../../context/SubscriptionContext';
import Button from '../Button';

const UpgradePrompt = ({ 
  feature = 'premium', 
  message, 
  showDetails = true,
  onClose,
  className = ''
}) => {
  const { SUBSCRIPTION_PLANS } = useSubscription();
  const navigate = useNavigate();

  const getFeatureDetails = () => {
    switch (feature) {
      case 'questions':
        return {
          title: 'Unlimited Questions',
          description: 'Upgrade to premium for unlimited interview questions',
          icon: <Zap className="h-6 w-6" />,
          color: 'blue'
        };
      case 'voice':
        return {
          title: 'Voice Features',
          description: 'Upgrade to premium to access voice mode and AI interviewer voices',
          icon: <Star className="h-6 w-6" />,
          color: 'purple'
        };
      case 'analytics':
        return {
          title: 'Advanced Analytics',
          description: 'Upgrade to premium for detailed performance analytics and insights',
          icon: <Star className="h-6 w-6" />,
          color: 'green'
        };
      case 'history':
        return {
          title: 'Interview History',
          description: 'Upgrade to premium to save and review your interview history',
          icon: <Star className="h-6 w-6" />,
          color: 'orange'
        };
      default:
        return {
          title: 'Premium Feature',
          description: 'Upgrade to premium to unlock all features',
          icon: <Lock className="h-6 w-6" />,
          color: 'blue'
        };
    }
  };

  const details = getFeatureDetails();

  return (
    <div className={`bg-gradient-to-r from-${details.color}-50 to-indigo-50 border border-${details.color}-200 rounded-xl p-6 ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 bg-${details.color}-100 rounded-xl`}>
            {details.icon}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">{details.title}</h3>
            <p className="text-gray-600">{message || details.description}</p>
          </div>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      
      {showDetails && (
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Free Plan Limitations:</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <X className="h-4 w-4 text-red-500" />
                <span>Limited to 5 questions per month</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <X className="h-4 w-4 text-red-500" />
                <span>Basic AI feedback only</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <X className="h-4 w-4 text-red-500" />
                <span>No voice features</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Premium Benefits:</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <Check className="h-4 w-4 text-green-500" />
                <span>Unlimited interview questions</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <Check className="h-4 w-4 text-green-500" />
                <span>Advanced AI feedback & analytics</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <Check className="h-4 w-4 text-green-500" />
                <span>Voice mode with 6 AI interviewer voices</span>
              </li>
            </ul>
          </div>
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row gap-3 justify-end">
        <Button
          variant="outline"
          onClick={() => navigate('/pricing')}
          className="flex items-center gap-2"
        >
          View Plans
        </Button>
        <Button
          onClick={() => navigate('/pricing')}
          className={`bg-${details.color}-600 hover:bg-${details.color}-700 flex items-center gap-2`}
        >
          <Zap className="h-4 w-4" />
          Upgrade Now
        </Button>
      </div>
    </div>
  );
};

export default UpgradePrompt;