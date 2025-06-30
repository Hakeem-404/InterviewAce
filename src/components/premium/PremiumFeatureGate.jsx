import React, { useState, useEffect } from 'react';
import { useSubscription } from '../../context/SubscriptionContext';
import UpgradePrompt from './UpgradePrompt';
import LoadingStates from '../LoadingStates';

const PremiumFeatureGate = ({ 
  feature = 'premium',
  count = 1,
  children,
  fallback,
  showPrompt = true,
  className = ''
}) => {
  const { canUseFeature, trackUsage, loading } = useSubscription();
  const [canUse, setCanUse] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  useEffect(() => {
    checkAccess();
  }, [feature, count]);

  const checkAccess = async () => {
    setIsChecking(true);
    try {
      const hasAccess = await canUseFeature(feature, count);
      setCanUse(hasAccess);
      setShowUpgradePrompt(!hasAccess && showPrompt);
    } catch (error) {
      console.error('Failed to check feature access:', error);
      setCanUse(false);
    } finally {
      setIsChecking(false);
    }
  };

  const handleUseFeature = async () => {
    if (canUse) {
      await trackUsage(feature, count);
    }
  };

  if (loading || isChecking) {
    return (
      <div className={`flex items-center justify-center p-6 ${className}`}>
        <LoadingStates type="processing" message="Checking access..." />
      </div>
    );
  }

  if (!canUse) {
    if (fallback) {
      return fallback;
    }
    
    if (showUpgradePrompt) {
      return (
        <UpgradePrompt 
          feature={feature}
          onClose={() => setShowUpgradePrompt(false)}
          className={className}
        />
      );
    }
    
    return null;
  }

  // If we have access, track usage and render children
  handleUseFeature();
  return children;
};

export default PremiumFeatureGate;