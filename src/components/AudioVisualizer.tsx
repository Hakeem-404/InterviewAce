import React, { useEffect, useRef, useState } from 'react';

interface AudioVisualizerProps {
  isRecording: boolean;
  className?: string;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isRecording,
  className = ''
}) => {
  const [audioLevel, setAudioLevel] = useState(0);
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRecording) {
      startVisualization();
    } else {
      stopVisualization();
    }

    return () => {
      stopVisualization();
    };
  }, [isRecording]);

  const startVisualization = async () => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      streamRef.current = stream;
      setIsPermissionGranted(true);

      // Create audio context and analyser
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);

      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      microphone.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      microphoneRef.current = microphone;

      // Start analyzing audio levels
      analyzeAudio();
    } catch (error) {
      console.error('Failed to access microphone:', error);
      setIsPermissionGranted(false);
    }
  };

  const analyzeAudio = () => {
    if (!analyserRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const analyze = () => {
      if (!analyserRef.current || !isRecording) return;

      analyserRef.current.getByteFrequencyData(dataArray);
      
      // Calculate average audio level
      const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
      const normalizedLevel = average / 255;
      
      setAudioLevel(normalizedLevel);
      
      animationFrameRef.current = requestAnimationFrame(analyze);
    };

    analyze();
  };

  const stopVisualization = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    analyserRef.current = null;
    microphoneRef.current = null;
    setAudioLevel(0);
  };

  const generateBars = () => {
    const barCount = 20;
    const bars = [];

    for (let i = 0; i < barCount; i++) {
      // Create a wave effect based on audio level and position
      const baseHeight = 4;
      const waveOffset = Math.sin((i / barCount) * Math.PI * 2 + Date.now() * 0.01) * 0.3;
      const audioInfluence = audioLevel * 40;
      const height = baseHeight + audioInfluence + (waveOffset * audioInfluence);
      
      bars.push(
        <div
          key={i}
          className={`bg-gradient-to-t from-blue-500 to-blue-300 rounded-full transition-all duration-100 ${
            isRecording ? 'opacity-100' : 'opacity-30'
          }`}
          style={{
            width: '3px',
            height: `${Math.max(4, height)}px`,
            animationDelay: `${i * 50}ms`
          }}
        />
      );
    }

    return bars;
  };

  if (!isPermissionGranted && isRecording) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-orange-600">Requesting microphone access...</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Audio Level Bars */}
      <div className="flex items-end space-x-1 h-8">
        {generateBars()}
      </div>

      {/* Audio Level Indicator */}
      <div className="flex flex-col items-center">
        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-100 rounded-full ${
              audioLevel > 0.7 
                ? 'bg-red-500' 
                : audioLevel > 0.4 
                ? 'bg-yellow-500' 
                : 'bg-green-500'
            }`}
            style={{ width: `${audioLevel * 100}%` }}
          />
        </div>
        <span className="text-xs text-gray-500 mt-1">
          {Math.round(audioLevel * 100)}%
        </span>
      </div>

      {/* Recording Indicator */}
      {isRecording && (
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-xs text-red-600 font-medium">Recording</span>
        </div>
      )}
    </div>
  );
};

export default AudioVisualizer;