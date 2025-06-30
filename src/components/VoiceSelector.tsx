import React, { useState, useEffect } from 'react';
import { Volume2, Settings, User, Briefcase, Heart, Zap, Users, MessageCircle, ExternalLink, AlertCircle } from 'lucide-react';
import { testVoice, VOICE_OPTIONS, VOICE_PRESETS, isVoiceAvailable } from '../services/voiceService';
import Button from './Button';
import LoadingStates from './LoadingStates';
import VoiceSetupGuide from './VoiceSetupGuide';

interface VoiceSelectorProps {
  selectedVoice: string;
  onVoiceChange: (voiceType: string) => void;
  onSettingsChange: (settings: any) => void;
  className?: string;
}

const VoiceSelector: React.FC<VoiceSelectorProps> = ({ 
  selectedVoice, 
  onVoiceChange, 
  onSettingsChange,
  className = ''
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  const [isTestingVoice, setIsTestingVoice] = useState<string | null>(null);
  const [hasElevenLabsKey, setHasElevenLabsKey] = useState(false);
  const [customSettings, setCustomSettings] = useState({
    stability: 0.75,
    similarity_boost: 0.85,
    style: 0.2,
    speaking_rate: 1.0
  });

  useEffect(() => {
    // Check if Eleven Labs API key is configured
    const apiKey = import.meta.env.VITE_ELEVEN_LABS_API_KEY;
    setHasElevenLabsKey(!!apiKey);
  }, []);

  const voiceProfiles = {
    professional_female: {
      name: "Rachel",
      description: "Professional, clear, and confident",
      icon: <Briefcase className="h-5 w-5" />,
      personality: "Ideal for corporate interviews",
      color: "blue",
      sample: "Hello, I'm Rachel. I'll be conducting your interview today with a professional and confident approach."
    },
    professional_male: {
      name: "Drew", 
      description: "Authoritative and experienced",
      icon: <User className="h-5 w-5" />,
      personality: "Perfect for senior-level positions",
      color: "indigo",
      sample: "Good day, I'm Drew. Let's explore your professional experience and qualifications together."
    },
    friendly_male: {
      name: "Callum",
      description: "Warm and approachable",
      icon: <Heart className="h-5 w-5" />,
      personality: "Great for startup culture fits",
      color: "green",
      sample: "Hi there! I'm Callum, and I'm excited to learn more about you in a relaxed, friendly conversation."
    },
    authoritative_male: {
      name: "Arnold",
      description: "Direct and challenging",
      icon: <Zap className="h-5 w-5" />,
      personality: "Simulates tough interviewers",
      color: "red",
      sample: "I'm Arnold. I'll be asking you some challenging questions to assess your capabilities thoroughly."
    },
    warm_female: {
      name: "Bella",
      description: "Engaging and supportive",
      icon: <Users className="h-5 w-5" />,
      personality: "Encouraging interview style",
      color: "pink",
      sample: "Hello, I'm Bella! I'm here to help you showcase your best qualities in a supportive environment."
    },
    conversational_female: {
      name: "Sarah",
      description: "Natural and conversational",
      icon: <MessageCircle className="h-5 w-5" />,
      personality: "Casual interview approach",
      color: "purple",
      sample: "Hey, I'm Sarah! Let's have a natural conversation about your background and aspirations."
    }
  };

  const handleVoiceTest = async (voiceType: string) => {
    setIsTestingVoice(voiceType);
    try {
      const audio = await testVoice(voiceType, customSettings);
      await audio.play();
    } catch (error) {
      console.error('Voice test failed:', error);
    } finally {
      setIsTestingVoice(null);
    }
  };

  const handleSettingChange = (key: string, value: number) => {
    const newSettings = { ...customSettings, [key]: value };
    setCustomSettings(newSettings);
    onSettingsChange(newSettings);
  };

  const applyPreset = (presetName: string) => {
    const preset = VOICE_PRESETS[presetName];
    if (preset) {
      setCustomSettings(preset);
      onSettingsChange(preset);
    }
  };

  const getColorClasses = (color: string, isSelected: boolean) => {
    const colors = {
      blue: isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300',
      indigo: isSelected ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300',
      green: isSelected ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300',
      red: isSelected ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-red-300',
      pink: isSelected ? 'border-pink-500 bg-pink-50' : 'border-gray-200 hover:border-pink-300',
      purple: isSelected ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className={`bg-white rounded-xl shadow-soft p-6 border border-gray-100 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Volume2 className="h-6 w-6 text-blue-600" />
          </div>
          AI Interviewer Voice
        </h3>
        <div className="flex items-center gap-2">
          {!hasElevenLabsKey && (
            <Button
              size="sm"
              onClick={() => setShowSetupGuide(true)}
              className="flex items-center gap-2 text-xs"
            >
              <ExternalLink className="h-3 w-3" />
              Enable Pro Voices
            </Button>
          )}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* API Key Status */}
      {!hasElevenLabsKey && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-yellow-800 mb-2">
            <AlertCircle className="h-4 w-4" />
            <span className="font-medium">Using Web Speech API</span>
          </div>
          <p className="text-yellow-700 text-sm mb-3">
            Configure Eleven Labs API key to unlock 6 professional AI interviewer voices with natural speech quality.
          </p>
          <Button
            size="sm"
            onClick={() => setShowSetupGuide(true)}
            className="flex items-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Set Up Professional Voices
          </Button>
        </div>
      )}

      {/* Voice Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {Object.entries(voiceProfiles).map(([key, profile]) => {
          const isSelected = selectedVoice === key;
          const isTesting = isTestingVoice === key;
          const isDisabled = !hasElevenLabsKey && !isVoiceAvailable();
          
          return (
            <div
              key={key}
              onClick={() => !isDisabled && onVoiceChange(key)}
              className={`
                p-4 border-2 rounded-xl transition-all duration-200 card-hover
                ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                ${getColorClasses(profile.color, isSelected)}
              `}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`
                  p-2 rounded-lg
                  ${isSelected 
                    ? `bg-${profile.color}-100 text-${profile.color}-600` 
                    : 'bg-gray-100 text-gray-600'
                  }
                `}>
                  {profile.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{profile.name}</h4>
                  <p className="text-sm text-gray-600">{profile.description}</p>
                </div>
                {!hasElevenLabsKey && (
                  <div className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">
                    Pro
                  </div>
                )}
              </div>
              
              <p className="text-xs text-gray-500 mb-3 italic">
                "{profile.personality}"
              </p>
              
              <div className="flex items-center justify-between">
                <span className={`
                  text-xs px-2 py-1 rounded-full font-medium
                  ${isSelected 
                    ? `bg-${profile.color}-100 text-${profile.color}-700` 
                    : 'bg-gray-100 text-gray-600'
                  }
                `}>
                  {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleVoiceTest(key);
                  }}
                  disabled={isTesting || isDisabled}
                  className="text-xs"
                >
                  {isTesting ? (
                    <LoadingStates type="voice" message="" className="!min-h-0 !space-y-0" />
                  ) : (
                    'Test Voice'
                  )}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Presets */}
      {hasElevenLabsKey && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Quick Presets</h4>
          <div className="flex flex-wrap gap-2">
            {Object.keys(VOICE_PRESETS).map((presetName) => (
              <button
                key={presetName}
                onClick={() => applyPreset(presetName)}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors capitalize"
              >
                {presetName}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Advanced Settings */}
      {showSettings && hasElevenLabsKey && (
        <div className="border-t pt-6 space-y-6">
          <h4 className="font-semibold text-gray-900">Advanced Voice Settings</h4>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stability: {customSettings.stability.toFixed(2)}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={customSettings.stability}
                  onChange={(e) => handleSettingChange('stability', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <p className="text-xs text-gray-500 mt-1">Higher values = more consistent tone</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Similarity: {customSettings.similarity_boost.toFixed(2)}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={customSettings.similarity_boost}
                  onChange={(e) => handleSettingChange('similarity_boost', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <p className="text-xs text-gray-500 mt-1">Higher values = more natural sound</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Style Variation: {customSettings.style.toFixed(2)}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={customSettings.style}
                  onChange={(e) => handleSettingChange('style', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <p className="text-xs text-gray-500 mt-1">Higher values = more expressive</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Speaking Rate: {customSettings.speaking_rate.toFixed(1)}x
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="1.5"
                  step="0.05"
                  value={customSettings.speaking_rate}
                  onChange={(e) => handleSettingChange('speaking_rate', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <p className="text-xs text-gray-500 mt-1">Adjust speaking speed</p>
              </div>
            </div>
          </div>

          {/* Settings Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h5 className="font-medium text-blue-900 mb-2">Voice Settings Guide</h5>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Stability:</strong> Controls voice consistency across different texts</li>
              <li>• <strong>Similarity:</strong> How closely the AI matches the original voice</li>
              <li>• <strong>Style:</strong> Amount of emotional expression and variation</li>
              <li>• <strong>Speaking Rate:</strong> Speed of speech delivery</li>
            </ul>
          </div>
        </div>
      )}

      {/* Current Selection Summary */}
      <div className="mt-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            {voiceProfiles[selectedVoice]?.icon}
          </div>
          <div>
            <h5 className="font-medium text-gray-900">
              Selected: {voiceProfiles[selectedVoice]?.name}
            </h5>
            <p className="text-sm text-gray-600">
              {voiceProfiles[selectedVoice]?.description}
            </p>
            {!hasElevenLabsKey && (
              <p className="text-xs text-orange-600 mt-1">
                Using Web Speech API fallback
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Setup Guide Modal */}
      <VoiceSetupGuide
        isOpen={showSetupGuide}
        onClose={() => setShowSetupGuide(false)}
      />
    </div>
  );
};

export default VoiceSelector;