import React, { createContext, useContext, useState, useCallback } from 'react';

const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  // Document data
  const [cvText, setCvText] = useState('');
  const [cvMetadata, setCvMetadata] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  
  // Analysis results
  const [analysis, setAnalysis] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [preparationTips, setPreparationTips] = useState([]);
  
  // Interview session
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [evaluations, setEvaluations] = useState({});
  const [interviewStartTime, setInterviewStartTime] = useState(null);
  
  // Voice settings
  const [voiceSettings, setVoiceSettings] = useState({
    enabled: false,
    autoPlay: true,
    voicePreset: 'professional',
    volume: 0.8,
    speed: 1.0
  });
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [processingStep, setProcessingStep] = useState('');

  // Helper functions with useCallback to prevent infinite loops
  const resetSession = useCallback(() => {
    setCvText('');
    setCvMetadata(null);
    setJobDescription('');
    setAnalysis(null);
    setQuestions([]);
    setPreparationTips([]);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setEvaluations({});
    setInterviewStartTime(null);
    setIsLoading(false);
    setError(null);
    setProcessingStep('');
    setVoiceSettings({
      enabled: false,
      autoPlay: true,
      voicePreset: 'professional',
      volume: 0.8,
      speed: 1.0
    });
  }, []);

  const updateAnswer = useCallback((questionIndex, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  }, []);

  const updateEvaluation = useCallback((questionIndex, evaluation) => {
    setEvaluations(prev => ({
      ...prev,
      [questionIndex]: evaluation
    }));
  }, []);

  const getAnsweredQuestionsCount = useCallback(() => {
    return Object.values(answers).filter(answer => answer && answer.trim().length > 0).length;
  }, [answers]);

  const getEvaluatedQuestionsCount = useCallback(() => {
    return Object.keys(evaluations).length;
  }, [evaluations]);

  const updateVoiceSettings = useCallback((newSettings) => {
    setVoiceSettings(prev => ({
      ...prev,
      ...newSettings
    }));
  }, []);

  const value = {
    // Document data
    cvText,
    setCvText,
    cvMetadata,
    setCvMetadata,
    jobDescription,
    setJobDescription,
    
    // Analysis results
    analysis,
    setAnalysis,
    questions,
    setQuestions,
    preparationTips,
    setPreparationTips,
    
    // Interview session
    currentQuestionIndex,
    setCurrentQuestionIndex,
    answers,
    setAnswers,
    evaluations,
    setEvaluations,
    interviewStartTime,
    setInterviewStartTime,
    
    // Voice settings
    voiceSettings,
    setVoiceSettings,
    updateVoiceSettings,
    
    // UI state
    isLoading,
    setIsLoading,
    error,
    setError,
    processingStep,
    setProcessingStep,
    
    // Helper functions
    resetSession,
    updateAnswer,
    updateEvaluation,
    getAnsweredQuestionsCount,
    getEvaluatedQuestionsCount
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};