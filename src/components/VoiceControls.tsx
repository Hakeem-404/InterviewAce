import React, { useState, useEffect, useCallback } from 'react';
import { Volume2, VolumeX, Mic, MicOff, Settings } from 'lucide-react';
import { isVoiceAvailable } from '../services/voiceService';
import useSpeechRecognition from '../hooks/useSpeechRecognition';
import AudioVisualizer from './AudioVisualizer';

interface VoiceControlsProps {
  text?: string;
  onTranscriptChange?: (transcript: string) => void;
  onVoiceMode?: (enabled: boolean) => void;
  isVoiceMode?: boolean;
  autoPlay?: boolean;
  className?: string;
}

const VoiceControls: React.FC<VoiceControlsProps> = ({
  text = '',
  onTranscriptChange,
  onVoiceMode,
  isVoiceMode = false,
  autoPlay = false,
  className = ''
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [hasNotifiedTranscript, setHasNotifiedTranscript] = useState(false);

  const {
    isListening,
    transcript,
    interimTranscript,
    isSupported: speechSupported,
    error: speechError,
    confidence,
    startListening,
    stopListening,
    clearTranscript
  } = useSpeechRecognition();

  // Use useCallback to prevent function recreation on every render
  const handleTranscriptChange = useCallback((newTranscript: string) => {
    if (onTranscriptChange && newTranscript) {
      onTranscriptChange(newTranscript);
    }
  }, [onTranscriptChange]);

  // Update transcript when speech recognition changes - with proper dependency management
  useEffect(() => {
    if (transcript && !hasNotifiedTranscript) {
      handleTranscriptChange(transcript);
      setHasNotifiedTranscript(true);
    }
  }, [transcript, handleTranscriptChange, hasNotifiedTranscript]);

  // Reset notification flag when transcript is cleared
  useEffect(() => {
    if (!transcript) {
      setHasNotifiedTranscript(false);
    }
  }, [transcript]);

  const handleStartRecording = () => {
    clearTranscript();
    setHasNotifiedTranscript(false);
    startListening();
  };

  const handleStopRecording = () => {
    stopListening();
  };

  const toggleVoiceMode = () => {
    const newVoiceMode = !isVoiceMode;
    if (onVoiceMode) {
      onVoiceMode(newVoiceMode);
    }
  };

  if (!isVoiceAvailable() && !speechSupported) {
    return (
      <div className={`text-center p-4 bg-gray-50 rounded-lg ${className}`}>
        <p className="text-sm text-gray-600">
          Voice features not available in this browser
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      {/* Voice Mode Toggle */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-900">Voice Controls</h3>
        <div className="flex items-center space-x-2">
          <label className="flex items-center space-x-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={isVoiceMode}
              onChange={toggleVoiceMode}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Voice Mode</span>
          </label>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Speech Recognition Controls */}
      {speechSupported && (
        <div className="mb-4">
          <div className="flex items-center space-x-3 mb-3">
            <button
              onClick={isListening ? handleStopRecording : handleStartRecording}
              className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 ${
                isListening
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-green-100 text-green-600 hover:bg-green-200'
              }`}
              title={isListening ? 'Stop recording (manual control)' : 'Start recording your answer'}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>

            {isListening && (
              <AudioVisualizer isRecording={isListening} />
            )}

            {confidence > 0 && (
              <div className="text-xs text-gray-500">
                Confidence: {Math.round(confidence * 100)}%
              </div>
            )}

            {isListening && (
              <div className="text-xs text-green-600 font-medium">
                Recording... Click stop when finished
              </div>
            )}
          </div>

          {/* Transcript Display */}
          {(transcript || interimTranscript) && (
            <div className="bg-gray-50 border border-gray-200 rounded p-3 text-sm">
              <div className="text-gray-900">{transcript}</div>
              {interimTranscript && (
                <div className="text-gray-500 italic">{interimTranscript}</div>
              )}
            </div>
          )}

          {speechError && (
            <p className="text-xs text-red-600 mt-2">{speechError}</p>
          )}
        </div>
      )}

      {/* Status Indicators */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-2">
          {isVoiceAvailable() && (
            <span className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>TTS Ready</span>
            </span>
          )}
          {speechSupported && (
            <span className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>STT Ready</span>
            </span>
          )}
        </div>
        {isVoiceMode && (
          <span className="text-blue-600 font-medium">Voice Mode Active</span>
        )}
      </div>

      {/* Instructions */}
      {isVoiceMode && (
        <div className="mt-3 bg-green-50 border border-green-200 rounded p-3">
          <h4 className="text-xs font-medium text-green-900 mb-1">Voice Mode Instructions:</h4>
          <ul className="text-xs text-green-800 space-y-1">
            <li>• Questions will be read aloud automatically</li>
            <li>• Click 🎤 to start recording your answer</li>
            <li>• Click 🛑 to stop recording when you're finished</li>
            <li>• Your spoken answer will appear in the text area</li>
            <li>• Use the "Read Question" button to replay questions</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default VoiceControls;