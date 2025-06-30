import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, RotateCcw, AlertCircle, CheckCircle, Pause, Play } from 'lucide-react';
import { textToSpeech, createAudioFromBlob, generateInterviewContext } from '../services/voiceService';
import LoadingStates from './LoadingStates';

interface QuestionReaderProps {
  question: string;
  questionNumber?: number;
  totalQuestions?: number;
  voiceType?: string;
  voiceSettings?: any;
  autoPlay?: boolean;
  className?: string;
}

const QuestionReader: React.FC<QuestionReaderProps> = ({
  question,
  questionNumber = 1,
  totalQuestions = 1,
  voiceType = 'professional_female',
  voiceSettings = {},
  autoPlay = true,
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [error, setError] = useState<string>('');
  const [hasAutoPlayed, setHasAutoPlayed] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);

  const readQuestion = async () => {
    if (!question || question.trim().length === 0) {
      setError('No question text to read');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      console.log('QuestionReader: Starting enhanced TTS for:', question.substring(0, 50) + '...');
      
      // Stop any currently playing audio
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
        setIsPlaying(false);
        setIsPaused(false);
        setAudioProgress(0);
      }

      // Generate contextual text for more natural delivery
      const contextualText = generateInterviewContext(question, questionNumber, totalQuestions);
      
      const audioBlob = await textToSpeech(contextualText, voiceType, voiceSettings);
      const audioElement = createAudioFromBlob(audioBlob, voiceSettings);
      
      // Enhanced audio event handlers
      audioElement.onloadedmetadata = () => {
        setAudioDuration(audioElement.duration);
      };
      
      audioElement.onplay = () => {
        console.log('QuestionReader: Enhanced audio started playing');
        setIsPlaying(true);
        setIsPaused(false);
      };
      
      audioElement.onpause = () => {
        console.log('QuestionReader: Enhanced audio paused');
        setIsPlaying(false);
        setIsPaused(true);
      };
      
      audioElement.onended = () => {
        console.log('QuestionReader: Enhanced audio finished playing');
        setIsPlaying(false);
        setIsPaused(false);
        setAudioProgress(0);
        setAudio(null);
      };
      
      audioElement.ontimeupdate = () => {
        if (audioElement.duration) {
          setAudioProgress((audioElement.currentTime / audioElement.duration) * 100);
        }
      };
      
      audioElement.onerror = (e) => {
        console.error('QuestionReader: Enhanced audio playback error:', e);
        setError('Audio playback failed');
        setIsPlaying(false);
        setIsPaused(false);
        setAudio(null);
      };
      
      setAudio(audioElement);
      
      // Start playback
      try {
        await audioElement.play();
        console.log('QuestionReader: Enhanced audio play() succeeded');
      } catch (playError) {
        console.error('QuestionReader: Enhanced audio play() failed:', playError);
        setError('Failed to start audio playback. Click to try again.');
        setIsPlaying(false);
      }
      
    } catch (err) {
      console.error('QuestionReader: Enhanced TTS generation failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate speech');
    } finally {
      setIsLoading(false);
    }
  };

  const pauseAudio = () => {
    if (audio && isPlaying) {
      audio.pause();
    }
  };

  const resumeAudio = () => {
    if (audio && isPaused) {
      audio.play();
    }
  };

  const stopAudio = () => {
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      setIsPlaying(false);
      setIsPaused(false);
      setAudioProgress(0);
    }
  };

  const replayAudio = () => {
    if (audio) {
      audio.currentTime = 0;
      audio.play();
    } else {
      readQuestion();
    }
  };

  // Auto-play when question changes
  useEffect(() => {
    if (autoPlay && question && !hasAutoPlayed && !isLoading && !isPlaying) {
      console.log('QuestionReader: Auto-playing enhanced question');
      setHasAutoPlayed(true);
      // Small delay to ensure component is ready
      setTimeout(() => {
        readQuestion();
      }, 800);
    }
  }, [question, autoPlay, hasAutoPlayed, isLoading, isPlaying, voiceType]);

  // Reset auto-play flag when question changes
  useEffect(() => {
    setHasAutoPlayed(false);
    setError('');
    setAudioProgress(0);
    if (audio) {
      audio.pause();
      setIsPlaying(false);
      setIsPaused(false);
      setAudio(null);
    }
  }, [question, voiceType]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Volume2 className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold text-blue-900">AI Interviewer</h4>
            <p className="text-sm text-blue-700">Question {questionNumber} of {totalQuestions}</p>
          </div>
        </div>
        
        {/* Voice Type Indicator */}
        <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
          {voiceType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </div>
      </div>

      {/* Audio Controls */}
      <div className="flex items-center gap-3 mb-4">
        {isLoading ? (
          <div className="flex items-center gap-3">
            <LoadingStates type="voice" message="" className="!min-h-0 !space-y-0" />
            <span className="text-sm text-blue-700 font-medium">Generating speech...</span>
          </div>
        ) : (
          <>
            {/* Main Play/Pause Button */}
            <button
              onClick={isPlaying ? pauseAudio : isPaused ? resumeAudio : readQuestion}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all btn-hover-lift"
              title={isPlaying ? 'Pause question' : isPaused ? 'Resume question' : 'Read question aloud'}
            >
              {isPlaying ? (
                <>
                  <Pause className="h-4 w-4" />
                  <span className="text-sm font-medium">Pause</span>
                </>
              ) : isPaused ? (
                <>
                  <Play className="h-4 w-4" />
                  <span className="text-sm font-medium">Resume</span>
                </>
              ) : (
                <>
                  <Volume2 className="h-4 w-4" />
                  <span className="text-sm font-medium">Read Question</span>
                </>
              )}
            </button>

            {/* Stop Button */}
            {(isPlaying || isPaused) && (
              <button
                onClick={stopAudio}
                className="p-2 text-red-600 hover:text-red-800 rounded-lg hover:bg-red-50 transition-colors"
                title="Stop reading"
              >
                <VolumeX className="h-4 w-4" />
              </button>
            )}

            {/* Replay Button */}
            {audio && !isPlaying && !isPaused && (
              <button
                onClick={replayAudio}
                className="p-2 text-blue-600 hover:text-blue-800 rounded-lg hover:bg-blue-50 transition-colors"
                title="Replay question"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            )}
          </>
        )}
      </div>

      {/* Audio Progress Bar */}
      {(isPlaying || isPaused) && audioDuration > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-blue-700 mb-1">
            <span>Audio Progress</span>
            <span>{formatTime((audioProgress / 100) * audioDuration)} / {formatTime(audioDuration)}</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div 
              className="h-2 rounded-full bg-blue-500 transition-all duration-100"
              style={{ width: `${audioProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Status Indicators */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {isPlaying && (
            <div className="flex items-center gap-2 text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-medium">Playing...</span>
            </div>
          )}

          {isPaused && (
            <div className="flex items-center gap-2 text-yellow-600">
              <div className="w-2 h-2 bg-yellow-500 rounded-full" />
              <span className="text-xs font-medium">Paused</span>
            </div>
          )}

          {!error && !isLoading && !isPlaying && !isPaused && hasAutoPlayed && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="text-xs font-medium">Ready</span>
            </div>
          )}
        </div>

        {/* Auto-play Indicator */}
        {autoPlay && (
          <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
            Auto-play enabled
          </span>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-4 flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm">{error}</span>
          <button
            onClick={readQuestion}
            className="ml-auto text-xs text-red-700 hover:text-red-900 font-medium"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Instructions */}
      {!hasAutoPlayed && autoPlay && !isLoading && (
        <div className="mt-4 bg-blue-100 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            🎧 The question will be read aloud automatically. You can also use the controls above to replay or pause.
          </p>
        </div>
      )}
    </div>
  );
};

export default QuestionReader;