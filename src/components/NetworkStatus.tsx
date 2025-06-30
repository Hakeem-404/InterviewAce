import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';

const NetworkStatus: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineMessage(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineMessage(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showOfflineMessage && isOnline) {
    return null;
  }

  return (
    <div className={`
      fixed top-0 left-0 right-0 z-50 p-3 text-center text-white font-medium
      ${isOnline ? 'bg-green-500' : 'bg-red-500'}
      transition-all duration-300 ease-in-out
    `}>
      <div className="flex items-center justify-center gap-2">
        {isOnline ? (
          <>
            <Wifi className="h-4 w-4" />
            <span>Connection restored</span>
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4" />
            <span>No internet connection</span>
          </>
        )}
      </div>
    </div>
  );
};

export default NetworkStatus;