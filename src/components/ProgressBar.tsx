import React, { useEffect, useState } from 'react';

interface ProgressBarProps {
  progress: number;
  steps: string[];
  currentStep: number;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  steps,
  currentStep,
  className = ''
}) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progress);
    }, 100);
    return () => clearTimeout(timer);
  }, [progress]);

  return (
    <div className={`w-full ${className}`}>
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${animatedProgress}%` }}
        />
      </div>

      {/* Steps */}
      <div className="space-y-2">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`flex items-center space-x-2 transition-all duration-300 ${
              index < currentStep
                ? 'text-green-600'
                : index === currentStep
                ? 'text-blue-600'
                : 'text-gray-400'
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index < currentStep
                  ? 'bg-green-600'
                  : index === currentStep
                  ? 'bg-blue-600 animate-pulse'
                  : 'bg-gray-300'
              }`}
            />
            <span className="text-sm font-medium">{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressBar;