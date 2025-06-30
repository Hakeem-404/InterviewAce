import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, BrainCircuit, AlertTriangle, CheckCircle, Sparkles } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import { useToast } from '../hooks/useToast';
import { useAutoSave } from '../hooks/useAutoSave';
import FileUpload from '../components/FileUpload';
import JobDescriptionInput from '../components/JobDescriptionInput';
import Button from '../components/Button';
import LoadingStates from '../components/LoadingStates';
import ErrorMessage from '../components/ErrorMessage';
import UpgradePrompt from '../components/premium/UpgradePrompt';
import PremiumFeatureGate from '../components/premium/PremiumFeatureGate';

interface FileData {
  file: File | null;
  text: string;
  metadata: object | null;
}

const UploadPage: React.FC = () => {
  const {
    cvText,
    setCvText,
    cvMetadata,
    setCvMetadata,
    jobDescription,
    setJobDescription,
    resetSession
  } = useAppContext();
  
  const { user } = useAuth();
  const { canUseFeature, trackUsage } = useSubscription();
  
  const [localCvData, setLocalCvData] = useState<FileData>({ file: null, text: cvText, metadata: cvMetadata });
  const [isLoading, setIsLoading] = useState(false);
  const [showTextPreviews, setShowTextPreviews] = useState(false);
  const [hasResetSession, setHasResetSession] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [canUseQuestions, setCanUseQuestions] = useState(true);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const navigate = useNavigate();
  const { addToast } = useToast();

  // Auto-save functionality
  const { saveNow } = useAutoSave(
    { cvText: localCvData.text, jobDescription },
    'interview-draft',
    15000, // Save every 15 seconds
    !!(localCvData.text || jobDescription)
  );

  // Reset session only once when component mounts
  useEffect(() => {
    if (!hasResetSession) {
      resetSession();
      setHasResetSession(true);
      addToast('Welcome! Upload your documents to get started.', 'info');
    }
  }, [resetSession, hasResetSession, addToast]);

  // Check if user can use questions
  useEffect(() => {
    const checkAccess = async () => {
      if (user) {
        setIsCheckingAccess(true);
        try {
          const hasAccess = await canUseFeature('question');
          setCanUseQuestions(hasAccess);
        } catch (error) {
          console.error('Failed to check question access:', error);
          setCanUseQuestions(false);
        } finally {
          setIsCheckingAccess(false);
        }
      } else {
        setCanUseQuestions(true);
        setIsCheckingAccess(false);
      }
    };

    checkAccess();
  }, [user, canUseFeature]);

  const handleCvUpload = (result: FileData) => {
    console.log('CV Upload result:', result);
    setLocalCvData(result);
    setCvText(result.text);
    setCvMetadata(result.metadata);
    
    if (result.text) {
      addToast('CV uploaded successfully!', 'success');
      saveNow(); // Save immediately after upload
    }
  };

  const handleJobDescriptionChange = (value: string) => {
    console.log('Job description changed:', value.length, 'characters');
    setJobDescription(value);
    
    // Clear validation errors when user starts typing
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  const validateInputs = (): boolean => {
    const errors: string[] = [];
    
    if (!localCvData.file) {
      errors.push('Please upload your CV document');
    } else if (!localCvData.text || localCvData.text.trim().length <= 10) {
      errors.push('CV appears to be empty or too short - please upload a complete resume');
    }
    
    if (!jobDescription.trim()) {
      errors.push('Please provide a job description');
    } else if (jobDescription.trim().length < 50) {
      errors.push(`Job description should be more detailed (minimum 50 characters, currently ${jobDescription.trim().length})`);
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleAnalyze = async () => {
    if (!validateInputs()) {
      addToast('Please complete all required fields', 'error');
      return;
    }

    // Check if user can use questions
    if (user && !canUseQuestions) {
      addToast('You have reached your monthly question limit', 'error');
      return;
    }

    setIsLoading(true);
    
    try {
      // Store data in sessionStorage as backup
      const sessionData = {
        cvText: localCvData.text,
        cvMetadata: localCvData.metadata,
        jobDescription: jobDescription.trim(),
        uploadedAt: new Date().toISOString()
      };
      
      sessionStorage.setItem('interviewData', JSON.stringify(sessionData));
      saveNow(); // Final save before navigation
      
      // Track usage if user is logged in
      if (user) {
        await trackUsage('question');
      }
      
      addToast('Documents uploaded successfully! Starting analysis...', 'success');
      
      // Simulate processing time with progress
      setTimeout(() => {
        navigate('/analysis');
      }, 1500);
      
    } catch (error) {
      console.error('Upload error:', error);
      addToast('Failed to process documents. Please try again.', 'error');
      setIsLoading(false);
    }
  };

  const handleReupload = () => {
    setLocalCvData({ file: null, text: '', metadata: null });
    setCvText('');
    setCvMetadata(null);
    setValidationErrors([]);
    addToast('Ready for new CV upload', 'info');
  };

  // Improved validation logic
  const isValidForAnalysis = React.useMemo(() => {
    const hasValidCv = localCvData.file && localCvData.text && localCvData.text.trim().length > 10;
    const hasValidJobDesc = jobDescription.trim().length >= 50;
    
    return hasValidCv && hasValidJobDesc;
  }, [localCvData.file, localCvData.text, jobDescription]);

  const cvWordCount = localCvData.metadata ? (localCvData.metadata as any).wordCount : 0;
  const jobDescWordCount = jobDescription.trim().split(/\s+/).filter(word => word.length > 0).length;

  const getPreviewText = (text: string, maxLength: number = 150): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <LoadingStates
            type="upload"
            message="Processing your documents..."
            progress={75}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <BrainCircuit className="h-16 w-16 text-blue-600 animate-float" />
              <div className="absolute -top-2 -right-2">
                <Sparkles className="h-6 w-6 text-yellow-500 animate-pulse" />
              </div>
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 gradient-text">
            Upload Your Documents
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Upload your CV and provide the job description to get personalized interview questions powered by AI.
          </p>
        </div>

        {/* Usage Warning for Free Users */}
        {!isCheckingAccess && !canUseQuestions && (
          <div className="max-w-6xl mx-auto mb-8">
            <UpgradePrompt 
              feature="questions"
              message="You've reached your monthly limit of free questions. Upgrade to premium for unlimited access."
            />
          </div>
        )}

        {/* Upload Form */}
        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto mb-8">
          {/* CV Upload */}
          <div className="bg-white rounded-2xl shadow-soft p-8 card-hover border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Upload Your CV</h2>
              </div>
              {localCvData.file && (
                <button
                  onClick={handleReupload}
                  className="text-sm text-blue-600 hover:text-blue-700 transition-colors font-medium"
                >
                  Re-upload
                </button>
              )}
            </div>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Upload your resume in PDF, DOC, DOCX, or TXT format. Our AI will analyze your skills, experience, and qualifications.
            </p>
            <FileUpload
              onFileSelect={handleCvUpload}
              label=""
              acceptedTypes={['.pdf', '.doc', '.docx', '.txt']}
              maxSize={10}
            />
          </div>

          {/* Job Description */}
          <div className="bg-white rounded-2xl shadow-soft p-8 card-hover border border-gray-100">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-green-100 rounded-lg">
                <BrainCircuit className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Job Description</h2>
            </div>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Paste or upload the job description you're applying for. The more detailed it is, the better we can tailor your questions.
            </p>
            <JobDescriptionInput
              value={jobDescription}
              onChange={handleJobDescriptionChange}
              placeholder="Paste the complete job description here including requirements, responsibilities, and qualifications..."
            />
          </div>
        </div>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="max-w-6xl mx-auto mb-8">
            <ErrorMessage
              type="validation"
              title="Please complete the following:"
              message={validationErrors.join(' • ')}
              onDismiss={() => setValidationErrors([])}
            />
          </div>
        )}

        {/* Document Analysis Summary */}
        {(localCvData.text || jobDescription.trim()) && (
          <div className="max-w-6xl mx-auto mb-8">
            <div className="bg-white rounded-2xl shadow-soft p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Document Analysis Summary</h3>
                <button
                  onClick={() => setShowTextPreviews(!showTextPreviews)}
                  className="text-sm text-blue-600 hover:text-blue-700 transition-colors font-medium"
                >
                  {showTextPreviews ? 'Hide Previews' : 'Show Previews'}
                </button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* CV Summary */}
                {localCvData.text && (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-gray-900">CV Processed</span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>• {cvWordCount} words extracted</p>
                      <p>• {localCvData.metadata ? (localCvData.metadata as any).filename : 'File processed'}</p>
                      <p>• Ready for AI analysis</p>
                    </div>
                    {showTextPreviews && (
                      <div className="bg-gray-50 p-3 rounded-lg border text-sm text-gray-700">
                        <p className="font-medium mb-1">CV Preview:</p>
                        <p className="leading-relaxed">{getPreviewText(localCvData.text)}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Job Description Summary */}
                {jobDescription.trim() && (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-gray-900">Job Description Added</span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>• {jobDescWordCount} words provided</p>
                      <p>• Requirements identified</p>
                      <p>• Ready for AI matching</p>
                    </div>
                    {showTextPreviews && (
                      <div className="bg-gray-50 p-3 rounded-lg border text-sm text-gray-700">
                        <p className="font-medium mb-1">Job Description Preview:</p>
                        <p className="leading-relaxed">{getPreviewText(jobDescription)}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Analyze Button */}
        <div className="text-center mb-12">
          <PremiumFeatureGate
            feature="question"
            fallback={
              <div className="space-y-4">
                <Button
                  size="lg"
                  disabled={true}
                  className="px-12 py-4 text-lg opacity-50 cursor-not-allowed"
                >
                  Monthly Limit Reached
                </Button>
                <UpgradePrompt 
                  feature="questions"
                  message="You've reached your monthly limit of free questions. Upgrade to premium for unlimited access."
                />
              </div>
            }
          >
            <Button
              size="lg"
              onClick={handleAnalyze}
              disabled={!isValidForAnalysis || isLoading}
              loading={isLoading}
              className="px-12 py-4 text-lg btn-hover-lift shadow-glow"
            >
              {isLoading ? 'Processing Documents...' : 'Analyze Documents & Generate Questions'}
            </Button>
          </PremiumFeatureGate>
          
          {isValidForAnalysis && (
            <p className="text-sm text-gray-600 mt-4">
              This usually takes 30-60 seconds to complete using AI
            </p>
          )}
        </div>

        {/* Processing Info */}
        {isValidForAnalysis && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
              <h3 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Ready for AI Analysis!
              </h3>
              <div className="grid md:grid-cols-2 gap-6 text-sm text-blue-800">
                <div>
                  <p className="font-medium mb-2">Your CV contains:</p>
                  <ul className="space-y-1">
                    <li>• {cvWordCount} words of content</li>
                    <li>• Skills and experience data</li>
                    <li>• Professional background</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium mb-2">Job description includes:</p>
                  <ul className="space-y-1">
                    <li>• {jobDescWordCount} words of requirements</li>
                    <li>• Role responsibilities</li>
                    <li>• Required qualifications</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Features Preview */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-soft p-8 border border-gray-100">
            <h3 className="text-2xl font-semibold text-gray-900 mb-8 text-center">
              What happens next?
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: 1,
                  title: 'AI Document Analysis',
                  description: 'AI extracts and analyzes key information from your CV and job description',
                  icon: <BrainCircuit className="h-6 w-6" />,
                  color: 'blue'
                },
                {
                  step: 2,
                  title: 'Question Generation',
                  description: 'Personalized interview questions based on your profile and role requirements',
                  icon: <FileText className="h-6 w-6" />,
                  color: 'green'
                },
                {
                  step: 3,
                  title: 'Practice Session',
                  description: 'Interactive interview with real-time AI feedback and improvement tips',
                  icon: <Sparkles className="h-6 w-6" />,
                  color: 'purple'
                }
              ].map((item) => (
                <div key={item.step} className="text-center group">
                  <div className={`
                    w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center
                    bg-gradient-to-r transition-all duration-300 group-hover:scale-110
                    ${item.color === 'blue' ? 'from-blue-500 to-blue-600' : 
                      item.color === 'green' ? 'from-green-500 to-green-600' : 
                      'from-purple-500 to-purple-600'}
                    text-white shadow-lg
                  `}>
                    {item.icon}
                  </div>
                  <div className={`
                    w-8 h-8 mx-auto mb-4 rounded-full flex items-center justify-center
                    bg-gradient-to-r font-bold text-white text-sm shadow-md
                    ${item.color === 'blue' ? 'from-blue-400 to-blue-500' : 
                      item.color === 'green' ? 'from-green-400 to-green-500' : 
                      'from-purple-400 to-purple-500'}
                  `}>
                    {item.step}
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-3 text-lg">{item.title}</h4>
                  <p className="text-gray-600 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;