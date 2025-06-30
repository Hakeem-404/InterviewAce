import React, { useState, useEffect } from 'react'
import { 
  Settings, Target, Clock, BarChart3, Plus, Minus,
  Shuffle, Filter, BookOpen, Zap, Users, Code, 
  Eye, Save, RotateCcw, Info, AlertCircle, CheckCircle,
  Lightbulb, TrendingUp, Star, Award, Brain
} from 'lucide-react'
import Button from '../Button'
import LoadingStates from '../LoadingStates'
import { generateQuestionPreview } from '../../services/apiService'

const QuestionConfiguration = ({ 
  onConfigurationChange,
  jobAnalysis,
  defaultConfig = {},
  onStartInterview
}) => {
  const [config, setConfig] = useState({
    totalQuestions: defaultConfig.totalQuestions || 8,
    timeLimit: defaultConfig.timeLimit || 30, // minutes
    difficulty: defaultConfig.difficulty || 'mixed',
    categories: defaultConfig.categories || {
      technical: 40,
      behavioral: 40,
      situational: 20,
      company_specific: 0
    },
    questionTypes: defaultConfig.questionTypes || {
      short_answer: 60,
      detailed_explanation: 30,
      case_study: 10
    },
    focusAreas: defaultConfig.focusAreas || [],
    includeFollowUps: defaultConfig.includeFollowUps !== undefined ? defaultConfig.includeFollowUps : true,
    adaptiveDifficulty: defaultConfig.adaptiveDifficulty || false,
    industrySpecific: defaultConfig.industrySpecific !== undefined ? defaultConfig.industrySpecific : true,
    voiceMode: defaultConfig.voiceMode || false,
    realTimeEvaluation: defaultConfig.realTimeEvaluation !== undefined ? defaultConfig.realTimeEvaluation : true
  })

  const [estimatedDuration, setEstimatedDuration] = useState(0)
  const [previewQuestions, setPreviewQuestions] = useState([])
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [validationErrors, setValidationErrors] = useState([])
  const [savedConfigs, setSavedConfigs] = useState([])

  useEffect(() => {
    calculateEstimatedDuration()
    validateConfiguration()
    onConfigurationChange?.(config)
  }, [config])

  useEffect(() => {
    loadSavedConfigurations()
  }, [])

  const calculateEstimatedDuration = () => {
    const avgTimePerQuestion = {
      short_answer: 2, // minutes
      detailed_explanation: 4,
      case_study: 8
    }

    let totalTime = 0
    Object.entries(config.questionTypes).forEach(([type, percentage]) => {
      const questionCount = Math.round((config.totalQuestions * percentage) / 100)
      totalTime += questionCount * avgTimePerQuestion[type]
    })

    // Add time for follow-ups and adaptive difficulty
    if (config.includeFollowUps) totalTime *= 1.2
    if (config.adaptiveDifficulty) totalTime *= 1.1

    setEstimatedDuration(Math.round(totalTime))
  }

  const validateConfiguration = () => {
    const errors = []
    
    // Check if categories add up to 100%
    const categoryTotal = Object.values(config.categories).reduce((sum, val) => sum + val, 0)
    if (Math.abs(categoryTotal - 100) > 5) {
      errors.push('Question categories should add up to 100%')
    }

    // Check if question types add up to 100%
    const typeTotal = Object.values(config.questionTypes).reduce((sum, val) => sum + val, 0)
    if (Math.abs(typeTotal - 100) > 5) {
      errors.push('Question types should add up to 100%')
    }

    // Check reasonable time limits
    if (estimatedDuration > config.timeLimit * 1.5) {
      errors.push('Time limit may be too short for the selected configuration')
    }

    setValidationErrors(errors)
  }

  const updateConfig = (key, value) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const updateCategories = (category, value) => {
    setConfig(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [category]: Math.max(0, Math.min(100, value))
      }
    }))
  }

  const updateQuestionTypes = (type, value) => {
    setConfig(prev => ({
      ...prev,
      questionTypes: {
        ...prev.questionTypes,
        [type]: Math.max(0, Math.min(100, value))
      }
    }))
  }

  const normalizePercentages = (obj, targetSum = 100) => {
    const currentSum = Object.values(obj).reduce((a, b) => a + b, 0)
    if (currentSum === 0) return obj
    
    const normalized = {}
    Object.entries(obj).forEach(([key, value]) => {
      normalized[key] = Math.round((value / currentSum) * targetSum)
    })
    
    return normalized
  }

  const generatePreview = async () => {
    setIsGeneratingPreview(true)
    try {
      const preview = await generateQuestionPreview(config, jobAnalysis)
      setPreviewQuestions(preview)
      setShowPreview(true)
    } catch (error) {
      console.error('Preview generation failed:', error)
    } finally {
      setIsGeneratingPreview(false)
    }
  }

  const saveConfiguration = () => {
    const configName = prompt('Enter a name for this configuration:')
    if (configName) {
      const newConfig = {
        id: Date.now(),
        name: configName,
        config: { ...config },
        createdAt: new Date().toISOString()
      }
      
      const saved = [...savedConfigs, newConfig]
      setSavedConfigs(saved)
      localStorage.setItem('interviewConfigurations', JSON.stringify(saved))
    }
  }

  const loadSavedConfigurations = () => {
    try {
      const saved = JSON.parse(localStorage.getItem('interviewConfigurations') || '[]')
      setSavedConfigs(saved)
    } catch (error) {
      console.error('Failed to load saved configurations:', error)
    }
  }

  const loadConfiguration = (savedConfig) => {
    setConfig(savedConfig.config)
  }

  const presetConfigurations = {
    quick: {
      name: 'Quick Practice',
      description: '5 questions, 15 minutes - Perfect for a quick warm-up',
      icon: <Zap className="h-5 w-5" />,
      color: 'green',
      config: {
        totalQuestions: 5,
        timeLimit: 15,
        difficulty: 'easy',
        categories: { technical: 30, behavioral: 70, situational: 0, company_specific: 0 },
        questionTypes: { short_answer: 80, detailed_explanation: 20, case_study: 0 },
        includeFollowUps: false,
        adaptiveDifficulty: false
      }
    },
    standard: {
      name: 'Standard Interview',
      description: '8 questions, 30 minutes - Balanced practice session',
      icon: <Target className="h-5 w-5" />,
      color: 'blue',
      config: {
        totalQuestions: 8,
        timeLimit: 30,
        difficulty: 'mixed',
        categories: { technical: 40, behavioral: 40, situational: 20, company_specific: 0 },
        questionTypes: { short_answer: 60, detailed_explanation: 30, case_study: 10 },
        includeFollowUps: true,
        adaptiveDifficulty: false
      }
    },
    comprehensive: {
      name: 'Comprehensive',
      description: '15 questions, 60 minutes - Full interview simulation',
      icon: <BookOpen className="h-5 w-5" />,
      color: 'purple',
      config: {
        totalQuestions: 15,
        timeLimit: 60,
        difficulty: 'mixed',
        categories: { technical: 35, behavioral: 35, situational: 20, company_specific: 10 },
        questionTypes: { short_answer: 40, detailed_explanation: 40, case_study: 20 },
        includeFollowUps: true,
        adaptiveDifficulty: true
      }
    },
    technical_focused: {
      name: 'Technical Deep Dive',
      description: '10 questions, 45 minutes - Technical skills focus',
      icon: <Code className="h-5 w-5" />,
      color: 'red',
      config: {
        totalQuestions: 10,
        timeLimit: 45,
        difficulty: 'hard',
        categories: { technical: 70, behavioral: 20, situational: 10, company_specific: 0 },
        questionTypes: { short_answer: 30, detailed_explanation: 50, case_study: 20 },
        includeFollowUps: true,
        adaptiveDifficulty: true
      }
    },
    behavioral_focus: {
      name: 'Behavioral Focus',
      description: '12 questions, 40 minutes - Soft skills emphasis',
      icon: <Users className="h-5 w-5" />,
      color: 'orange',
      config: {
        totalQuestions: 12,
        timeLimit: 40,
        difficulty: 'medium',
        categories: { technical: 20, behavioral: 60, situational: 20, company_specific: 0 },
        questionTypes: { short_answer: 50, detailed_explanation: 40, case_study: 10 },
        includeFollowUps: true,
        adaptiveDifficulty: false
      }
    },
    executive: {
      name: 'Executive Level',
      description: '8 questions, 50 minutes - Leadership & strategy focus',
      icon: <Award className="h-5 w-5" />,
      color: 'indigo',
      config: {
        totalQuestions: 8,
        timeLimit: 50,
        difficulty: 'hard',
        categories: { technical: 20, behavioral: 40, situational: 30, company_specific: 10 },
        questionTypes: { short_answer: 30, detailed_explanation: 40, case_study: 30 },
        includeFollowUps: true,
        adaptiveDifficulty: true
      }
    }
  }

  const applyPreset = (presetKey) => {
    const preset = presetConfigurations[presetKey]
    if (preset) {
      setConfig(prev => ({ ...prev, ...preset.config }))
    }
  }

  const getColorClasses = (color) => {
    const colors = {
      green: 'border-green-300 bg-green-50 hover:bg-green-100',
      blue: 'border-blue-300 bg-blue-50 hover:bg-blue-100',
      purple: 'border-purple-300 bg-purple-50 hover:bg-purple-100',
      red: 'border-red-300 bg-red-50 hover:bg-red-100',
      orange: 'border-orange-300 bg-orange-50 hover:bg-orange-100',
      indigo: 'border-indigo-300 bg-indigo-50 hover:bg-indigo-100'
    }
    return colors[color] || colors.blue
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'hard': return 'bg-red-100 text-red-800'
      case 'mixed': return 'bg-blue-100 text-blue-800'
      case 'adaptive': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-soft p-8 space-y-8 border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-xl">
            <Settings className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Interview Configuration</h3>
            <p className="text-gray-600">Customize your practice session for optimal learning</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="flex items-center gap-2 mb-2">
            <p className="text-3xl font-bold text-blue-600">{config.totalQuestions}</p>
            <div className="text-left">
              <p className="text-sm text-gray-600">Questions</p>
              <p className="text-xs text-gray-500">~{estimatedDuration}min</p>
            </div>
          </div>
          <div className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(config.difficulty)}`}>
            {config.difficulty.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <h4 className="font-medium text-red-900">Configuration Issues</h4>
          </div>
          <ul className="text-sm text-red-800 space-y-1">
            {validationErrors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Preset Configurations */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-600" />
            Quick Start Presets
          </h4>
          <Button
            variant="outline"
            size="sm"
            onClick={saveConfiguration}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Save Current
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(presetConfigurations).map(([key, preset]) => (
            <button
              key={key}
              onClick={() => applyPreset(key)}
              className={`p-4 border-2 rounded-xl transition-all duration-200 text-left hover:scale-105 ${getColorClasses(preset.color)}`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg bg-${preset.color}-100`}>
                  {preset.icon}
                </div>
                <div>
                  <h5 className="font-semibold text-gray-900">{preset.name}</h5>
                  <p className="text-xs text-gray-600">{preset.description}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>{preset.config.totalQuestions} questions</span>
                <span>{preset.config.timeLimit}min</span>
              </div>
            </button>
          ))}
        </div>

        {/* Saved Configurations */}
        {savedConfigs.length > 0 && (
          <div className="mt-6">
            <h5 className="font-medium text-gray-900 mb-3">Your Saved Configurations</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {savedConfigs.map((savedConfig) => (
                <button
                  key={savedConfig.id}
                  onClick={() => loadConfiguration(savedConfig)}
                  className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{savedConfig.name}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(savedConfig.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {savedConfig.config.totalQuestions} questions • {savedConfig.config.timeLimit}min
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Basic Settings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Number of Questions */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Number of Questions
          </label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => updateConfig('totalQuestions', Math.max(1, config.totalQuestions - 1))}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Minus className="h-4 w-4" />
            </button>
            
            <input
              type="number"
              min="1"
              max="50"
              value={config.totalQuestions}
              onChange={(e) => updateConfig('totalQuestions', parseInt(e.target.value) || 1)}
              className="w-20 text-center border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            
            <button
              onClick={() => updateConfig('totalQuestions', Math.min(50, config.totalQuestions + 1))}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <p className="text-xs text-gray-500">Recommended: 5-15 questions</p>
        </div>

        {/* Time Limit */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Time Limit (minutes)
          </label>
          <div className="flex items-center gap-3">
            <Clock className="h-4 w-4 text-gray-400" />
            <input
              type="number"
              min="5"
              max="180"
              value={config.timeLimit}
              onChange={(e) => updateConfig('timeLimit', parseInt(e.target.value) || 5)}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="text-xs text-gray-500">
            <p>Estimated: {estimatedDuration} min</p>
            <p className={estimatedDuration > config.timeLimit ? 'text-red-600' : 'text-green-600'}>
              {estimatedDuration > config.timeLimit ? 'May need more time' : 'Time looks good'}
            </p>
          </div>
        </div>

        {/* Difficulty Level */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Difficulty Level
          </label>
          <select
            value={config.difficulty}
            onChange={(e) => updateConfig('difficulty', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="easy">Easy - Entry Level</option>
            <option value="medium">Medium - Mid Level</option>
            <option value="hard">Hard - Senior Level</option>
            <option value="mixed">Mixed - All Levels</option>
            <option value="adaptive">Adaptive - Adjusts Based on Performance</option>
          </select>
          <p className="text-xs text-gray-500">
            {config.difficulty === 'adaptive' && 'Questions get harder/easier based on your answers'}
          </p>
        </div>
      </div>

      {/* Question Categories */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Question Categories
          </h4>
          <button
            onClick={() => setConfig(prev => ({ 
              ...prev, 
              categories: normalizePercentages(prev.categories) 
            }))}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Auto-balance to 100%
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(config.categories).map(([category, percentage]) => (
            <div key={category} className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-700 capitalize flex items-center gap-2">
                  {category === 'technical' && <Code className="h-4 w-4" />}
                  {category === 'behavioral' && <Users className="h-4 w-4" />}
                  {category === 'situational' && <Lightbulb className="h-4 w-4" />}
                  {category === 'company_specific' && <Star className="h-4 w-4" />}
                  {category.replace('_', ' ')}
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-900">{percentage}%</span>
                  <span className="text-xs text-gray-500">
                    (~{Math.round((config.totalQuestions * percentage) / 100)})
                  </span>
                </div>
              </div>
              
              <input
                type="range"
                min="0"
                max="100"
                value={percentage}
                onChange={(e) => updateCategories(category, parseInt(e.target.value))}
                className="w-full accent-blue-500"
              />
              
              <div className="text-xs text-gray-500">
                {category === 'technical' && 'Programming, system design, technical concepts'}
                {category === 'behavioral' && 'Past experiences, teamwork, leadership'}
                {category === 'situational' && 'Hypothetical scenarios, problem-solving'}
                {category === 'company_specific' && 'Company culture, values, specific role'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Question Types */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-blue-600" />
          Question Types & Response Length
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-700">Short Answer</label>
              <span className="text-sm font-bold text-gray-900">{config.questionTypes.short_answer}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={config.questionTypes.short_answer}
              onChange={(e) => updateQuestionTypes('short_answer', parseInt(e.target.value))}
              className="w-full accent-green-500"
            />
            <div className="text-xs text-gray-500">
              <p className="font-medium">1-2 minutes each</p>
              <p>Quick, concise responses</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-700">Detailed Explanation</label>
              <span className="text-sm font-bold text-gray-900">{config.questionTypes.detailed_explanation}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={config.questionTypes.detailed_explanation}
              onChange={(e) => updateQuestionTypes('detailed_explanation', parseInt(e.target.value))}
              className="w-full accent-yellow-500"
            />
            <div className="text-xs text-gray-500">
              <p className="font-medium">3-4 minutes each</p>
              <p>In-depth explanations with examples</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-700">Case Study</label>
              <span className="text-sm font-bold text-gray-900">{config.questionTypes.case_study}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={config.questionTypes.case_study}
              onChange={(e) => updateQuestionTypes('case_study', parseInt(e.target.value))}
              className="w-full accent-purple-500"
            />
            <div className="text-xs text-gray-500">
              <p className="font-medium">5-10 minutes each</p>
              <p>Complex scenarios requiring analysis</p>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Options */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Filter className="h-5 w-5 text-blue-600" />
          Advanced Features
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={config.includeFollowUps}
                onChange={(e) => updateConfig('includeFollowUps', e.target.checked)}
                className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">Include Follow-up Questions</span>
                <p className="text-xs text-gray-500 mt-1">AI asks clarifying questions based on your answers</p>
              </div>
            </label>
            
            <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={config.adaptiveDifficulty}
                onChange={(e) => updateConfig('adaptiveDifficulty', e.target.checked)}
                className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">Adaptive Difficulty</span>
                <p className="text-xs text-gray-500 mt-1">Questions get harder/easier based on performance</p>
              </div>
            </label>
            
            <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={config.industrySpecific}
                onChange={(e) => updateConfig('industrySpecific', e.target.checked)}
                className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">Industry-Specific Questions</span>
                <p className="text-xs text-gray-500 mt-1">Include current industry trends and practices</p>
              </div>
            </label>
          </div>

          <div className="space-y-4">
            <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={config.voiceMode}
                onChange={(e) => updateConfig('voiceMode', e.target.checked)}
                className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">Voice Mode</span>
                <p className="text-xs text-gray-500 mt-1">Questions read aloud, voice responses supported</p>
              </div>
            </label>
            
            <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={config.realTimeEvaluation}
                onChange={(e) => updateConfig('realTimeEvaluation', e.target.checked)}
                className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">Real-time AI Evaluation</span>
                <p className="text-xs text-gray-500 mt-1">Get instant feedback after each answer</p>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Configuration Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Session Summary
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-blue-600 font-medium">Questions:</span>
            <p className="text-blue-900 font-bold">{config.totalQuestions} total</p>
          </div>
          <div>
            <span className="text-blue-600 font-medium">Duration:</span>
            <p className="text-blue-900 font-bold">~{estimatedDuration} minutes</p>
          </div>
          <div>
            <span className="text-blue-600 font-medium">Difficulty:</span>
            <p className="text-blue-900 font-bold capitalize">{config.difficulty}</p>
          </div>
          <div>
            <span className="text-blue-600 font-medium">Focus:</span>
            <p className="text-blue-900 font-bold">
              {Object.entries(config.categories)
                .filter(([_, percentage]) => percentage > 30)
                .map(([category, _]) => category.replace('_', ' '))
                .join(', ') || 'Balanced'}
            </p>
          </div>
        </div>
        
        {/* Feature Summary */}
        <div className="mt-4 flex flex-wrap gap-2">
          {config.includeFollowUps && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
              Follow-ups
            </span>
          )}
          {config.adaptiveDifficulty && (
            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
              Adaptive
            </span>
          )}
          {config.voiceMode && (
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
              Voice Mode
            </span>
          )}
          {config.realTimeEvaluation && (
            <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
              Real-time AI
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <Button
            onClick={generatePreview}
            loading={isGeneratingPreview}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            {isGeneratingPreview ? 'Generating...' : 'Preview Questions'}
          </Button>
          
          <Button
            onClick={() => setConfig(presetConfigurations.standard.config)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-right text-sm text-gray-600">
            <p>Ready to start?</p>
            <p className="text-xs">
              {validationErrors.length === 0 ? (
                <span className="text-green-600 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Configuration looks good
                </span>
              ) : (
                <span className="text-red-600">Please fix issues above</span>
              )}
            </p>
          </div>
          
          <Button
            onClick={() => onStartInterview?.(config)}
            disabled={validationErrors.length > 0}
            size="lg"
            className="px-8 py-3 text-lg font-semibold"
          >
            Start Interview
          </Button>
        </div>
      </div>

      {/* Question Preview Modal */}
      {showPreview && (
        <QuestionPreviewModal 
          questions={previewQuestions}
          config={config}
          onClose={() => setShowPreview(false)}
          onStartInterview={() => onStartInterview?.(config)}
        />
      )}
    </div>
  )
}

// Question Preview Modal Component
const QuestionPreviewModal = ({ questions, config, onClose, onStartInterview }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Question Preview</h3>
            <p className="text-gray-600">Sample questions based on your configuration</p>
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
      </div>
      
      <div className="p-6 overflow-y-auto max-h-96">
        <div className="space-y-6">
          {questions.map((question, index) => (
            <div key={index} className="p-6 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </span>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    {question.category}
                  </span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                    {question.difficulty}
                  </span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                    {question.type.replace('_', ' ')}
                  </span>
                </div>
              </div>
              <p className="text-gray-900 text-lg leading-relaxed mb-3">{question.text}</p>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {question.estimatedTime}
                </span>
                <span className="text-blue-600 font-medium">
                  {question.type === 'case_study' ? 'Complex Analysis' : 
                   question.type === 'detailed_explanation' ? 'Detailed Response' : 'Quick Answer'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="p-6 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <p className="font-medium">Configuration Summary:</p>
            <p>{config.totalQuestions} questions • {config.difficulty} difficulty • Voice: {config.voiceMode ? 'On' : 'Off'}</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Modify Configuration
            </Button>
            <Button
              onClick={onStartInterview}
              className="flex items-center gap-2"
            >
              <Brain className="h-4 w-4" />
              Start Interview
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
)

export default QuestionConfiguration