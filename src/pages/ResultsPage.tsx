import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Award, BarChart3, Target, TrendingUp, RefreshCw, Download, AlertCircle, Brain, Star, Trophy, History } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { sessionService } from '../services/sessionService';
import Button from '../components/Button';
import FeedbackPanel from '../components/FeedbackPanel';
import { getInterviewSummary, generatePerformanceAnalytics } from '../services/apiService';

const ResultsPage: React.FC = () => {
  const [results, setResults] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [performanceAnalytics, setPerformanceAnalytics] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'detailed' | 'analytics'>('overview');
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const storedResults = sessionStorage.getItem('interviewResults');
    if (!storedResults) {
      navigate('/upload');
      return;
    }

    const data = JSON.parse(storedResults);
    setResults(data);

    // Generate summary
    const questionsAndAnswers = (data.questions || []).map((question: any, index: number) => ({
      question,
      answer: data.answers?.[index] || '',
      evaluation: data.evaluations?.[index] || null
    }));

    const summaryData = getInterviewSummary(questionsAndAnswers, data.analysis);
    setSummary(summaryData);

    // Load previous sessions for analytics
    const previousSessions = JSON.parse(localStorage.getItem('interviewSessions') || '[]');
    const allSessions = [...previousSessions, summaryData];
    const analytics = generatePerformanceAnalytics(allSessions);
    setPerformanceAnalytics(analytics);

    // Save current session to localStorage and try to save to database
    saveSession(data, summaryData);
  }, [navigate, user]);

  const saveSession = async (data: any, summaryData: any) => {
    if (!user) return;

    setIsSaving(true);
    try {
      // Prepare session data
      const sessionData = {
        userId: user.id,
        jobTitle: data.jobTitle || 'Practice Session',
        companyName: data.companyName || '',
        sessionType: 'practice',
        questions: data.questions || [],
        responses: Object.values(data.answers || {}),
        analysisResults: data.analysis || {},
        overallScore: summaryData.overallScore || 0,
        confidenceScore: summaryData.avgConfidenceScore || 0,
        technicalScore: summaryData.avgTechnicalScore || 0,
        behavioralScore: summaryData.avgBehavioralScore || 0,
        communicationScore: summaryData.avgCommunicationScore || 0,
        duration: data.totalTime || 0,
        voiceEnabled: data.voiceMode || false,
        cvData: data.cvText || '',
        jobDescription: data.jobDescription || '',
        feedbackSummary: summaryData.overallFeedback || '',
        improvementAreas: summaryData.keyImprovements || [],
        strengths: summaryData.topStrengths || []
      };

      // Try to save to database first
      try {
        await sessionService.saveSession(sessionData);
        console.log('Session saved to database successfully');
      } catch (error) {
        console.log('Database save failed, using localStorage fallback');
        sessionService.saveSessionLocal(sessionData);
      }

      // Always save to localStorage as backup
      const sessions = JSON.parse(localStorage.getItem('interviewSessions') || '[]');
      sessions.push({
        ...sessionData,
        id: Date.now(),
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('interviewSessions', JSON.stringify(sessions));

    } catch (error) {
      console.error('Failed to save session:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!results || !summary) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-100';
    if (score >= 6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getBarColor = (score: number) => {
    if (score >= 8) return 'bg-green-500';
    if (score >= 6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getOverallGrade = (score: number) => {
    if (score >= 9) return { grade: 'A+', color: 'text-green-700 bg-green-100', description: 'Outstanding' };
    if (score >= 8) return { grade: 'A', color: 'text-green-600 bg-green-50', description: 'Excellent' };
    if (score >= 7) return { grade: 'B+', color: 'text-blue-600 bg-blue-50', description: 'Very Good' };
    if (score >= 6) return { grade: 'B', color: 'text-yellow-600 bg-yellow-50', description: 'Good' };
    if (score >= 5) return { grade: 'C', color: 'text-orange-600 bg-orange-50', description: 'Fair' };
    return { grade: 'D', color: 'text-red-600 bg-red-50', description: 'Needs Improvement' };
  };

  const overallGrade = getOverallGrade(summary.overallScore);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <Trophy className="h-16 w-16 text-yellow-500" />
              <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${overallGrade.color}`}>
                {overallGrade.grade}
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Interview Complete!
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            {overallGrade.description} performance! Here's your comprehensive AI-powered analysis.
          </p>
          
          {/* Overall Score */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 max-w-md mx-auto">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Overall Score</h2>
            <div className="text-4xl font-bold text-blue-600 mb-2">{summary.overallScore}/10</div>
            <p className="text-sm text-gray-600 mb-4">
              {summary.overallFeedback}
            </p>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="font-semibold text-gray-900">{summary.answeredQuestions}</div>
                <div className="text-gray-600">Answered</div>
              </div>
              <div>
                <div className="font-semibold text-gray-900">{summary.totalQuestions}</div>
                <div className="text-gray-600">Total Questions</div>
              </div>
              <div>
                <div className="font-semibold text-gray-900">{formatTime(results.totalTime || 0)}</div>
                <div className="text-gray-600">Time Spent</div>
              </div>
            </div>
          </div>

          {/* Save Status */}
          {isSaving && (
            <div className="mt-4 text-sm text-blue-600">
              Saving your session to history...
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'detailed', label: 'Question Analysis', icon: Target },
                { id: 'analytics', label: 'Performance Analytics', icon: TrendingUp }
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
              <div className="space-y-8">
                {/* Category Breakdown */}
                {Object.keys(summary.categoryBreakdown).length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                      <BarChart3 className="h-6 w-6 text-blue-600" />
                      Performance by Category
                    </h2>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(summary.categoryBreakdown).map(([category, data]: [string, any]) => (
                        <div key={category} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-medium text-gray-900">{category}</h3>
                            {data.answered > 0 && (
                              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreColor(Math.round(data.avgScore))}`}>
                                {Math.round(data.avgScore)}/10
                              </span>
                            )}
                          </div>
                          
                          <div className="text-sm text-gray-600 mb-3">
                            {data.answered}/{data.total} questions answered
                          </div>
                          
                          {data.answered > 0 && (
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${getBarColor(Math.round(data.avgScore))}`}
                                style={{ width: `${data.avgScore * 10}%` }}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Insights */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <Target className="h-6 w-6 text-blue-600" />
                    Key Insights
                  </h2>

                  <div className="grid md:grid-cols-2 gap-6">
                    {summary.topStrengths.length > 0 && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                        <h3 className="font-medium text-green-900 mb-4 flex items-center gap-2">
                          <Star className="h-5 w-5" />
                          Top Strengths
                        </h3>
                        <ul className="space-y-2">
                          {summary.topStrengths.slice(0, 5).map((strength: string, index: number) => (
                            <li key={index} className="text-sm text-green-800 flex items-start gap-2">
                              <span className="text-green-600 mt-1 text-xs">✓</span>
                              <span>{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {summary.keyImprovements.length > 0 && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                        <h3 className="font-medium text-orange-900 mb-4 flex items-center gap-2">
                          <TrendingUp className="h-5 w-5" />
                          Growth Opportunities
                        </h3>
                        <ul className="space-y-2">
                          {summary.keyImprovements.slice(0, 5).map((improvement: string, index: number) => (
                            <li key={index} className="text-sm text-orange-800 flex items-start gap-2">
                              <span className="text-orange-600 mt-1 text-xs">→</span>
                              <span>{improvement}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Performance Metrics */}
                {summary.performanceMetrics && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="font-medium text-blue-900 mb-4">Performance Metrics</h3>
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-700">{summary.performanceMetrics.consistencyScore}%</div>
                        <div className="text-blue-600">Consistency Score</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-blue-700 capitalize">{summary.performanceMetrics.improvementTrend}</div>
                        <div className="text-blue-600">Trend</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-blue-700">{summary.performanceMetrics.strongestCategory}</div>
                        <div className="text-blue-600">Strongest Area</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Detailed Analysis Tab */}
            {activeTab === 'detailed' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Question-by-Question Analysis</h2>
                
                {results.questions.map((question: any, index: number) => {
                  const answer = results.answers?.[index] || '';
                  const evaluation = results.evaluations?.[index];
                  
                  return (
                    <div key={index} className="space-y-4">
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                                Q{index + 1}
                              </span>
                              <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
                                {question.category}
                              </span>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                              {question.question}
                            </h3>
                          </div>
                          {evaluation && (
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreColor(evaluation.overallScore)}`}>
                              {evaluation.overallScore}/10
                            </span>
                          )}
                        </div>
                        
                        {answer ? (
                          <div className="mb-4">
                            <h4 className="font-medium text-gray-900 mb-2">Your Answer:</h4>
                            <div className="bg-white p-3 rounded border text-sm text-gray-700">
                              {answer.length > 300 ? `${answer.substring(0, 300)}...` : answer}
                            </div>
                          </div>
                        ) : (
                          <div className="mb-4 text-sm text-gray-500 italic">
                            No answer provided
                          </div>
                        )}
                      </div>
                      
                      {evaluation && (
                        <FeedbackPanel
                          evaluation={evaluation}
                          question={question.question}
                          answer={answer}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && performanceAnalytics && (
              <div className="space-y-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Performance Analytics</h2>
                
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">{performanceAnalytics.totalSessions}</div>
                    <div className="text-blue-800 font-medium">Total Sessions</div>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">{performanceAnalytics.averageScore}</div>
                    <div className="text-green-800 font-medium">Average Score</div>
                  </div>
                  
                  <div className={`border rounded-lg p-6 text-center ${
                    performanceAnalytics.improvementRate >= 0 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className={`text-3xl font-bold mb-2 ${
                      performanceAnalytics.improvementRate >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {performanceAnalytics.improvementRate > 0 ? '+' : ''}{performanceAnalytics.improvementRate}%
                    </div>
                    <div className={`font-medium ${
                      performanceAnalytics.improvementRate >= 0 ? 'text-green-800' : 'text-red-800'
                    }`}>
                      Improvement Rate
                    </div>
                  </div>
                </div>

                {performanceAnalytics.recommendations.length > 0 && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                    <h3 className="font-medium text-purple-900 mb-4">Personalized Recommendations</h3>
                    <ul className="space-y-2">
                      {performanceAnalytics.recommendations.map((rec: string, index: number) => (
                        <li key={index} className="text-sm text-purple-800 flex items-start gap-2">
                          <span className="text-purple-600 mt-1 text-xs">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/upload">
            <Button size="lg" className="flex items-center w-full sm:w-auto">
              <RefreshCw className="h-5 w-5 mr-2" />
              Practice Again
            </Button>
          </Link>

          <Link to="/history">
            <Button 
              variant="outline" 
              size="lg" 
              className="flex items-center w-full sm:w-auto"
            >
              <History className="h-5 w-5 mr-2" />
              View History
            </Button>
          </Link>
          
          <Button 
            variant="outline" 
            size="lg" 
            className="flex items-center w-full sm:w-auto"
            onClick={() => {
              const dataStr = JSON.stringify(results, null, 2);
              const dataBlob = new Blob([dataStr], {type: 'application/json'});
              const url = URL.createObjectURL(dataBlob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `interview-results-${new Date().toISOString().split('T')[0]}.json`;
              link.click();
            }}
          >
            <Download className="h-5 w-5 mr-2" />
            Download Report
          </Button>
          
          <Link to="/">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              Back to Home
            </Button>
          </Link>
        </div>

        {/* AI Attribution */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Brain className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-blue-900">Powered by Claude AI</span>
          </div>
          <p className="text-sm text-blue-700">
            Your responses were analyzed using advanced AI to provide personalized, actionable feedback for interview improvement.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;