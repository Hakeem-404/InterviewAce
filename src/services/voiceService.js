const ELEVEN_LABS_API_KEY = import.meta.env.VITE_ELEVEN_LABS_API_KEY;

// Professional voice IDs from Eleven Labs
const VOICE_OPTIONS = {
  professional_female: "21m00Tcm4TlvDq8ikWAM", // Rachel - Professional female
  professional_male: "29vD33N1CtxCmqQRPOHJ", // Drew - Professional male
  friendly_male: "N2lVS1w4EtoT3dr4eOWO", // Callum - Friendly male
  authoritative_male: "VR6AewLTigWG4xSOukaG", // Arnold - Authoritative
  warm_female: "pNInz6obpgDQGcFmaJgB", // Adam - Warm and engaging
  conversational_female: "EXAVITQu4vr4xnSDxMaL", // Bella - Conversational
};

// Enhanced voice presets for different interview contexts
export const VOICE_PRESETS = {
  professional: {
    stability: 0.75,
    similarity_boost: 0.85,
    style: 0.2,
    use_speaker_boost: true,
    speaking_rate: 1.0
  },
  friendly: {
    stability: 0.65,
    similarity_boost: 0.80,
    style: 0.4,
    use_speaker_boost: true,
    speaking_rate: 0.95
  },
  authoritative: {
    stability: 0.85,
    similarity_boost: 0.90,
    style: 0.1,
    use_speaker_boost: true,
    speaking_rate: 0.9
  },
  conversational: {
    stability: 0.60,
    similarity_boost: 0.75,
    style: 0.5,
    use_speaker_boost: true,
    speaking_rate: 1.05
  }
};

// Enhanced debug logging with API key status
console.log('🎙️ Enhanced Voice Service Initialization:', {
  hasApiKey: !!ELEVEN_LABS_API_KEY,
  apiKeyPrefix: ELEVEN_LABS_API_KEY ? ELEVEN_LABS_API_KEY.substring(0, 8) + '...' : 'Not found',
  availableVoices: Object.keys(VOICE_OPTIONS).length,
  environment: import.meta.env.MODE
});

// Show setup instructions if API key is missing
if (!ELEVEN_LABS_API_KEY) {
  console.warn(`
🚨 ELEVEN LABS API KEY NOT CONFIGURED 🚨

To enable professional voice features:

1. Go to https://elevenlabs.io/
2. Sign up for a free account (10,000 characters/month free)
3. Go to Profile Settings → API Key
4. Copy your API key
5. Create a .env file in your project root with:
   VITE_ELEVEN_LABS_API_KEY=your_api_key_here

Current status: Using Web Speech API fallback
  `);
}

/**
 * Test the Eleven Labs API connection with detailed diagnostics
 * @returns {Promise<boolean>} True if API is working
 */
export const testElevenLabsConnection = async () => {
  if (!ELEVEN_LABS_API_KEY) {
    console.warn('❌ Eleven Labs API key not configured');
    return false;
  }

  try {
    console.log('🔍 Testing Eleven Labs API connection...');
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': ELEVEN_LABS_API_KEY
      }
    });
    
    console.log('📡 API Test Response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ API connection successful!', {
        availableVoices: data.voices?.length || 0
      });
      return true;
    } else {
      const errorText = await response.text();
      console.error('❌ API connection failed:', {
        status: response.status,
        error: errorText
      });
      return false;
    }
  } catch (error) {
    console.error('❌ API connection test failed:', error);
    return false;
  }
};

/**
 * Preprocess text for better speech quality
 * @param {string} text - Text to preprocess
 * @returns {string} - Enhanced text for speech
 */
export const preprocessTextForSpeech = (text) => {
  return text
    // Add natural pauses for better pacing
    .replace(/\./g, '. <break time="0.5s"/>')
    .replace(/\?/g, '? <break time="0.7s"/>')
    .replace(/:/g, ': <break time="0.3s"/>')
    .replace(/;/g, '; <break time="0.4s"/>')
    // Emphasize important words
    .replace(/\b(important|key|critical|essential|crucial)\b/gi, '<emphasis level="strong">$1</emphasis>')
    // Slow down for technical terms and acronyms
    .replace(/\b([A-Z]{2,}|API|SQL|CSS|HTML|JSON|REST|HTTP|URL|UI|UX)\b/g, '<prosody rate="0.85">$1</prosody>')
    // Add emphasis for questions
    .replace(/\b(tell me|describe|explain|how would you|what is your)\b/gi, '<emphasis level="moderate">$1</emphasis>')
    // Clean up multiple spaces
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Generate interview context for more natural delivery
 * @param {string} question - The interview question
 * @param {number} questionNumber - Current question number
 * @param {number} totalQuestions - Total number of questions
 * @returns {string} - Contextualized question
 */
export const generateInterviewContext = (question, questionNumber = 1, totalQuestions = 1) => {
  const openings = [
    "Let me ask you about",
    "I'd like to know more about", 
    "Can you tell me about",
    "Here's my next question:",
    "I'm curious about"
  ];
  
  const transitions = [
    "Great, moving on to the next question.",
    "Thank you for that response. Now,",
    "Interesting. Let me ask you this:",
    "I see. Here's another question for you:",
    "Perfect. Let's continue with"
  ];
  
  const isFirstQuestion = questionNumber === 1;
  const isLastQuestion = questionNumber === totalQuestions;
  
  let prefix;
  if (isFirstQuestion) {
    prefix = `Welcome to your interview practice session. ${openings[Math.floor(Math.random() * openings.length)]}`;
  } else if (isLastQuestion) {
    prefix = "For our final question,";
  } else {
    prefix = transitions[Math.floor(Math.random() * transitions.length)];
  }
    
  return `${prefix} ${question}`;
};

/**
 * Enhanced text-to-speech with professional voice settings
 * @param {string} text - Text to convert to speech
 * @param {string} voiceType - Voice type from VOICE_OPTIONS
 * @param {object} customSettings - Custom voice settings
 * @returns {Promise<Blob>} Audio blob
 */
export const textToSpeech = async (text, voiceType = 'professional_female', customSettings = {}) => {
  console.log('🎤 Enhanced TTS Request:', { 
    text: text.substring(0, 50) + '...', 
    voiceType,
    hasApiKey: !!ELEVEN_LABS_API_KEY,
    textLength: text.length
  });

  if (!ELEVEN_LABS_API_KEY) {
    console.warn('⚠️ Eleven Labs API key not configured, using Web Speech API fallback');
    const fallbackSuccess = fallbackTextToSpeech(text, customSettings);
    if (fallbackSuccess) {
      // Return a dummy blob for consistency
      return new Blob([''], { type: 'audio/mpeg' });
    }
    throw new Error('Voice service not configured. Please add your Eleven Labs API key to enable professional voices.');
  }

  if (!text || text.trim().length === 0) {
    throw new Error('No text provided for speech generation');
  }

  try {
    const voiceId = VOICE_OPTIONS[voiceType] || VOICE_OPTIONS.professional_female;
    
    // Enhanced voice settings for interview context
    const defaultSettings = VOICE_PRESETS.professional;
    const voiceSettings = { ...defaultSettings, ...customSettings };
    
    // Preprocess text for better speech quality
    const processedText = preprocessTextForSpeech(text);

    const requestBody = {
      text: processedText,
      model_id: "eleven_multilingual_v2", // Better model for natural speech
      voice_settings: {
        stability: voiceSettings.stability,
        similarity_boost: voiceSettings.similarity_boost,
        style: voiceSettings.style,
        use_speaker_boost: voiceSettings.use_speaker_boost
      },
      // Additional options for better quality
      pronunciation_dictionary_locators: [],
      seed: null,
      previous_text: null,
      next_text: null,
      previous_request_ids: [],
      response_format: "mp3_44100_128" // Higher quality audio
    };

    console.log('📡 Making Enhanced TTS API request:', {
      url: `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      voiceId,
      voiceName: voiceType,
      textLength: processedText.length,
      model: requestBody.model_id,
      settings: voiceSettings
    });

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVEN_LABS_API_KEY
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log('📨 Enhanced TTS API Response:', {
      status: response.status,
      statusText: response.statusText,
      contentType: response.headers.get('content-type'),
      contentLength: response.headers.get('content-length')
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Enhanced TTS API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      
      // Try fallback on API failure
      console.log('🔄 Attempting Web Speech API fallback...');
      const fallbackSuccess = fallbackTextToSpeech(text, customSettings);
      if (fallbackSuccess) {
        return new Blob([''], { type: 'audio/mpeg' });
      }
      
      throw new Error(`Voice generation failed: ${response.status} - ${errorText}`);
    }
    
    const audioBlob = await response.blob();
    console.log('✅ Enhanced TTS Success:', {
      blobSize: audioBlob.size,
      blobType: audioBlob.type,
      sizeInKB: Math.round(audioBlob.size / 1024)
    });
    
    return audioBlob;
  } catch (error) {
    console.error('❌ Enhanced text-to-speech failed:', error);
    
    // Try fallback on any error
    console.log('🔄 Attempting Web Speech API fallback...');
    const fallbackSuccess = fallbackTextToSpeech(text, customSettings);
    if (fallbackSuccess) {
      return new Blob([''], { type: 'audio/mpeg' });
    }
    
    throw error;
  }
};

/**
 * Enhanced fallback text-to-speech using Web Speech API
 * @param {string} text - Text to speak
 * @param {object} options - Speech options
 * @returns {boolean} True if speech was initiated
 */
export const fallbackTextToSpeech = (text, options = {}) => {
  if (!('speechSynthesis' in window)) {
    console.warn('❌ Speech synthesis not supported in this browser');
    return false;
  }

  try {
    // Cancel any ongoing speech
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options.speaking_rate || 0.85;
    utterance.pitch = options.pitch || 1;
    utterance.volume = options.volume || 0.8;
    
    // Try to use a professional-sounding voice
    const voices = speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.lang.startsWith('en') && 
      (voice.name.includes('Google') || 
       voice.name.includes('Microsoft') || 
       voice.name.includes('Samantha') ||
       voice.name.includes('Alex'))
    ) || voices.find(voice => voice.lang.startsWith('en'));
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    console.log('🔊 Using enhanced Web Speech API fallback:', {
      text: text.substring(0, 50) + '...',
      voice: preferredVoice?.name || 'default',
      rate: utterance.rate,
      pitch: utterance.pitch,
      availableVoices: voices.length
    });

    speechSynthesis.speak(utterance);
    return true;
  } catch (error) {
    console.error('❌ Enhanced fallback TTS failed:', error);
    return false;
  }
};

/**
 * Create and return an Audio object from blob with enhanced controls
 * @param {Blob} audioBlob - Audio blob from TTS
 * @param {object} options - Audio options
 * @returns {HTMLAudioElement} Enhanced audio element
 */
export const createAudioFromBlob = (audioBlob, options = {}) => {
  if (audioBlob.size === 0) {
    // This was a fallback TTS call, return a dummy audio element
    const audio = new Audio();
    audio.play = () => Promise.resolve();
    audio.pause = () => {};
    audio.currentTime = 0;
    audio.duration = 0;
    return audio;
  }

  const audioUrl = URL.createObjectURL(audioBlob);
  const audio = new Audio(audioUrl);
  
  // Enhanced audio settings
  audio.volume = options.volume || 0.8;
  audio.playbackRate = options.speaking_rate || 1.0;
  
  // Clean up URL when audio is done
  audio.addEventListener('ended', () => {
    URL.revokeObjectURL(audioUrl);
  });
  
  audio.addEventListener('error', (e) => {
    console.error('🔊 Enhanced audio playback error:', e);
    URL.revokeObjectURL(audioUrl);
  });
  
  return audio;
};

/**
 * Get available voices from Eleven Labs with enhanced metadata
 * @returns {Promise<Array>} Array of available voices with metadata
 */
export const getAvailableVoices = async () => {
  if (!ELEVEN_LABS_API_KEY) {
    console.warn('⚠️ No API key for voice fetching, returning default voices');
    return Object.entries(VOICE_OPTIONS).map(([key, id]) => ({
      voice_id: id,
      name: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      labels: { gender: key.includes('female') ? 'female' : 'male' },
      category: 'professional'
    }));
  }

  try {
    console.log('📡 Fetching enhanced available voices...');
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': ELEVEN_LABS_API_KEY
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch voices: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Enhanced available voices fetched:', data.voices?.length || 0);
    return data.voices || [];
  } catch (error) {
    console.error('❌ Failed to get enhanced voices:', error);
    // Return fallback voice list
    return Object.entries(VOICE_OPTIONS).map(([key, id]) => ({
      voice_id: id,
      name: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      labels: { gender: key.includes('female') ? 'female' : 'male' },
      category: 'professional'
    }));
  }
};

/**
 * Enhanced audio cache with better management
 */
class EnhancedAudioCache {
  constructor(maxSize = 50, maxAge = 30 * 60 * 1000) { // 30 minutes
    this.cache = new Map();
    this.maxSize = maxSize;
    this.maxAge = maxAge;
  }

  get(text, voiceType = 'professional_female') {
    const key = `${text}_${voiceType}`;
    const cached = this.cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < this.maxAge) {
      console.log('📦 Using cached audio:', text.substring(0, 30) + '...');
      return cached.audioBlob;
    } else if (cached) {
      console.log('🗑️ Removing expired cache:', text.substring(0, 30) + '...');
      this.cache.delete(key);
    }
    
    return null;
  }

  set(text, voiceType, audioBlob) {
    const key = `${text}_${voiceType}`;
    
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
      console.log('🧹 Cache size limit reached, removed oldest entry');
    }
    
    this.cache.set(key, {
      audioBlob,
      timestamp: Date.now()
    });
    
    console.log('💾 Cached audio:', {
      text: text.substring(0, 30) + '...',
      voiceType,
      cacheSize: this.cache.size
    });
  }

  clear() {
    this.cache.clear();
    console.log('🧹 Audio cache cleared');
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      keys: Array.from(this.cache.keys()).map(key => key.substring(0, 50) + '...')
    };
  }
}

export const enhancedAudioCache = new EnhancedAudioCache();

/**
 * Get cached audio or generate new one with enhanced caching
 * @param {string} text - Text to convert
 * @param {string} voiceType - Voice type
 * @param {object} options - Voice options
 * @returns {Promise<Blob>} Audio blob
 */
export const getCachedAudio = async (text, voiceType = 'professional_female', options = {}) => {
  let audioBlob = enhancedAudioCache.get(text, voiceType);
  
  if (!audioBlob) {
    console.log('🎤 Generating new enhanced audio for cache:', text.substring(0, 30) + '...');
    audioBlob = await textToSpeech(text, voiceType, options);
    enhancedAudioCache.set(text, voiceType, audioBlob);
  }
  
  return audioBlob;
};

/**
 * Preload audio for upcoming questions with enhanced strategy
 * @param {Array} questions - Array of question objects
 * @param {number} currentIndex - Current question index
 * @param {object} options - Voice options
 */
export const preloadQuestionAudio = async (questions, currentIndex, options = {}) => {
  const preloadCount = 1; // Reduced from 3 to 1 to avoid concurrent request limits
  const voiceType = options.voiceType || 'professional_female';
  
  console.log('⏳ Starting audio preload for next', preloadCount, 'question(s)');
  
  for (let i = currentIndex + 1; i <= Math.min(currentIndex + preloadCount, questions.length - 1); i++) {
    try {
      const contextualText = generateInterviewContext(
        questions[i].question, 
        i + 1, 
        questions.length
      );
      await getCachedAudio(contextualText, voiceType, options);
      console.log(`✅ Preloaded enhanced audio for question ${i + 1}`);
    } catch (error) {
      console.warn(`⚠️ Failed to preload enhanced audio for question ${i + 1}:`, error);
    }
  }
};

/**
 * Test voice with sample text
 * @param {string} voiceType - Voice type to test
 * @param {object} settings - Voice settings
 * @returns {Promise<HTMLAudioElement>} Audio element for testing
 */
export const testVoice = async (voiceType, settings = {}) => {
  const testTexts = [
    "Hello! I'm your AI interviewer for today's practice session.",
    "Let me ask you about your experience with problem-solving.",
    "Can you tell me about a challenging project you've worked on?",
    "Thank you for that response. Here's my next question."
  ];
  
  const randomText = testTexts[Math.floor(Math.random() * testTexts.length)];
  
  try {
    console.log('🧪 Testing voice:', voiceType, 'with text:', randomText.substring(0, 30) + '...');
    const audioBlob = await textToSpeech(randomText, voiceType, settings);
    const audio = createAudioFromBlob(audioBlob, settings);
    return audio;
  } catch (error) {
    console.error('❌ Voice test failed:', error);
    throw error;
  }
};

/**
 * Check if enhanced voice features are available
 * @returns {boolean} True if enhanced voice features can be used
 */
export const isVoiceAvailable = () => {
  const hasElevenLabs = !!ELEVEN_LABS_API_KEY;
  const hasWebSpeech = 'speechSynthesis' in window;
  
  console.log('🔍 Voice availability check:', {
    elevenLabs: hasElevenLabs,
    webSpeech: hasWebSpeech,
    overall: hasElevenLabs || hasWebSpeech
  });
  
  return hasElevenLabs || hasWebSpeech;
};

/**
 * Initialize enhanced voice service and test connection
 */
export const initializeVoiceService = async () => {
  console.log('🚀 Initializing enhanced voice service...');
  
  if (ELEVEN_LABS_API_KEY) {
    try {
      const isConnected = await testElevenLabsConnection();
      
      if (isConnected) {
        const voices = await getAvailableVoices();
        console.log('✅ Enhanced voice service initialized successfully!', {
          voicesAvailable: voices.length,
          cacheStats: enhancedAudioCache.getStats()
        });
        
        // Test with a simple phrase
        console.log('🧪 Testing enhanced TTS with sample text...');
        await textToSpeech('Hello, this is a test of the enhanced voice system.', 'professional_female');
        console.log('✅ Enhanced TTS test successful');
        
        return true;
      } else {
        console.warn('⚠️ Eleven Labs API connection failed, falling back to Web Speech API');
        return 'speechSynthesis' in window;
      }
    } catch (error) {
      console.error('❌ Enhanced TTS initialization failed:', error);
      return 'speechSynthesis' in window;
    }
  } else {
    console.log('ℹ️ No Eleven Labs API key found');
    console.log('🔊 Web Speech API available:', 'speechSynthesis' in window);
    return 'speechSynthesis' in window;
  }
};

// Initialize on module load
initializeVoiceService();

// Export voice options for components
export { VOICE_OPTIONS };