import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { analyticsService } from '../../services/analyticsService'
import { 
  Brain, TrendingUp, Target, Zap, AlertTriangle, CheckCircle,
  BarChart3, PieChart, LineChart, Radar, Star, Trophy,
  Clock, Calendar, Users, Award, Lightbulb, Flag,
  ArrowUp, ArrowDown, Minus, Activity, Eye, Download
} from 'lucide-react'
import { 
  ResponsiveContainer, LineChart as RechartsLineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, Radar as RechartsRadar, BarChart, Bar, 
  PieChart as RechartsPieChart, Cell, Area, AreaChart
} from 'recharts'
import Button from '../Button'
import LoadingStates from '../LoadingStates'

const AdvancedAnalyticsDashboard = () => {
  const { user } = useAuth()
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedTimeRange, setSelectedTimeRange] = useState('90d')
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (user) {
      loadInsights()
    }
  }, [user, selectedTimeRange])

  const loadInsights = async () => {
    try {
      setLoading(true)
      const data = await analyticsService.generateUserInsights(user.id, selectedTimeRange)
      setInsights(data)
    } catch (error) {
      console.error('Failed to load insights:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportInsights = () => {
    const dataStr = JSON.stringify({
      insights,
      generatedAt: new Date().toISOString(),
      timeRange: selectedTimeRange,
      userId: user.id
    }, null, 2)
    
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `interview-insights-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingStates type="analysis" message="Analyzing your interview performance with AI..." />
      </div>
    )
  }

  if (!insights) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Analytics Data Available</h2>
          <p className="text-gray-600 mb-6">Complete more practice sessions to unlock detailed performance insights</p>
          <Button onClick={() => window.location.href = '/upload'}>
            Start Practice Session
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Advanced Analytics</h1>
            <p className="text-gray-600 text-lg">AI-powered insights into your interview performance</p>
          </div>
          
          <div className="flex items-center gap-4 mt-4 lg:mt-0">
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="180d">Last 6 months</option>
              <option value="1y">Last year</option>
            </select>
            <Button
              onClick={exportInsights}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Interview Readiness Score */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl shadow-2xl p-8 mb-8 text-white">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="text-center lg:text-left mb-6 lg:mb-0">
              <h2 className="text-3xl font-bold mb-3">Interview Readiness Score</h2>
              <p className="text-blue-100 text-lg">AI assessment based on your recent performance and trends</p>
              <div className="mt-4 flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-sm">Real-time Analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  <span className="text-sm">AI Powered</span>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="relative inline-flex items-center justify-center w-40 h-40 mb-4">
                <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-blue-300 opacity-30"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="transparent"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-white"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    fill="transparent"
                    strokeDasharray={`${insights.predictiveInsights.readinessScore * 10}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    style={{
                      strokeDashoffset: 0,
                      animation: 'progress 2s ease-in-out'
                    }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold">
                    {insights.predictiveInsights.readinessScore.toFixed(1)}
                  </span>
                  <span className="text-sm opacity-90">out of 10</span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-lg font-semibold">
                  {insights.predictiveInsights.readinessScore >= 8 ? 'Interview Ready!' :
                   insights.predictiveInsights.readinessScore >= 6 ? 'Almost Ready' :
                   insights.predictiveInsights.readinessScore >= 4 ? 'Needs Practice' : 'Keep Practicing'}
                </p>
                <p className="text-sm text-blue-100">
                  Success Probability: {Math.round(insights.predictiveInsights.successProbability * 100)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-soft mb-8 border border-gray-100">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6 overflow-x-auto" aria-label="Tabs">
              {[
                { id: 'overview', name: 'Overview', icon: BarChart3 },
                { id: 'performance', name: 'Performance', icon: TrendingUp },
                { id: 'skills', name: 'Skills Analysis', icon: Target },
                { id: 'predictions', name: 'AI Predictions', icon: Brain },
                { id: 'recommendations', name: 'Recommendations', icon: Lightbulb }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && <OverviewTab insights={insights} />}
        {activeTab === 'performance' && <PerformanceTab insights={insights} />}
        {activeTab === 'skills' && <SkillsTab insights={insights} />}
        {activeTab === 'predictions' && <PredictionsTab insights={insights} />}
        {activeTab === 'recommendations' && <RecommendationsTab insights={insights} />}
      </div>
    </div>
  )
}

// Overview Tab Component
const OverviewTab = ({ insights }) => {
  const getTrendIcon = (direction) => {
    switch (direction) {
      case 'improving': return <ArrowUp className="h-4 w-4 text-green-600" />
      case 'declining': return <ArrowDown className="h-4 w-4 text-red-600" />
      default: return <Minus className="h-4 w-4 text-gray-600" />
    }
  }

  const getPerformanceLevelColor = (level) => {
    switch (level) {
      case 'expert': return 'bg-purple-100 text-purple-800'
      case 'proficient': return 'bg-green-100 text-green-800'
      case 'developing': return 'bg-blue-100 text-blue-800'
      case 'beginner': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-red-100 text-red-800'
    }
  }

  return (
    <div className="space-y-8">
      {/* Performance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-soft p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <Trophy className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex items-center gap-1">
              {getTrendIcon(insights.performanceAnalysis.trendDirection)}
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">Performance Level</h3>
          <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getPerformanceLevelColor(insights.performanceAnalysis.currentLevel)}`}>
            {insights.performanceAnalysis.currentLevel.replace('_', ' ').toUpperCase()}
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {insights.performanceAnalysis.trendDirection === 'improving' ? '📈 Trending up' :
             insights.performanceAnalysis.trendDirection === 'declining' ? '📉 Needs attention' : '➡️ Stable performance'}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-soft p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-500">Consistency</span>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {insights.performanceAnalysis.consistency.toFixed(1)}/10
          </h3>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${(insights.performanceAnalysis.consistency / 10) * 100}%` }}
            />
          </div>
          <p className="text-sm text-gray-600">Performance stability</p>
        </div>

        <div className="bg-white rounded-xl shadow-soft p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Zap className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-500">AI Prediction</span>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {Math.round(insights.predictiveInsights.successProbability * 100)}%
          </h3>
          <p className="text-sm text-gray-600">Success probability</p>
          <p className="text-xs text-purple-600 mt-1 font-medium">Next interview</p>
        </div>

        <div className="bg-white rounded-xl shadow-soft p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 rounded-xl">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-500">Estimated</span>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">
            {insights.predictiveInsights.timeToImprovement}
          </h3>
          <p className="text-sm text-gray-600">To next level</p>
        </div>
      </div>

      {/* Skills Radar Chart */}
      <div className="bg-white rounded-xl shadow-soft p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Skills Overview</h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Activity className="h-4 w-4" />
            <span>Real-time assessment</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={insights.skillsGapAnalysis.skillsTrends}>
            <PolarGrid />
            <PolarAngleAxis dataKey="skill" className="text-sm" />
            <PolarRadiusAxis domain={[0, 10]} tick={false} />
            <RechartsRadar
              name="Current Level"
              dataKey="currentLevel"
              stroke="#3B82F6"
              fill="#3B82F6"
              fillOpacity={0.3}
              strokeWidth={3}
            />
            <RechartsRadar
              name="Trend"
              dataKey="trend"
              stroke="#10B981"
              fill="#10B981"
              fillOpacity={0.1}
              strokeWidth={2}
              strokeDasharray="5 5"
            />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Performance Distribution */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-soft p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Score Distribution</h3>
          <div className="space-y-4">
            {Object.entries(insights.performanceAnalysis.scoreDistribution).map(([level, count]) => (
              <div key={level} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${
                    level === 'excellent' ? 'bg-green-500' :
                    level === 'good' ? 'bg-blue-500' :
                    level === 'fair' ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                  <span className="capitalize font-medium text-gray-700">{level}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        level === 'excellent' ? 'bg-green-500' :
                        level === 'good' ? 'bg-blue-500' :
                        level === 'fair' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${(count / Math.max(...Object.values(insights.performanceAnalysis.scoreDistribution))) * 100}%` }}
                    />
                  </div>
                  <span className="font-bold text-gray-900 w-6">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-soft p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Confidence Trends</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <p className="font-medium text-blue-900">Overall Trend</p>
                <p className="text-sm text-blue-700">
                  {insights.confidenceTrends.overallTrend > 0 ? 'Increasing confidence' : 
                   insights.confidenceTrends.overallTrend < 0 ? 'Decreasing confidence' : 'Stable confidence'}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {insights.confidenceTrends.overallTrend > 0 ? 
                  <ArrowUp className="h-5 w-5 text-green-600" /> :
                  insights.confidenceTrends.overallTrend < 0 ?
                  <ArrowDown className="h-5 w-5 text-red-600" /> :
                  <Minus className="h-5 w-5 text-gray-600" />
                }
                <span className="font-bold text-lg">
                  {Math.abs(insights.confidenceTrends.overallTrend).toFixed(2)}
                </span>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-medium text-gray-900 mb-2">Volatility Score</p>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-orange-500 h-3 rounded-full"
                  style={{ width: `${Math.min(100, insights.confidenceTrends.confidenceVolatility * 20)}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {insights.confidenceTrends.confidenceVolatility < 1 ? 'Very stable' :
                 insights.confidenceTrends.confidenceVolatility < 2 ? 'Stable' :
                 insights.confidenceTrends.confidenceVolatility < 3 ? 'Moderate' : 'High variation'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Performance Tab Component
const PerformanceTab = ({ insights }) => (
  <div className="space-y-8">
    {/* Performance Metrics */}
    <div className="grid md:grid-cols-3 gap-6">
      <div className="bg-white rounded-xl shadow-soft p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Improvement Rate</h3>
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {insights.performanceAnalysis.improvementRate > 0 ? '+' : ''}
            {insights.performanceAnalysis.improvementRate.toFixed(1)}%
          </div>
          <p className="text-sm text-gray-600">Recent vs. Previous</p>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-soft p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Stability</h3>
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {insights.performanceAnalysis.performanceStability.toFixed(1)}/10
          </div>
          <p className="text-sm text-gray-600">Consistency Score</p>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-soft p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Variability</h3>
        <div className="text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {insights.performanceAnalysis.performanceVariability.toFixed(1)}
          </div>
          <p className="text-sm text-gray-600">Score Range</p>
        </div>
      </div>
    </div>

    {/* Question Type Performance */}
    {insights.questionTypePerformance && (
      <div className="bg-white rounded-xl shadow-soft p-6 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Performance by Question Type</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={insights.questionTypePerformance}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="type" />
            <YAxis domain={[0, 10]} />
            <Tooltip />
            <Bar dataKey="averageScore" fill="#3B82F6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    )}

    {/* Time-based Patterns */}
    {insights.timeBasedPatterns && (
      <div className="bg-white rounded-xl shadow-soft p-6 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Performance by Time of Day</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {insights.timeBasedPatterns.map((pattern) => (
            <div key={pattern.timeSlot} className="p-4 bg-gray-50 rounded-lg text-center">
              <h4 className="font-semibold text-gray-900 capitalize mb-2">{pattern.timeSlot}</h4>
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {pattern.averageScore.toFixed(1)}
              </div>
              <p className="text-sm text-gray-600">{pattern.sessionCount} sessions</p>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
)

// Skills Tab Component
const SkillsTab = ({ insights }) => (
  <div className="space-y-8">
    {/* Skills Trends */}
    <div className="bg-white rounded-xl shadow-soft p-6 border border-gray-100">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Skills Development Trends</h3>
      <div className="space-y-4">
        {insights.skillsGapAnalysis.skillsTrends.map((skill) => (
          <div key={skill.skill} className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900">{skill.skill}</h4>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-blue-600">
                  {skill.currentLevel.toFixed(1)}/10
                </span>
                <div className="flex items-center gap-1">
                  {skill.trend > 0 ? 
                    <ArrowUp className="h-4 w-4 text-green-600" /> :
                    skill.trend < 0 ?
                    <ArrowDown className="h-4 w-4 text-red-600" /> :
                    <Minus className="h-4 w-4 text-gray-600" />
                  }
                </div>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
              <div 
                className="bg-blue-500 h-3 rounded-full transition-all duration-1000"
                style={{ width: `${(skill.currentLevel / 10) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Improvement Rate: {skill.improvementRate.toFixed(1)}%</span>
              <span>Trend: {skill.trend > 0 ? 'Improving' : skill.trend < 0 ? 'Declining' : 'Stable'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Persistent Gaps and Emerging Strengths */}
    <div className="grid md:grid-cols-2 gap-8">
      <div className="bg-white rounded-xl shadow-soft p-6 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Persistent Skill Gaps</h3>
        <div className="space-y-3">
          {insights.skillsGapAnalysis.persistentGaps.map((gap) => (
            <div key={gap.area} className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium text-red-900">{gap.area}</span>
                <span className="text-sm font-bold text-red-700">
                  {Math.round(gap.frequency * 100)}%
                </span>
              </div>
              <p className="text-sm text-red-700 mt-1">
                Appears in {Math.round(gap.frequency * 100)}% of sessions
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-soft p-6 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Emerging Strengths</h3>
        <div className="space-y-3">
          {insights.skillsGapAnalysis.emergingStrengths.map((strength) => (
            <div key={strength.skill} className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium text-green-900">{strength.skill}</span>
                <div className="flex items-center gap-1">
                  <ArrowUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-bold text-green-700">
                    +{strength.trend.toFixed(1)}
                  </span>
                </div>
              </div>
              <p className="text-sm text-green-700 mt-1">
                Showing strong improvement trend
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
)

// Predictions Tab Component
const PredictionsTab = ({ insights }) => (
  <div className="space-y-8">
    {/* Prediction Cards */}
    <div className="grid md:grid-cols-2 gap-6">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-blue-100 rounded-xl">
            <Brain className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-blue-900">AI Predictions</h3>
        </div>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-blue-700 mb-1">Success Probability</p>
            <div className="text-3xl font-bold text-blue-900">
              {Math.round(insights.predictiveInsights.successProbability * 100)}%
            </div>
          </div>
          <div>
            <p className="text-sm text-blue-700 mb-1">Time to Improvement</p>
            <div className="text-xl font-semibold text-blue-900">
              {insights.predictiveInsights.timeToImprovement}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-purple-100 rounded-xl">
            <Target className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="text-xl font-bold text-purple-900">Recommended Focus</h3>
        </div>
        <div className="space-y-3">
          {insights.predictiveInsights.recommendedPracticeAreas.slice(0, 3).map((area, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full" />
              <span className="text-purple-800 font-medium">{area}</span>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Risk Factors and Opportunities */}
    <div className="grid md:grid-cols-2 gap-8">
      <div className="bg-white rounded-xl shadow-soft p-6 border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <AlertTriangle className="h-6 w-6 text-red-600" />
          <h3 className="text-xl font-bold text-gray-900">Risk Factors</h3>
        </div>
        <div className="space-y-3">
          {insights.predictiveInsights.riskFactors.map((risk, index) => (
            <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-medium">{risk}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-soft p-6 border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <Star className="h-6 w-6 text-green-600" />
          <h3 className="text-xl font-bold text-gray-900">Opportunities</h3>
        </div>
        <div className="space-y-3">
          {insights.predictiveInsights.opportunityAreas.map((opportunity, index) => (
            <div key={index} className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium">{opportunity}</p>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Industry Benchmarks */}
    <div className="bg-white rounded-xl shadow-soft p-6 border border-gray-100">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Industry Benchmarks</h3>
      <div className="grid md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {insights.industryBenchmarks.averageScore}
          </div>
          <p className="text-sm text-gray-600">Industry Average</p>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {insights.industryBenchmarks.topPercentile}
          </div>
          <p className="text-sm text-gray-600">Top 10%</p>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {insights.industryBenchmarks.industryMedian}
          </div>
          <p className="text-sm text-gray-600">Median Score</p>
        </div>
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-lg font-bold text-blue-900 mb-1">
            {insights.industryBenchmarks.yourRanking}
          </div>
          <p className="text-sm text-blue-600">Your Ranking</p>
        </div>
      </div>
    </div>
  </div>
)

// Recommendations Tab Component
const RecommendationsTab = ({ insights }) => (
  <div className="space-y-6">
    {insights.personalizedRecommendations.map((recommendation, index) => (
      <div key={index} className="bg-white rounded-xl shadow-soft p-6 border border-gray-100">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${
              recommendation.priority === 'high' ? 'bg-red-100' :
              recommendation.priority === 'medium' ? 'bg-yellow-100' : 'bg-green-100'
            }`}>
              <Lightbulb className={`h-6 w-6 ${
                recommendation.priority === 'high' ? 'text-red-600' :
                recommendation.priority === 'medium' ? 'text-yellow-600' : 'text-green-600'
              }`} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{recommendation.title}</h3>
              <p className="text-gray-600">{recommendation.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              recommendation.priority === 'high' ? 'bg-red-100 text-red-800' :
              recommendation.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
            }`}>
              {recommendation.priority.toUpperCase()} PRIORITY
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {recommendation.estimatedImpact.toUpperCase()} IMPACT
            </span>
          </div>
        </div>
        
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900">Action Steps:</h4>
          <ul className="space-y-2">
            {recommendation.actions.map((action, actionIndex) => (
              <li key={actionIndex} className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                <span className="text-gray-700">{action}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    ))}
  </div>
)

export default AdvancedAnalyticsDashboard