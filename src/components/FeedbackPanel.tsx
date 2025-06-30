import React, { useState } from 'react';
import { Star, TrendingUp, AlertCircle, CheckCircle, Target, Eye, EyeOff, BarChart3, Lightbulb, ArrowRight } from 'lucide-react';

interface FeedbackPanelProps {
  evaluation: any;
  question: string;
  answer: string;
  className?: string;
}

const FeedbackPanel: React.FC<FeedbackPanelProps> = ({ 
  evaluation, 
  question, 
  answer,
  className = '' 
}) => {
  const [showDetailed, setShowDetailed] = useState(false);
  const [showSuggestedAnswer, setShowSuggestedAnswer] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'detailed' | 'keywords'>('overview');
  
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 8) return 'bg-green-500';
    if (score >= 6) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  const getScoreBarWidth = (score: number) => `${(score / 10) * 100}%`;

  const getOverallGrade = (score: number) => {
    if (score >= 9) return { grade: 'A+', color: 'text-green-700 bg-green-100' };
    if (score >= 8) return { grade: 'A', color: 'text-green-600 bg-green-50' };
    if (score >= 7) return { grade: 'B+', color: 'text-blue-600 bg-blue-50' };
    if (score >= 6) return { grade: 'B', color: 'text-yellow-600 bg-yellow-50' };
    if (score >= 5) return { grade: 'C', color: 'text-orange-600 bg-orange-50' };
    return { grade: 'D', color: 'text-red-600 bg-red-50' };
  };

  const overallGrade = getOverallGrade(evaluation.overallScore);

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${overallGrade.color}`}>
              {overallGrade.grade}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">AI Response Analysis</h3>
              <p className="text-sm text-gray-600">Powered by AI</p>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${getScoreColor(evaluation.overallScore)}`}>
              {evaluation.overallScore}/10
            </div>
            <p className="text-sm text-gray-600">Overall Score</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'detailed', label: 'Detailed Analysis', icon: Target },
            { id: 'keywords', label: 'Keywords', icon: Eye }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Score Breakdown */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Score Breakdown</h4>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(evaluation.scores).map(([category, score]) => (
                  <div key={category} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="capitalize text-sm font-medium text-gray-700">{category}</span>
                      <span className={`text-sm font-semibold ${getScoreColor(score as number)}`}>
                        {score}/10
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${getScoreBarColor(score as number)}`}
                        style={{ width: getScoreBarWidth(score as number) }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Strengths and Improvements */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="flex items-center gap-2 font-semibold text-green-800 mb-3">
                  <CheckCircle className="h-5 w-5" />
                  Strengths ({evaluation.strengths?.length || 0})
                </h4>
                <ul className="space-y-2">
                  {evaluation.strengths?.map((strength: string, index: number) => (
                    <li key={index} className="text-sm text-green-700 flex items-start gap-2">
                      <span className="text-green-500 mt-1 text-xs">✓</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h4 className="flex items-center gap-2 font-semibold text-orange-800 mb-3">
                  <TrendingUp className="h-5 w-5" />
                  Areas for Improvement ({evaluation.improvements?.length || 0})
                </h4>
                <ul className="space-y-2">
                  {evaluation.improvements?.map((improvement: string, index: number) => (
                    <li key={index} className="text-sm text-orange-700 flex items-start gap-2">
                      <span className="text-orange-500 mt-1 text-xs">→</span>
                      <span>{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Overall Feedback */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Overall Feedback</h4>
              <p className="text-blue-800 text-sm leading-relaxed">{evaluation.feedback}</p>
            </div>
          </div>
        )}

        {/* Detailed Analysis Tab */}
        {activeTab === 'detailed' && (
          <div className="space-y-6">
            {/* Detailed Analysis */}
            {evaluation.detailedAnalysis && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Detailed Analysis</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  {Object.entries(evaluation.detailedAnalysis).map(([aspect, assessment]) => (
                    <div key={aspect} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <h5 className="font-medium text-gray-900 capitalize mb-1">
                        {aspect.replace(/([A-Z])/g, ' $1').trim()}
                      </h5>
                      <p className="text-sm text-gray-700">{assessment as string}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suggested Answer */}
            {evaluation.suggestedAnswer && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-semibold text-gray-900">Suggested Enhancement</h4>
                  <button
                    onClick={() => setShowSuggestedAnswer(!showSuggestedAnswer)}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    {showSuggestedAnswer ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    {showSuggestedAnswer ? 'Hide' : 'Show'} Suggestion
                  </button>
                </div>
                
                {showSuggestedAnswer && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <p className="text-purple-800 text-sm italic leading-relaxed">
                      "{evaluation.suggestedAnswer}"
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Next Steps */}
            {evaluation.nextSteps && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <h4 className="flex items-center gap-2 font-semibold text-indigo-900 mb-3">
                  <Lightbulb className="h-5 w-5" />
                  Next Steps for Improvement
                </h4>
                <ul className="space-y-2">
                  {evaluation.nextSteps.map((step: string, index: number) => (
                    <li key={index} className="text-sm text-indigo-800 flex items-start gap-2">
                      <ArrowRight className="h-3 w-3 mt-1 text-indigo-600" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Keywords Tab */}
        {activeTab === 'keywords' && evaluation.keywordAnalysis && (
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Keyword Analysis</h4>
              
              <div className="grid gap-6">
                {/* Keywords Used */}
                <div>
                  <h5 className="font-medium text-green-700 mb-3 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Keywords Used ({evaluation.keywordAnalysis.used?.length || 0})
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {evaluation.keywordAnalysis.used?.map((keyword: string, index: number) => (
                      <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Missing Keywords */}
                <div>
                  <h5 className="font-medium text-red-700 mb-3 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Missing Keywords ({evaluation.keywordAnalysis.missing?.length || 0})
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {evaluation.keywordAnalysis.missing?.map((keyword: string, index: number) => (
                      <span key={index} className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Industry-Specific Keywords */}
                {evaluation.keywordAnalysis.industrySpecific && (
                  <div>
                    <h5 className="font-medium text-blue-700 mb-3 flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Industry-Specific Terms ({evaluation.keywordAnalysis.industrySpecific?.length || 0})
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {evaluation.keywordAnalysis.industrySpecific.map((keyword: string, index: number) => (
                        <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                          {keyword}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-blue-600 mt-2">
                      Consider incorporating these industry-specific terms in your responses
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Analysis completed • {new Date().toLocaleTimeString()}
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-600">Powered by</span>
            <span className="text-xs font-semibold text-blue-600"> AI</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPanel;