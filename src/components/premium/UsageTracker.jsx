import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Zap } from 'lucide-react';
import { useSubscription } from '../../context/SubscriptionContext';
import Button from '../Button';

const UsageTracker = ({ className = '' }) => {
  const { usage, isPremium } = useSubscription();
  const navigate = useNavigate();

  if (!usage) return null;
  
  // If premium, don't show usage tracker
  if (isPremium) return null;

  const { used, limit, remaining } = usage;
  const percentUsed = Math.min(100, Math.round((used / limit) * 100));
  const isLow = remaining <= 2;

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900">Free Plan Usage</h3>
        <span className="text-xs text-gray-500">
          {used} of {limit} questions used
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div 
          className={`h-2 rounded-full transition-all duration-500 ${
            isLow ? 'bg-red-500' : 'bg-blue-500'
          }`}
          style={{ width: `${percentUsed}%` }}
        />
      </div>
      
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-600">
          {remaining} question{remaining !== 1 ? 's' : ''} remaining
        </span>
        <span className="text-gray-600">Resets monthly</span>
      </div>
      
      {isLow && (
        <div className="mt-3 flex items-start gap-2 p-2 bg-red-50 rounded-lg">
          <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-red-700">
              You're running low on free questions. Upgrade to premium for unlimited access.
            </p>
            <Button
              size="sm"
              onClick={() => navigate('/pricing')}
              className="mt-2 flex items-center gap-1 text-xs py-1"
            >
              <Zap className="h-3 w-3" />
              Upgrade Now
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsageTracker;