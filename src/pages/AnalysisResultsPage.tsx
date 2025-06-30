import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, AlertCircle, TrendingUp, Target, Award, 
  ArrowRight, BarChart3, PieChart, Brain, Lightbulb,
  FileText, Briefcase, Star, Zap, Users, Clock,
  RefreshCw, Download, Share2, BookOpen, ChevronRight,
  Home, Upload as UploadIcon, Settings
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useToast } from '../hooks/useToast';
import Button from '../components/Button';
import LoadingStates from '../components/LoadingStates';
import ErrorMessage from '../components/ErrorMessage';
import QuestionConfiguration from '../components/interview/QuestionConfiguration';

const AnalysisResultsPage: React.FC = () => {
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'preparation'>('overview');
  const [showConfiguration, setShowConfiguration] = useState(false);
  const [interviewConfig, setInterviewConfig] = useState<any>(null);
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { analysis, questions, preparationTips } = useAppContext();

  useEffect(() => {
    const loadAnalysisResults = () => {
      try {
        // First try to get from context
        if (analysis) {
          setAnalysisData(analysis);
          setIsLoading(false);
          return;
        }

        // Then try localStorage
        const savedAnalysis = localStorage.getItem('interviewace_analysis_results');
        if (savedAnalysis) {
          const data = JSON.parse(savedAnalysis);
          setAnalysisData(data);
          setIsLoading(false);
          return;
        }

        // Finally try sessionStorage
        const sessionData = sessionStorage.getItem('interviewData');
        if (sessionData) {
          const data = JSON.parse(sessionData);
          if (data.analysis) {
            setAnalysisData(data.analysis);
            setIsLoading(false);
            return;
          }
        }

        // No analysis found
        setError('No analysis data found');
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load analysis:', error);
        setError('Failed to load analysis results');
        setIsLoading(false);
      }
    };

    loadAnalysisResults();
  }, [analysis]);

  const proceedToInterview = () => {
    if (interviewConfig) {
      // Store config and navigate
      localStorage.setItem('interview_config', JSON.stringify(interviewConfig));
      addToast('Starting your customized interview session!', 'success');
      navigate('/interview');
    } else {
      setShowConfiguration(true);
    }
  };

  const handleConfigurationComplete = (config: any) => {
    setInterviewConfig(config);
    setShowConfiguration(false);
    localStorage.setItem('interview_config', JSON.stringify(config));
    addToast('Configuration saved! Starting interview...', 'success');
    navigate('/interview');
  };

  const regenerateAnalysis = () => {
    addToast('Regenerating analysis with Claude AI...', 'info');
    navigate('/analysis');
  };

  const downloadReport = () => {
    const reportData = {
      analysis: analysisData,
      questions: questions || [],
      preparationTips: preparationTips || [],
      generatedAt: new Date().toISOString(),
      reportType: 'Interview Analysis Report'
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `interview-analysis-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    addToast('Analysis report downloaded!', 'success');
  };

  const shareResults = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Interview Analysis Results',
          text: `I scored ${analysisData.skillsMatch}% match for this position! Check out InterviewAce for AI-powered interview practice.`,
          url: window.location.origin
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback to clipboard
      const shareText = `I scored ${analysisData.skillsMatch}% match for this position using InterviewAce! Try it at ${window.location.origin}`;
      navigator.clipboard.writeText(shareText);
      addToast('Share text copied to clipboard!', 'success');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <LoadingStates
          type="analysis"
          message="Loading your analysis results..."
        />
      </div>
    );
  }

  if (error || !analysisData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <ErrorMessage
            type="general"
            title="Analysis Not Found"
            message="We couldn't find your analysis results. Please upload your documents first to get analysis results."
            onRetry={() => navigate('/upload')}
            actionLabel="Upload Documents"
          />
        </div>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-600';
    if (score >= 60) return 'from-yellow-500 to-orange-600';
    return 'from-red-500 to-pink-600';
  };

  const getMatchLevel = (score: number) => {
    if (score >= 85) return { level: 'Excellent Match', icon: '🎯', description: 'You\'re a strong candidate for this role!' };
    if (score >= 70) return { level: 'Good Match', icon: '✅', description: 'You have most of the required qualifications.' };
    if (score >= 55) return { level: 'Moderate Match', icon: '⚡', description: 'Some gaps to address, but good potential.' };
    return { level: 'Needs Development', icon: '📚', description: 'Focus on building key skills for this role.' };
  };

  const matchLevel = getMatchLevel(analysisData.skillsMatch);

  if (showConfiguration) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Customize Your Interview</h1>
            <p className="text-gray-600">Configure your practice session for optimal learning</p>
          </div>

          <QuestionConfiguration
            onConfigurationChange={setInterviewConfig}
            jobAnalysis={analysisData}
            onStartInterview={handleConfigurationComplete}
          />

          {/* Back Button */}
          <div className="mt-8 text-center">
            <Button
              variant="outline"
              onClick={() => setShowConfiguration(false)}
              className="flex items-center gap-2"
            >
              <ArrowRight className="h-4 w-4 rotate-180" />
              Back to Analysis Results
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex mb-6" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <button 
                onClick={() => navigate('/')} 
                className="text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-1"
              >
                <Home className="h-4 w-4" />
                Home
              </button>
            </li>
            <li className="inline-flex items-center">
              <ChevronRight className="h-4 w-4 text-gray-400 mx-1" />
              <button 
                onClick={() => navigate('/upload')} 
                className="text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-1"
              >
                <UploadIcon className="h-4 w-4" />
                Upload
              </button>
            </li>
            <li className="inline-flex items-center">
              <ChevronRight className="h-4 w-4 text-gray-400 mx-1" />
              <span className="text-blue-600 font-medium flex items-center gap-1">
                <Brain className="h-4 w-4" />
                Analysis Results
              </span>
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className={`w-20 h-20 rounded-full bg-gradient-to-r ${getScoreGradient(analysisData.skillsMatch)} flex items-center justify-center text-white text-2xl font-bold shadow-2xl`}>
                {analysisData.skillsMatch}%
              </div>
              <div className="absolute -top-2 -right-2 text-2xl">
                {matchLevel.icon}
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Document Analysis Complete
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            {matchLevel.description}
          </p>
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium ${
            analysisData.skillsMatch >= 80 ? 'bg-green-100 text-green-800' :
            analysisData.skillsMatch >= 60 ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            <Award className="h-5 w-5" />
            {matchLevel.level}
          </div>
        </div>

        {/* Overall Match Score Visualization */}
        <div className="bg-white rounded-2xl shadow-soft p-8 mb-8 border border-gray-100">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Overall Match Analysis</h2>
            
            {/* Circular Progress */}
            <div className="relative inline-flex items-center justify-center w-48 h-48 mb-6">
              <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-gray-200"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="transparent"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={getScoreColor(analysisData.skillsMatch)}
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="transparent"
                  strokeDasharray={`${analysisData.skillsMatch}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  style={{
                    strokeDashoffset: 0,
                    animation: 'progress 2s ease-in-out'
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-gray-900">{analysisData.skillsMatch}%</span>
                <span className="text-sm text-gray-600">Match Score</span>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{analysisData.experienceLevel}</div>
                <div className="text-gray-600">Experience Level</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{analysisData.strengths?.length || 0}</div>
                <div className="text-gray-600">Key Strengths</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{analysisData.experienceGaps?.length || 0}</div>
                <div className="text-gray-600">Areas to Address</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-soft mb-8 border border-gray-100">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'skills', label: 'Skills Analysis', icon: Target },
                { id: 'preparation', label: 'Interview Prep', icon: BookOpen }
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
                {/* Strengths and Gaps */}
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Strengths Section */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-green-100 rounded-xl">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-green-900">Your Strengths</h3>
                        <p className="text-green-700 text-sm">What makes you a great candidate</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {analysisData.strengths?.map((strength: any, index: number) => (
                        <div key={index} className="flex items-start gap-3 p-4 bg-white bg-opacity-60 rounded-lg border border-green-200">
                          <Star className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-green-900 font-medium">
                              {typeof strength === 'string' ? strength : strength.title || strength}
                            </p>
                            {typeof strength === 'object' && strength.description && (
                              <p className="text-green-700 text-sm mt-1">{strength.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Experience Gaps Section */}
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-orange-100 rounded-xl">
                        <AlertCircle className="h-6 w-6 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-orange-900">Areas to Address</h3>
                        <p className="text-orange-700 text-sm">Focus areas for interview preparation</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {analysisData.experienceGaps?.map((gap: any, index: number) => (
                        <div key={index} className="flex items-start gap-3 p-4 bg-white bg-opacity-60 rounded-lg border border-orange-200">
                          <Target className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-orange-900 font-medium">
                              {typeof gap === 'string' ? gap : gap.area || gap}
                            </p>
                            {typeof gap === 'object' && gap.suggestion && (
                              <p className="text-orange-700 text-sm mt-1">{gap.suggestion}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Overall Assessment */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <Brain className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-blue-900">Claude AI Assessment</h3>
                  </div>
                  <p className="text-blue-800 leading-relaxed text-lg">
                    {analysisData.overallFit}
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-blue-700">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium">Confidence Level: {analysisData.confidenceLevel}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Skills Analysis Tab */}
            {activeTab === 'skills' && (
              <div className="space-y-8">
                {/* Skills Breakdown */}
                {analysisData.skillsBreakdown && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <BarChart3 className="h-6 w-6 text-purple-600" />
                      Skills Assessment Breakdown
                    </h3>
                    
                    <div className="grid gap-4">
                      {analysisData.skillsBreakdown.map((skill: any, index: number) => (
                        <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-3">
                            <span className="font-semibold text-gray-900">{skill.name}</span>
                            <span className={`text-lg font-bold px-3 py-1 rounded-full ${
                              skill.score >= 8 ? 'bg-green-100 text-green-700' :
                              skill.score >= 6 ? 'bg-yellow-100 text-yellow-700' : 
                              'bg-red-100 text-red-700'
                            }`}>
                              {skill.score}/10
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                            <div 
                              className={`h-3 rounded-full transition-all duration-1000 ${
                                skill.score >= 8 ? 'bg-green-500' :
                                skill.score >= 6 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${skill.score * 10}%` }}
                            />
                          </div>
                          {skill.note && (
                            <p className="text-sm text-gray-600 mt-2">{skill.note}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Recommendations */}
                {analysisData.keyRecommendations && (
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-purple-900 mb-4 flex items-center gap-2">
                      <Lightbulb className="h-6 w-6" />
                      Key Recommendations
                    </h3>
                    <div className="space-y-3">
                      {analysisData.keyRecommendations.map((rec: string, index: number) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-white bg-opacity-60 rounded-lg">
                          <Zap className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                          <p className="text-purple-800">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Interview Preparation Tab */}
            {activeTab === 'preparation' && (
              <div className="space-y-8">
                {/* Focus Areas */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Target className="h-6 w-6 text-blue-600" />
                    Interview Preparation Focus Areas
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    {analysisData.focusAreas?.map((area: any, index: number) => (
                      <div key={index} className="p-6 border border-blue-200 rounded-xl hover:bg-blue-50 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Zap className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">
                              {typeof area === 'string' ? area : area.title || area}
                            </h4>
                            {typeof area === 'object' && area.description && (
                              <p className="text-gray-600 text-sm mb-3">{area.description}</p>
                            )}
                            {typeof area === 'object' && area.tips && (
                              <ul className="text-sm text-gray-600 space-y-1">
                                {area.tips.map((tip: string, tipIndex: number) => (
                                  <li key={tipIndex} className="flex items-start gap-2">
                                    <span className="text-blue-500 mt-1 text-xs">•</span>
                                    {tip}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Expected Interview Questions Preview */}
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-indigo-900 mb-4 flex items-center gap-2">
                    <FileText className="h-6 w-6" />
                    What to Expect in Your Interview
                  </h3>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 bg-white bg-opacity-60 rounded-lg border border-indigo-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Briefcase className="h-5 w-5 text-indigo-600" />
                        <h4 className="font-semibold text-indigo-900">Technical Questions</h4>
                      </div>
                      <p className="text-sm text-indigo-700">
                        {analysisData.questionPreview?.technical || "Questions about your technical skills and experience relevant to the role"}
                      </p>
                    </div>
                    <div className="p-4 bg-white bg-opacity-60 rounded-lg border border-indigo-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-5 w-5 text-indigo-600" />
                        <h4 className="font-semibold text-indigo-900">Behavioral Questions</h4>
                      </div>
                      <p className="text-sm text-indigo-700">
                        {analysisData.questionPreview?.behavioral || "Situational questions using the STAR method to assess soft skills"}
                      </p>
                    </div>
                    <div className="p-4 bg-white bg-opacity-60 rounded-lg border border-indigo-200">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="h-5 w-5 text-indigo-600" />
                        <h4 className="font-semibold text-indigo-900">Gap-Focused Questions</h4>
                      </div>
                      <p className="text-sm text-indigo-700">
                        {analysisData.questionPreview?.gaps || "Questions addressing areas where you may lack direct experience"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Interview Tips */}
                <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-green-900 mb-4 flex items-center gap-2">
                    <Lightbulb className="h-6 w-6" />
                    Pro Interview Tips
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-green-800 mb-2">Before the Interview:</h4>
                      <ul className="text-sm text-green-700 space-y-1">
                        <li>• Research the company's recent news and initiatives</li>
                        <li>• Prepare 3-5 STAR method examples</li>
                        <li>• Practice explaining technical concepts simply</li>
                        <li>• Prepare thoughtful questions about the role</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-green-800 mb-2">During the Interview:</h4>
                      <ul className="text-sm text-green-700 space-y-1">
                        <li>• Take a moment to think before answering</li>
                        <li>• Use specific examples with quantifiable results</li>
                        <li>• Connect your experience to their needs</li>
                        <li>• Show enthusiasm and ask follow-up questions</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Button
            size="lg"
            onClick={proceedToInterview}
            className="flex items-center justify-center gap-3 px-8 py-4 text-lg btn-hover-lift shadow-glow"
          >
            <Settings className="h-6 w-6" />
            Customize & Start Interview
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            onClick={regenerateAnalysis}
            className="flex items-center justify-center gap-3 px-8 py-4"
          >
            <RefreshCw className="h-5 w-5" />
            Regenerate Analysis
          </Button>
        </div>

        {/* Secondary Actions */}
        <div className="flex flex-wrap gap-3 justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={downloadReport}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download Report
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={shareResults}
            className="flex items-center gap-2"
          >
            <Share2 className="h-4 w-4" />
            Share Results
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/upload')}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Upload New Documents
          </Button>
        </div>

        {/* AI Attribution */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Brain className="h-6 w-6 text-blue-600" />
            <span className="font-semibold text-blue-900 text-lg">Powered by AI</span>
          </div>
          <p className="text-blue-700 leading-relaxed">
            Your documents were analyzed using advanced AI to provide personalized, actionable insights for interview success. 
            The analysis considers your unique background, experience level, and the specific job requirements to create 
            a tailored preparation strategy.
          </p>
          <div className="mt-4 flex items-center justify-center gap-4 text-sm text-blue-600">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>Analysis completed in under 60 seconds</span>
            </div>
            <div className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              <span>Personalized for your profile</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResultsPage;