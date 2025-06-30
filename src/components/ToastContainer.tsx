import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { Toast } from '../hooks/useToast';

interface ToastContainerProps {
  toasts: Toast[];
  removeToast: (id: number) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
  const getToastConfig = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle className="h-5 w-5" />,
          bgColor: 'bg-green-500',
          borderColor: 'border-green-400',
          textColor: 'text-green-50'
        };
      case 'error':
        return {
          icon: <XCircle className="h-5 w-5" />,
          bgColor: 'bg-red-500',
          borderColor: 'border-red-400',
          textColor: 'text-red-50'
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="h-5 w-5" />,
          bgColor: 'bg-orange-500',
          borderColor: 'border-orange-400',
          textColor: 'text-orange-50'
        };
      case 'info':
      default:
        return {
          icon: <Info className="h-5 w-5" />,
          bgColor: 'bg-blue-500',
          borderColor: 'border-blue-400',
          textColor: 'text-blue-50'
        };
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {toasts.map((toast) => {
        const config = getToastConfig(toast.type);
        
        return (
          <ToastItem
            key={toast.id}
            toast={toast}
            config={config}
            onRemove={removeToast}
          />
        );
      })}
    </div>
  );
};

interface ToastItemProps {
  toast: Toast;
  config: {
    icon: React.ReactNode;
    bgColor: string;
    borderColor: string;
    textColor: string;
  };
  onRemove: (id: number) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, config, onRemove }) => {
  useEffect(() => {
    if (toast.duration > 0) {
      const timer = setTimeout(() => {
        onRemove(toast.id);
      }, toast.duration);

      return () => clearTimeout(timer);
    }
  }, [toast.id, toast.duration, onRemove]);

  return (
    <div
      className={`
        ${config.bgColor} ${config.borderColor} ${config.textColor}
        border rounded-lg shadow-lg p-4 transform transition-all duration-300 ease-in-out
        animate-slide-in-right backdrop-blur-sm bg-opacity-95
      `}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {config.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-relaxed">
            {toast.message}
          </p>
        </div>
        <button
          onClick={() => onRemove(toast.id)}
          className={`
            flex-shrink-0 ml-2 p-1 rounded-full transition-colors duration-200
            hover:bg-white hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50
          `}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      
      {/* Progress Bar */}
      {toast.duration > 0 && (
        <div className="mt-2 w-full bg-white bg-opacity-20 rounded-full h-1">
          <div
            className="bg-white h-1 rounded-full transition-all ease-linear"
            style={{
              animation: `shrink ${toast.duration}ms linear forwards`
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ToastContainer;