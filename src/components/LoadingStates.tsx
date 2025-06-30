import React from 'react';
import { Upload, Brain, Mic, Cog, Loader2, FileText, MessageSquare } from 'lucide-react';

interface LoadingStatesProps {
  type: 'upload' | 'analysis' | 'voice' | 'processing' | 'evaluation' | 'generation';
  message: string;
  progress?: number;
  className?: string;
}

const LoadingStates: React.FC<LoadingStatesProps> = ({ 
  type, 
  message, 
  progress,
  className = '' 
}) => {
  const loadingTypes = {
    upload: {
      icon: <Upload className="h-8 w-8 animate-bounce" />,
      gradient: "from-blue-500 to-purple-600",
      bgGradient: "from-blue-50 to-purple-50"
    },
    analysis: {
      icon: <Brain className="h-8 w-8 animate-pulse" />,
      gradient: "from-green-500 to-blue-600",
      bgGradient: "from-green-50 to-blue-50"
    },
    voice: {
      icon: <Mic className="h-8 w-8 animate-ping" />,
      gradient: "from-orange-500 to-red-600",
      bgGradient: "from-orange-50 to-red-50"
    },
    processing: {
      icon: <Cog className="h-8 w-8 animate-spin" />,
      gradient: "from-purple-500 to-pink-600",
      bgGradient: "from-purple-50 to-pink-50"
    },
    evaluation: {
      icon: <MessageSquare className="h-8 w-8 animate-pulse" />,
      gradient: "from-indigo-500 to-purple-600",
      bgGradient: "from-indigo-50 to-purple-50"
    },
    generation: {
      icon: <FileText className="h-8 w-8 animate-bounce" />,
      gradient: "from-teal-500 to-blue-600",
      bgGradient: "from-teal-50 to-blue-50"
    }
  };

  const config = loadingTypes[type];

  return (
    <div className={`flex flex-col items-center justify-center min-h-[200px] space-y-6 p-8 ${className}`}>
      {/* Animated Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${config.bgGradient} opacity-30 rounded-xl`} />
      
      {/* Main Loading Icon */}
      <div className="relative">
        <div className={`p-6 rounded-full bg-gradient-to-r ${config.gradient} text-white shadow-2xl transform transition-all duration-300 hover:scale-105`}>
          {config.icon}
        </div>
        
        {/* Pulse Ring Animation */}
        <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${config.gradient} opacity-20 animate-ping`} />
      </div>
      
      {/* Loading Content */}
      <div className="text-center space-y-4 relative z-10">
        <h3 className="text-xl font-semibold text-gray-800 animate-fade-in">
          {message}
        </h3>
        
        {/* Progress Bar */}
        {progress !== undefined && (
          <div className="w-80 space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
              <div 
                className={`h-3 rounded-full bg-gradient-to-r ${config.gradient} transition-all duration-700 ease-out shadow-lg`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
        
        {/* Loading Dots */}
        <div className="flex justify-center space-x-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full bg-gradient-to-r ${config.gradient} animate-pulse`}
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingStates;