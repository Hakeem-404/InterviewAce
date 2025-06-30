import React, { useState } from 'react';
import { ExternalLink, Copy, CheckCircle, AlertCircle, Volume2, Settings } from 'lucide-react';
import Button from './Button';

interface VoiceSetupGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const VoiceSetupGuide: React.FC<VoiceSetupGuideProps> = ({ isOpen, onClose }) => {
  const [copiedStep, setCopiedStep] = useState<number | null>(null);

  const copyToClipboard = (text: string, stepNumber: number) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(stepNumber);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Volume2 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Enable Professional Voice</h2>
                <p className="text-gray-600">Set up Eleven Labs for AI interviewer voices</p>
              </div>
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

          {/* Benefits */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-3">Why Enable Professional Voice?</h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>6 professional AI interviewer voices</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Natural, human-like speech quality</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Customizable voice settings</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>10,000 characters free per month</span>
              </li>
            </ul>
          </div>

          {/* Setup Steps */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Setup Instructions</h3>

            {/* Step 1 */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-2">Create Eleven Labs Account</h4>
                  <p className="text-gray-600 text-sm mb-3">
                    Sign up for a free Eleven Labs account to get your API key.
                  </p>
                  <a
                    href="https://elevenlabs.io/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Go to Eleven Labs
                  </a>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-2">Get Your API Key</h4>
                  <p className="text-gray-600 text-sm mb-3">
                    After signing up, go to your Profile Settings and copy your API key.
                  </p>
                  <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
                    <strong>Navigation:</strong> Profile Settings → API Key → Copy
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-2">Add API Key to Environment</h4>
                  <p className="text-gray-600 text-sm mb-3">
                    Create a <code className="bg-gray-100 px-1 rounded">.env</code> file in your project root and add:
                  </p>
                  <div className="bg-gray-900 text-green-400 rounded-lg p-3 font-mono text-sm relative">
                    <div>VITE_ELEVEN_LABS_API_KEY=your_api_key_here</div>
                    <button
                      onClick={() => copyToClipboard('VITE_ELEVEN_LABS_API_KEY=your_api_key_here', 3)}
                      className="absolute top-2 right-2 p-1 text-gray-400 hover:text-white transition-colors"
                    >
                      {copiedStep === 3 ? (
                        <CheckCircle className="h-4 w-4 text-green-400" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  4
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-2">Restart the Application</h4>
                  <p className="text-gray-600 text-sm mb-3">
                    Refresh the page or restart your development server to load the new environment variable.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-blue-800 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      <span>The page will automatically detect your API key once configured.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Current Status */}
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-yellow-800 mb-2">
              <Settings className="h-5 w-5" />
              <span className="font-medium">Current Status</span>
            </div>
            <p className="text-yellow-700 text-sm">
              Using Web Speech API fallback. Configure Eleven Labs API key for professional voices.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={onClose}>
              I'll Set This Up Later
            </Button>
            <a
              href="https://elevenlabs.io/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                Get Started Now
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceSetupGuide;