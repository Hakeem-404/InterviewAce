import React, { useState } from 'react';
import { Play, Pause, Square, Mic, MicOff } from 'lucide-react';

interface AudioControlsProps {
  onPlay?: () => void;
  onPause?: () => void;
  onStop?: () => void;
  onStartRecording?: () => void;
  onStopRecording?: () => void;
  isPlaying?: boolean;
  isRecording?: boolean;
  className?: string;
}

const AudioControls: React.FC<AudioControlsProps> = ({
  onPlay,
  onPause,
  onStop,
  onStartRecording,
  onStopRecording,
  isPlaying = false,
  isRecording = false,
  className = ''
}) => {
  const [recordingTime, setRecordingTime] = useState(0);

  const handlePlayPause = () => {
    if (isPlaying) {
      onPause?.();
    } else {
      onPlay?.();
    }
  };

  const handleRecording = () => {
    if (isRecording) {
      onStopRecording?.();
    } else {
      onStartRecording?.();
    }
  };

  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      {/* Play/Pause Button */}
      <button
        onClick={handlePlayPause}
        className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        {isPlaying ? (
          <Pause className="h-5 w-5" />
        ) : (
          <Play className="h-5 w-5 ml-0.5" />
        )}
      </button>

      {/* Stop Button */}
      <button
        onClick={onStop}
        className="flex items-center justify-center w-10 h-10 bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
      >
        <Square className="h-4 w-4" />
      </button>

      {/* Recording Button */}
      <button
        onClick={handleRecording}
        className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
          isRecording
            ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 animate-pulse'
            : 'bg-gray-200 text-gray-600 hover:bg-gray-300 focus:ring-gray-500'
        }`}
      >
        {isRecording ? (
          <MicOff className="h-5 w-5" />
        ) : (
          <Mic className="h-5 w-5" />
        )}
      </button>

      {/* Recording indicator */}
      {isRecording && (
        <div className="flex items-center space-x-2 text-red-600">
          <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
          <span className="text-sm font-medium">Recording...</span>
        </div>
      )}
    </div>
  );
};

export default AudioControls;