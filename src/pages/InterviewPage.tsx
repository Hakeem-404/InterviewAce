import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Clock, MessageSquare, AlertCircle, Mic2, Volume2, Brain, Settings, Sliders, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useToast } from '../hooks/useToast';
import InterviewCard from '../components/InterviewCard';
import Button from '../components/Button';
import VoiceControls from '../components/VoiceControls';
import VoiceSelector from '../components/VoiceSelector';
import QuestionReader from '../components/QuestionReader';
import FeedbackPanel from '../components/FeedbackPanel';
import LoadingStates from '../components/LoadingStates';
import QuestionConfiguration from '../components/interview/QuestionConfiguration';
import { evaluateResponse } from '../services/apiService';
import { preloadQuestionAudio } from '../services/voiceService';

const InterviewPage: React.FC = () => {
  const {
    questions,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    answers,
    updateAnswer,
    evaluations,
    updateEvaluation,
    interviewStartTime,
    setInterviewStartTime,
    getAnsweredQuestionsCount,
    cvText
  } = useAppContext();

  const [timeElapsed, setTimeElapsed] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState<string>('');
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [showVoiceSelector, setShowVoiceSelector] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showConfiguration, setShowConfiguration] = useState(false);
  const [interviewConfig, setInterviewConfig] = useState<any>(null);
  const [showEndConfirmation, setShowEndConfirmation] = useState(false);
  
  // Enhanced voice settings
  const [voiceSettings, setVoiceSettings] = useState({
    voiceType: 'professional_female',
    stability: 0.75,
    similarity_boost: 0.85,
    style: 0.2,
    speaking_rate: 1.0,
    autoPlay: true,
    autoProgress: false,
    pauseDuration: 3
  });

  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    // Check if we have questions
    if (!questions || questions.length === 0) {
      // Try to load from sessionStorage
      const storedData = sessionStorage.getItem('interviewData');
      if (!storedData) {
        navigate('/upload');
        return;
      }

      const data = JSON.parse(storedData);
      if (!data.questions || data.questions.length === 0) {
        navigate('/upload');
        return;
      }
    }

    // Set interview start time
    if (!interviewStartTime) {
      setInterviewStartTime(new Date().toISOString());
    }

    // Load interview configuration if available
    const savedConfig = localStorage.getItem('interview_config');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        setInterviewConfig(config);
        
        // Apply voice mode setting from config
        if (config.voiceMode !== undefined) {
          setIsVoiceMode(config.voiceMode);
        }
      } catch (error) {
        console.error('Failed to parse interview configuration:', error);
      }
    }
  }, [questions, navigate, interviewStartTime, setInterviewStartTime]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Load current answer when question changes
    const savedAnswer = answers[currentQuestionIndex] || '';
    setCurrentAnswer(savedAnswer);
    setShowFeedback(false); // Hide feedback when changing questions
  }, [currentQuestionIndex, answers]);

  // Preload audio for upcoming questions when voice mode is enabled
  useEffect(() => {
    if (isVoiceMode && questions && questions.length > 0) {
      preloadQuestionAudio(questions, currentQuestionIndex, {
        voiceType: voiceSettings.voiceType,
        ...voiceSettings
      });
    }
  }, [isVoiceMode, questions, currentQuestionIndex, voiceSettings]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (value: string) => {
    setCurrentAnswer(value);
    updateAnswer(currentQuestionIndex, value);
  };

  const handleTranscriptChange = (transcript: string) => {
    if (isVoiceMode && transcript && transcript.trim() !== currentAnswer.trim()) {
      handleAnswerChange(transcript);
    }
  };

  const evaluateCurrentAnswer = async () => {
    if (!currentAnswer.trim() || !questions[currentQuestionIndex]) {
      addToast('Please provide an answer before requesting evaluation', 'warning');
      return;
    }

    setIsEvaluating(true);
    setError('');

    try {
      const question = questions[currentQuestionIndex];
      const evaluation = await evaluateResponse(
        question.question,
        currentAnswer,
        cvText, // Pass CV context for personalized feedback
        question.category,
        {
          focusArea: question.focusArea,
          difficulty: question.difficulty,
          tips: question.tips
        }
      );

      updateEvaluation(currentQuestionIndex, evaluation);
      setShowFeedback(true);
      addToast('AI evaluation completed!', 'success');

    } catch (error) {
      console.error('Evaluation error:', error);
      setError('Failed to evaluate answer. You can continue without evaluation.');
      addToast('Evaluation failed. Please try again.', 'error');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNextQuestion = async () => {
    // Evaluate current answer if it hasn't been evaluated yet
    if (currentAnswer.trim() && !evaluations[currentQuestionIndex] && !isEvaluating) {
      await evaluateCurrentAnswer();
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      
      // Auto-progress delay in voice mode
      if (isVoiceMode && voiceSettings.autoProgress) {
        setTimeout(() => {
          // Auto-advance after pause duration
        }, voiceSettings.pauseDuration * 1000);
      }
    } else {
      // Interview complete - store results and navigate
      finishInterview();
    }
  };

  const finishInterview = () => {
    // Store results and navigate
    const finalData = {
      questions,
      answers,
      evaluations,
      completedAt: new Date().toISOString(),
      totalTime: timeElapsed,
      startTime: interviewStartTime,
      voiceMode: isVoiceMode,
      voiceSettings,
      jobTitle: interviewConfig?.jobTitle || 'Practice Interview',
      companyName: interviewConfig?.companyName || '',
      cvText: cvText
    };
    
    sessionStorage.setItem('interviewResults', JSON.stringify(finalData));
    addToast('Interview completed! Generating your results...', 'success');
    navigate('/results');
  };

  const handleEndInterview = () => {
    setShowEndConfirmation(true);
  };

  const confirmEndInterview = () => {
    finishInterview();
  };

  const cancelEndInterview = () => {
    setShowEndConfirmation(false);
  };

  const handleVoiceModeChange = (enabled: boolean) => {
    setIsVoiceMode(enabled);
    if (enabled) {
      addToast('Voice mode enabled! Questions will be read aloud.', 'info');
    } else {
      addToast('Voice mode disabled.', 'info');
    }
  };

  const handleVoiceChange = (voiceType: string) => {
    setVoiceSettings(prev => ({ ...prev, voiceType }));
    addToast(`Voice changed to ${voiceType.replace(/_/g, ' ')}`, 'info');
  };

  const handleVoiceSettingsChange = (newSettings: any) => {
    setVoiceSettings(prev => ({ ...prev, ...newSettings }));
  };

  const handleConfigurationChange = (config: any) => {
    setInterviewConfig(config);
    localStorage.setItem('interview_config', JSON.stringify(config));
    
    // Apply voice mode setting from config
    if (config.voiceMode !== undefined) {
      setIsVoiceMode(config.voiceMode);
    }
    
    addToast('Interview configuration updated!', 'success');
  };

  const toggleFeedback = () => {
    setShowFeedback(!showFeedback);
  };

  if (showConfiguration) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Customize Your Interview</h1>
            <p className="text-gray-600">Configure your practice session for optimal learning</p>
          </div>
          
          <QuestionConfiguration
            onConfigurationChange={handleConfigurationChange}
            defaultConfig={interviewConfig}
            onStartInterview={() => setShowConfiguration(false)}
          />
          
          <div className="mt-8 text-center">
            <Button
              variant="outline"
              onClick={() => setShowConfiguration(false)}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Interview
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingStates
          type="processing"
          message="Loading interview questions..."
        />
      </div>
    );
  }

  const completedQuestions = getAnsweredQuestionsCount();
  const currentQuestionData = questions[currentQuestionIndex];
  const currentEvaluation = evaluations[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-soft p-6 mb-6 border border-gray-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageSquare className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  AI Interview Session
                </h1>
                <p className="text-gray-600">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <div className="flex items-center space-x-1 bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                <Clock className="h-4 w-4" />
                <span>{formatTime(timeElapsed)}</span>
              </div>
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                {completedQuestions}/{questions.length} completed
              </div>
              {isVoiceMode && (
                <div className="flex items-center space-x-1 bg-green-100 text-green-800 px-3 py-1 rounded-full">
                  <Volume2 className="h-3 w-3" />
                  <span>Voice Mode</span>
                </div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => setShowVoiceSelector(!showVoiceSelector)}
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors font-medium bg-blue-50 px-3 py-1 rounded-full"
                >
                  <Volume2 className="h-4 w-4" />
                  Voice
                </button>
                <button
                  onClick={() => setShowConfiguration(true)}
                  className="flex items-center gap-1 text-purple-600 hover:text-purple-700 transition-colors font-medium bg-purple-50 px-3 py-1 rounded-full"
                >
                  <Sliders className="h-4 w-4" />
                  Configure
                </button>
                <button
                  onClick={handleEndInterview}
                  className="flex items-center gap-1 text-red-600 hover:text-red-700 transition-colors font-medium bg-red-50 px-3 py-1 rounded-full"
                >
                  <X className="h-4 w-4" />
                  End Interview
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Voice Selector */}
        {showVoiceSelector && (
          <div className="mb-6">
            <VoiceSelector
              selectedVoice={voiceSettings.voiceType}
              onVoiceChange={handleVoiceChange}
              onSettingsChange={handleVoiceSettingsChange}
            />
          </div>
        )}

        {/* Question Card */}
        {currentQuestionData && (
          <div className="mb-6">
            <InterviewCard
              question={currentQuestionData.question}
              questionNumber={currentQuestionIndex + 1}
              totalQuestions={questions.length}
              timeElapsed={formatTime(timeElapsed)}
            />
            
            {/* Question Reader */}
            <div className="mt-4">
              <QuestionReader
                question={currentQuestionData.question}
                questionNumber={currentQuestionIndex + 1}
                totalQuestions={questions.length}
                voiceType={voiceSettings.voiceType}
                voiceSettings={voiceSettings}
                autoPlay={isVoiceMode && voiceSettings.autoPlay}
              />
            </div>

            {/* Question Details */}
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium">
                    {currentQuestionData.category}
                  </span>
                  <span className="text-blue-700">
                    Focus: {currentQuestionData.focusArea}
                  </span>
                  <span className="text-blue-600 font-medium">
                    {currentQuestionData.difficulty} difficulty
                  </span>
                </div>
              </div>
              
              {currentQuestionData.tips && (
                <p className="text-blue-700 text-sm">
                  💡 {currentQuestionData.tips}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Voice Controls */}
        <div className="mb-6">
          <VoiceControls
            text={currentQuestionData?.question}
            onTranscriptChange={handleTranscriptChange}
            onVoiceMode={handleVoiceModeChange}
            isVoiceMode={isVoiceMode}
            autoPlay={voiceSettings.autoPlay}
          />
        </div>

        {/* Answer Section */}
        <div className="bg-white rounded-xl shadow-soft p-6 mb-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Your Answer</h2>
            <div className="flex items-center space-x-4">
              {currentAnswer.trim() && (
                <Button
                  size="sm"
                  onClick={evaluateCurrentAnswer}
                  loading={isEvaluating}
                  className="text-sm flex items-center gap-2"
                >
                  <Brain className="h-4 w-4" />
                  Get AI Feedback
                </Button>
              )}
              {currentEvaluation && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={toggleFeedback}
                  className="text-sm"
                >
                  {showFeedback ? 'Hide' : 'Show'} Feedback
                </Button>
              )}
            </div>
          </div>
          
          {/* Text Input */}
          <textarea
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(e.target.value)}
            placeholder={
              isVoiceMode 
                ? "Your voice response will appear here, or you can type as a fallback..."
                : "Type your answer here... Take your time to think through your response."
            }
            rows={8}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none custom-scrollbar"
          />
          
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-600">
              {currentAnswer.length} characters
              {isVoiceMode && (
                <span className="ml-2 text-blue-600">
                  • Voice input active
                </span>
              )}
            </p>
            
            {currentAnswer.length > 0 && (
              <span className="text-xs text-gray-500">
                ~{Math.ceil(currentAnswer.split(' ').length / 150)} min read
              </span>
            )}
          </div>

          {error && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Evaluation Loading */}
        {isEvaluating && (
          <div className="mb-6">
            <LoadingStates
              type="evaluation"
              message="AI is analyzing your response..."
              progress={75}
            />
          </div>
        )}

        {/* Feedback Panel */}
        {currentEvaluation && showFeedback && (
          <div className="mb-6">
            <FeedbackPanel
              evaluation={currentEvaluation}
              question={currentQuestionData.question}
              answer={currentAnswer}
            />
          </div>
        )}

        {/* Navigation */}
        <div className="bg-white rounded-xl shadow-soft p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className="flex items-center"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>

            <div className="flex items-center space-x-2">
              {questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`w-10 h-10 rounded-full text-sm font-medium transition-all duration-200 ${
                    index === currentQuestionIndex
                      ? 'bg-blue-600 text-white shadow-lg'
                      : answers[index]?.trim()
                      ? evaluations[index]
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title={
                    answers[index]?.trim()
                      ? evaluations[index]
                        ? 'Answered with AI feedback'
                        : 'Answered (click for AI feedback)'
                      : 'Not answered'
                  }
                >
                  {index + 1}
                </button>
              ))}
            </div>

            <Button
              onClick={handleNextQuestion}
              className="flex items-center btn-hover-lift"
              loading={isEvaluating}
            >
              {currentQuestionIndex === questions.length - 1 ? 'Finish Interview' : 'Next'}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>

        {/* Enhanced Tips */}
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
            💡 Interview Tips & Voice Features
          </h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">Interview Best Practices:</h4>
              <ul className="space-y-1">
                <li>• Use the STAR method (Situation, Task, Action, Result)</li>
                <li>• Be specific with examples and quantify achievements</li>
                <li>• Take your time to think before answering</li>
                <li>• Click "Get AI Feedback" for comprehensive evaluation</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Voice Features:</h4>
              <ul className="space-y-1">
                <li>• Questions are read aloud automatically in voice mode</li>
                <li>• Use microphone button (🎤) to record answers</li>
                <li>• Choose from 6 different AI interviewer voices</li>
                <li>• Adjust voice settings for personalized experience</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* End Interview Confirmation Modal */}
      {showEndConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">End Interview?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to end this interview? Your progress will be saved and you'll be taken to the results page.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={cancelEndInterview}
              >
                Continue Interview
              </Button>
              <Button
                onClick={confirmEndInterview}
                className="bg-red-600 hover:bg-red-700"
              >
                End Interview
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewPage;