import React from 'react';
import { MessageCircle, Clock } from 'lucide-react';

interface InterviewCardProps {
  question: string;
  questionNumber: number;
  totalQuestions: number;
  timeElapsed?: string;
  className?: string;
}

const InterviewCard: React.FC<InterviewCardProps> = ({
  question,
  questionNumber,
  totalQuestions,
  timeElapsed,
  className = ''
}) => {
  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <MessageCircle className="h-5 w-5 text-blue-600" />
          <span className="text-sm font-medium text-gray-600">
            Question {questionNumber} of {totalQuestions}
          </span>
        </div>
        {timeElapsed && (
          <div className="flex items-center space-x-1 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            <span>{timeElapsed}</span>
          </div>
        )}
      </div>

      {/* Question */}
      <div className="prose prose-blue max-w-none">
        <h3 className="text-lg font-medium text-gray-900 leading-relaxed">
          {question}
        </h3>
      </div>

      {/* Progress indicator */}
      <div className="mt-4 flex space-x-1">
        {Array.from({ length: totalQuestions }, (_, index) => (
          <div
            key={index}
            className={`h-1 flex-1 rounded-full ${
              index < questionNumber
                ? 'bg-blue-600'
                : index === questionNumber - 1
                ? 'bg-blue-400'
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default InterviewCard;