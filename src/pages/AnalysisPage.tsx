import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrainCircuit, FileText, Target, MessageSquare, AlertCircle, RefreshCw } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useToast } from '../hooks/useToast';
import ProgressBar from '../components/ProgressBar';
import LoadingStates from '../components/LoadingStates';
import Button from '../components/Button';
import { analyzeDocuments, generateQuestions, generateQuestionsWithConfig } from '../services/apiService';

const AnalysisPage: React.FC = () => {
  const {
    cvText,
    cvMetadata,
    jobDescription,
    setAnalysis,
    setQuestions,
    setPreparationTips,
    isLoading,
    setIsLoading,
    error,
    setError,
    processingStep,
    setProcessingStep
  } = useAppContext();

  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState(0);
  const navigate = useNavigate();
  const { addToast } = useToast();

  const steps = [
    'Loading your documents...',
    'Analyzing CV with AI...',
    'Identifying skills and experience gaps...',
    'Generating personalized questions...',
    'Preparing your interview session...'
  ];

  useEffect(() => {
    // Check if we have required data
    if (!cvText || !jobDescription) {
      // Try to load from sessionStorage as fallback
      const storedData = sessionStorage.getItem('interviewData');
      if (!storedData) {
        navigate('/upload');
        return;
      }
      
      const data = JSON.parse(storedData);
      if (!data.cvText || !data.jobDescription) {
        navigate('/upload');
        return;
      }
    }

    // Start the analysis process
    processDocuments();
  }, [cvText, jobDescription, navigate]);

  const generateSkillsBreakdown = (analysis: any) => {
    // Generate a skills breakdown if not provided by the API
    const defaultSkills = [
      { name: 'Technical Skills', score: Math.min(10, Math.max(1, analysis.skillsMatch / 10)), note: 'Based on CV technical content' },
      { name: 'Experience Level', score: Math.min(10, Math.max(1, (analysis.skillsMatch + 10) / 10)), note: 'Years of relevant experience' },
      { name: 'Communication', score: Math.min(10, Math.max(1, (analysis.skillsMatch - 5) / 10)), note: 'Inferred from CV presentation' },
      { name: 'Leadership', score: Math.min(10, Math.max(1, (analysis.skillsMatch - 10) / 10)), note: 'Based on role descriptions' }
    ];
    
    return analysis.skillsBreakdown || defaultSkills;
  };

  const processDocuments = async () => {
    setIsLoading(true);
    setError(null);
    setProgress(10);
    setCurrentStep(0);
    setEstimatedTimeRemaining(60);

    try {
      // Step 1: Initial setup
      setProcessingStep('Preparing documents for analysis...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProgress(20);
      setCurrentStep(1);
      setEstimatedTimeRemaining(50);

      // Step 2: Analyze documents with Claude AI
      setProcessingStep('Analyzing CV and job description with AI...');
      const startTime = Date.now();
      
      const analysis = await analyzeDocuments(cvText, jobDescription);
      
      const analysisTime = Date.now() - startTime;
      console.log(`Document analysis completed in ${analysisTime}ms`);
      
      setProgress(50);
      setCurrentStep(2);
      setEstimatedTimeRemaining(30);

      // Step 3: Process analysis results
      setProcessingStep('Processing analysis results...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProgress(70);
      setCurrentStep(3);
      setEstimatedTimeRemaining(20);

      // Step 4: Generate questions with Claude AI
      setProcessingStep('Generating personalized interview questions...');
      const questionStartTime = Date.now();
      
      // Try to load config from localStorage
      let config = null;
      const configStr = localStorage.getItem('interview_config');
      if (configStr) {
        try {
          config = JSON.parse(configStr);
        } catch (e) {
          console.error('Failed to parse interview config:', e);
        }
      }

      let questionData;
      if (config) {
        // Use config-aware question generation
        questionData = await generateQuestionsWithConfig(cvText, jobDescription, analysis, config);
      } else {
        // Fallback to default
        questionData = await generateQuestions(cvText, jobDescription, analysis);
      }
      
      const questionTime = Date.now() - questionStartTime;
      console.log(`Question generation completed in ${questionTime}ms`);
      
      setQuestions(questionData.questions || []);
      setPreparationTips(questionData.preparationTips || []);
      setProgress(90);
      setCurrentStep(4);
      setEstimatedTimeRemaining(5);

      // Step 5: Finalize and create enhanced analysis
      setProcessingStep('Finalizing your analysis results...');
      
      // Enhanced analysis data structure
      const enhancedAnalysis = {
        ...analysis,
        skillsBreakdown: generateSkillsBreakdown(analysis),
        questionPreview: {
          technical: "Questions about your programming experience and system design",
          behavioral: "Leadership scenarios and team collaboration examples", 
          gaps: "Questions about areas where you may need to demonstrate transferable skills"
        },
        timestamp: new Date().toISOString(),
        processingTime: Date.now() - startTime
      };
      
      setAnalysis(enhancedAnalysis);
      setProgress(100);
      setEstimatedTimeRemaining(0);

      // Store complete results for analysis results page
      const analysisResultsData = {
        ...enhancedAnalysis,
        questions: questionData.questions || [],
        preparationTips: questionData.preparationTips || [],
        estimatedDuration: questionData.estimatedDuration || '45-60 minutes',
        processedAt: new Date().toISOString()
      };

      // Save to both localStorage and sessionStorage
      localStorage.setItem('interviewace_analysis_results', JSON.stringify(analysisResultsData));
      sessionStorage.setItem('interviewData', JSON.stringify({
        cvText,
        cvMetadata,
        jobDescription,
        analysis: enhancedAnalysis,
        questions: questionData.questions || [],
        preparationTips: questionData.preparationTips || [],
        uploadedAt: new Date().toISOString()
      }));

      addToast('Analysis completed successfully!', 'success');

      // Navigate to analysis results page instead of interview
      setTimeout(() => {
        navigate('/analysis-results');
      }, 1500);

    } catch (error) {
      console.error('Analysis error:', error);
      setError(error instanceof Error ? error.message : 'Failed to analyze documents');
      setIsLoading(false);
      setProgress(0);
      setCurrentStep(0);
      setEstimatedTimeRemaining(0);
      addToast('Analysis failed. Please try again.', 'error');
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    addToast('Retrying analysis...', 'info');
    processDocuments();
  };

  const handleGoBack = () => {
    navigate('/upload');
  };

  // Update estimated time remaining
  useEffect(() => {
    if (isLoading && estimatedTimeRemaining > 0) {
      const timer = setInterval(() => {
        setEstimatedTimeRemaining(prev => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isLoading, estimatedTimeRemaining]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-soft p-8 text-center border border-red-100">
            <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Analysis Failed
            </h1>
            <p className="text-gray-600 mb-2 text-lg">
              {error}
            </p>
            {retryCount > 0 && (
              <p className="text-sm text-gray-500 mb-6">
                Retry attempt: {retryCount}
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={handleRetry}
                className="flex items-center btn-hover-lift"
                disabled={retryCount >= 3}
                size="lg"
              >
                <RefreshCw className="h-5 w-5 mr-2" />
                {retryCount >= 3 ? 'Max Retries Reached' : 'Try Again'}
              </Button>
              <Button
                variant="outline"
                onClick={handleGoBack}
                size="lg"
              >
                Go Back to Upload
              </Button>
            </div>
            {retryCount >= 3 && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  If the problem persists, please check your internet connection or try again later. 
                  The AI service may be temporarily unavailable.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const cvWordCount = cvMetadata?.wordCount || cvText.split(/\s+/).length;
  const jobDescWordCount = jobDescription.split(/\s+/).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-soft p-8 border border-gray-100">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <BrainCircuit className="h-16 w-16 text-blue-600 animate-pulse" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Analyzing Your Documents
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              AI is processing your CV and job description to create personalized interview questions.
            </p>
          </div>

          {/* Progress Section */}
          <div className="mb-8">
            <ProgressBar
              progress={progress}
              steps={steps}
              currentStep={currentStep}
            />
          </div>

          {/* Status */}
          <div className="text-center mb-8">
            <LoadingStates 
              type="analysis" 
              message={processingStep || steps[currentStep]}
              progress={progress}
            />
            <div className="mt-6">
              <p className="text-sm text-gray-600 mb-2">
                {Math.round(progress)}% complete
              </p>
              {estimatedTimeRemaining > 0 && (
                <p className="text-xs text-gray-500">
                  Estimated time remaining: {estimatedTimeRemaining} seconds
                </p>
              )}
            </div>
          </div>

          {/* Document Summary */}
          <div className="mb-8 grid gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <FileText className="h-6 w-6 text-blue-600" />
                <h3 className="font-semibold text-blue-900">Documents Being Analyzed</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
                <div>
                  <p className="font-medium mb-2">Your CV:</p>
                  <ul className="space-y-1">
                    <li>• {cvWordCount} words processed</li>
                    <li>• Skills and experience extracted</li>
                    <li>• Professional background analyzed</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium mb-2">Job Description:</p>
                  <ul className="space-y-1">
                    <li>• {jobDescWordCount} words analyzed</li>
                    <li>• Requirements identified</li>
                    <li>• Key competencies mapped</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Information Cards */}
          <div className="grid gap-4 mb-8">
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Target className="h-6 w-6 text-green-600" />
                <h3 className="font-semibold text-green-900">What you'll get:</h3>
              </div>
              <ul className="text-sm text-green-800 space-y-2">
                <li>• 8-10 personalized interview questions</li>
                <li>• Questions tailored to your experience level</li>
                <li>• Role-specific scenarios and challenges</li>
                <li>• Behavioral and technical questions</li>
                <li>• Detailed analysis of your strengths and gaps</li>
              </ul>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <MessageSquare className="h-6 w-6 text-purple-600" />
                <h3 className="font-semibold text-purple-900">AI Analysis includes:</h3>
              </div>
              <ul className="text-sm text-purple-800 space-y-2">
                <li>• Skills gap analysis between CV and job requirements</li>
                <li>• Strength identification and leverage opportunities</li>
                <li>• Industry-specific competency assessment</li>
                <li>• Personalized improvement recommendations</li>
                <li>• Interview preparation strategy</li>
              </ul>
            </div>
          </div>

          {/* Processing Info */}
          <div className="text-center">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Powered by Claude AI</strong> - Advanced language model for intelligent document analysis
              </p>
              <p className="text-xs text-gray-500">
                Processing typically takes 30-60 seconds depending on document complexity
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisPage;