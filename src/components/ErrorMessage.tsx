import React from 'react';
import { AlertCircle, RefreshCw, Wifi, Settings } from 'lucide-react';
import Button from './Button';

interface ErrorMessageProps {
  type: 'network' | 'api' | 'permission' | 'validation' | 'general';
  title: string;
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  actionLabel?: string;
  className?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  type,
  title,
  message,
  onRetry,
  onDismiss,
  actionLabel,
  className = ''
}) => {
  const getErrorConfig = () => {
    switch (type) {
      case 'network':
        return {
          icon: <Wifi className="h-6 w-6" />,
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          iconColor: 'text-orange-600',
          titleColor: 'text-orange-800',
          messageColor: 'text-orange-700'
        };
      case 'api':
        return {
          icon: <AlertCircle className="h-6 w-6" />,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          iconColor: 'text-red-600',
          titleColor: 'text-red-800',
          messageColor: 'text-red-700'
        };
      case 'permission':
        return {
          icon: <Settings className="h-6 w-6" />,
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          iconColor: 'text-yellow-600',
          titleColor: 'text-yellow-800',
          messageColor: 'text-yellow-700'
        };
      case 'validation':
        return {
          icon: <AlertCircle className="h-6 w-6" />,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          iconColor: 'text-blue-600',
          titleColor: 'text-blue-800',
          messageColor: 'text-blue-700'
        };
      default:
        return {
          icon: <AlertCircle className="h-6 w-6" />,
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          iconColor: 'text-gray-600',
          titleColor: 'text-gray-800',
          messageColor: 'text-gray-700'
        };
    }
  };

  const config = getErrorConfig();

  return (
    <div className={`
      ${config.bgColor} ${config.borderColor} border rounded-lg p-4 
      ${className}
    `}>
      <div className="flex items-start gap-3">
        <div className={`${config.iconColor} flex-shrink-0 mt-0.5`}>
          {config.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`${config.titleColor} font-medium text-sm mb-1`}>
            {title}
          </h3>
          <p className={`${config.messageColor} text-sm leading-relaxed`}>
            {message}
          </p>
          
          {(onRetry || onDismiss) && (
            <div className="flex items-center gap-2 mt-3">
              {onRetry && (
                <Button
                  size="sm"
                  onClick={onRetry}
                  className="flex items-center gap-1"
                >
                  <RefreshCw className="h-3 w-3" />
                  {actionLabel || 'Retry'}
                </Button>
              )}
              {onDismiss && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onDismiss}
                >
                  Dismiss
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;