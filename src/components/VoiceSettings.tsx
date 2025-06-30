import React, { useState, useEffect } from 'react';
import { Settings, Volume2, Mic, Clock, Zap } from 'lucide-react';
import { getAvailableVoices, VOICE_PRESETS } from '../services/voiceService';

interface VoiceSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  settings: VoiceSettings;
  onSettingsChange: (settings: VoiceSettings) => void;
}

export interface VoiceSettings {
  voiceId: string;
  voicePreset: string;
  volume: number;
  speed: number;
  autoPlay: boolean;
  autoProgress: boolean;
  pauseDuration: number;
  microphoneSensitivity: number;
  silenceTimeout: number;
  enableFallback: boolean;
}

const VoiceSettingsPanel: React.FC<VoiceSettingsProps> = ({
  isOpen,
  onClose,
  settings,
  onSettingsChange
}) => {
  const [availableVoices, setAvailableVoices] = useState<any[]>([]);
  const [isLoadingVoices, setIsLoadingVoices] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadVoices();
    }
  }, [isOpen]);

  const loadVoices = async () => {
    setIsLoadingVoices(true);
    try {
      const voices = await getAvailableVoices();
      setAvailableVoices(voices);
    } catch (error) {
      console.error('Failed to load voices:', error);
    } finally {
      setIsLoadingVoices(false);
    }
  };

  const updateSetting = (key: keyof VoiceSettings, value: any) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Settings className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Voice Settings</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Voice Selection */}
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-3">
              <Volume2 className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-medium text-gray-900">Voice & Audio</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Voice Style
                </label>
                <select
                  value={settings.voicePreset}
                  onChange={(e) => updateSetting('voicePreset', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="professional">Professional</option>
                  <option value="friendly">Friendly</option>
                  <option value="authoritative">Authoritative</option>
                  <option value="conversational">Conversational</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specific Voice
                </label>
                <select
                  value={settings.voiceId}
                  onChange={(e) => updateSetting('voiceId', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isLoadingVoices}
                >
                  <option value="">Default Voice</option>
                  {availableVoices.map((voice) => (
                    <option key={voice.voice_id} value={voice.voice_id}>
                      {voice.name} ({voice.labels?.gender || 'Unknown'})
                    </option>
                  ))}
                </select>
                {isLoadingVoices && (
                  <p className="text-xs text-gray-500 mt-1">Loading voices...</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Volume: {Math.round(settings.volume * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.volume}
                  onChange={(e) => updateSetting('volume', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Speed: {settings.speed}x
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={settings.speed}
                  onChange={(e) => updateSetting('speed', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Speech Recognition */}
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-3">
              <Mic className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-medium text-gray-900">Speech Recognition</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Microphone Sensitivity: {Math.round(settings.microphoneSensitivity * 100)}%
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={settings.microphoneSensitivity}
                  onChange={(e) => updateSetting('microphoneSensitivity', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Silence Timeout: {settings.silenceTimeout}s
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={settings.silenceTimeout}
                  onChange={(e) => updateSetting('silenceTimeout', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Interview Flow */}
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-3">
              <Clock className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-medium text-gray-900">Interview Flow</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Auto-play Questions</label>
                  <p className="text-xs text-gray-500">Automatically read questions aloud</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoPlay}
                  onChange={(e) => updateSetting('autoPlay', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Auto-progress</label>
                  <p className="text-xs text-gray-500">Move to next question after response</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoProgress}
                  onChange={(e) => updateSetting('autoProgress', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Text Fallback</label>
                  <p className="text-xs text-gray-500">Show text input if voice fails</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.enableFallback}
                  onChange={(e) => updateSetting('enableFallback', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>

              {settings.autoProgress && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pause Duration: {settings.pauseDuration}s
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={settings.pauseDuration}
                    onChange={(e) => updateSetting('pauseDuration', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Time to wait before moving to next question
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Performance */}
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-3">
              <Zap className="h-5 w-5 text-yellow-600" />
              <h3 className="text-lg font-medium text-gray-900">Performance Tips</h3>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Use a quiet environment for better speech recognition</li>
                <li>• Speak clearly and at a moderate pace</li>
                <li>• Ensure stable internet connection for voice generation</li>
                <li>• Use headphones to prevent audio feedback</li>
                <li>• Grant microphone permissions when prompted</li>
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceSettingsPanel;