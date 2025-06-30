import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { sessionService } from '../services/sessionService'
import { 
  Calendar, Clock, Award, TrendingUp, Search, Filter,
  BarChart3, LineChart, User, Briefcase, ChevronRight,
  Star, Target, Brain, Zap, Play, Eye, Download,
  ArrowUp, ArrowDown, Minus, Trophy, BookOpen
} from 'lucide-react'
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import Button from '../components/Button'
import LoadingStates from '../components/LoadingStates'

const InterviewHistoryPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [sessions, setSessions] = useState([])
  const [filteredSessions, setFilteredSessions] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: '',
    jobType: 'all',
    scoreRange: 'all',
    timeRange: '30d'
  })
  const [selectedSession, setSelectedSession] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (user) {
      loadUserData()
    }
  }, [user, filters.timeRange])

  useEffect(() => {
    applyFilters()
  }, [sessions, filters])

  const loadUserData = async () => {
    try {
      setLoading(true)
      
      // Try to load from Supabase first, fallback to localStorage
      let sessionsData = []
      let analyticsData = null
      
      try {
        sessionsData = await sessionService.getUserSessions(user.id)
        analyticsData = await sessionService.getUserAnalytics(user.id, filters.timeRange)
      } catch (error) {
        console.log('Using localStorage fallback for sessions')
        sessionsData = sessionService.getSessionsLocal(user.id)
        analyticsData = sessionService.calculateAnalytics(sessionsData)
      }
      
      setSessions(sessionsData)
      setAnalytics(analyticsData)
    } catch (error) {
      console.error('Failed to load user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...sessions]

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(session => 
        session.job_title?.toLowerCase().includes(filters.search.toLowerCase()) ||
        session.company_name?.toLowerCase().includes(filters.search.toLowerCase())
      )
    }

    // Job type filter
    if (filters.jobType !== 'all') {
      filtered = filtered.filter(session => session.job_title === filters.jobType)
    }

    // Score range filter
    if (filters.scoreRange !== 'all') {
      const [min, max] = filters.scoreRange.split('-').map(Number)
      filtered = filtered.filter(session => {
        const score = session.overall_score || 0
        return score >= min && score <= max
      })
    }

    setFilteredSessions(filtered)
  }

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-600 bg-green-100'
    if (score >= 6) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getScoreIcon = (score) => {
    if (score >= 8) return <Trophy className="h-4 w-4" />
    if (score >= 6) return <Award className="h-4 w-4" />
    return <Target className="h-4 w-4" />
  }

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const getTrendIcon = (value) => {
    if (value > 0) return <ArrowUp className="h-4 w-4 text-green-600" />
    if (value < 0) return <ArrowDown className="h-4 w-4 text-red-600" />
    return <Minus className="h-4 w-4 text-gray-600" />
  }

  const exportData = () => {
    const dataStr = JSON.stringify({
      sessions: filteredSessions,
      analytics,
      exportDate: new Date().toISOString()
    }, null, 2)
    
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `interview-history-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingStates type="processing" message="Loading your interview history..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Interview History</h1>
            <p className="text-gray-600">Track your progress and analyze your performance over time</p>
          </div>
          <div className="flex gap-3 mt-4 sm:mt-0">
            <Button
              onClick={exportData}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export Data
            </Button>
            <Button
              onClick={() => navigate('/upload')}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              New Practice Session
            </Button>
          </div>
        </div>

        {/* Analytics Overview */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-soft p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{analytics.totalSessions}</p>
                  <p className="text-sm text-gray-600">Total Sessions</p>
                </div>
              </div>
              {analytics.streakDays > 0 && (
                <div className="flex items-center gap-2 text-orange-600 bg-orange-50 px-3 py-1 rounded-full text-sm">
                  <span>🔥</span>
                  <span className="font-medium">{analytics.streakDays} day streak!</span>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-soft p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-xl">
                  <Award className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{analytics.avgOverallScore.toFixed(1)}</p>
                  <p className="text-sm text-gray-600">Average Score</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Best: {analytics.bestScore.toFixed(1)}</span>
                <div className="flex items-center gap-1">
                  {getScoreIcon(analytics.avgOverallScore)}
                  <span className="font-medium">
                    {analytics.avgOverallScore >= 8 ? 'Excellent' : 
                     analytics.avgOverallScore >= 6 ? 'Good' : 'Improving'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-soft p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.floor(analytics.totalPracticeTime / 3600)}h
                  </p>
                  <p className="text-sm text-gray-600">Practice Time</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                {Math.floor((analytics.totalPracticeTime % 3600) / 60)}m additional
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-soft p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-100 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    {getTrendIcon(analytics.avgConfidenceScore - 5)}
                    <p className="text-2xl font-bold text-gray-900">
                      {analytics.avgConfidenceScore.toFixed(1)}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600">Confidence Level</p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(analytics.avgConfidenceScore / 10) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-soft mb-8 border border-gray-100">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'sessions', label: 'Session History', icon: BookOpen },
                { id: 'analytics', label: 'Performance Analytics', icon: TrendingUp }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && analytics && (
              <div className="space-y-8">
                {/* Progress Chart */}
                {analytics.scoreTrend.length > 1 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Trend</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsLineChart data={analytics.scoreTrend}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(date) => new Date(date).toLocaleDateString()}
                        />
                        <YAxis domain={[0, 10]} />
                        <Tooltip 
                          labelFormatter={(date) => new Date(date).toLocaleDateString()}
                          formatter={(value, name) => [value.toFixed(1), name]}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="overall" 
                          stroke="#3B82F6" 
                          strokeWidth={3}
                          name="Overall Score"
                          dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="confidence" 
                          stroke="#10B981" 
                          strokeWidth={2}
                          name="Confidence"
                          dot={{ fill: '#10B981', strokeWidth: 2, r: 3 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="technical" 
                          stroke="#8B5CF6" 
                          strokeWidth={2}
                          name="Technical"
                          dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 3 }}
                        />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Job Types Distribution */}
                {Object.keys(analytics.jobTypes).length > 0 && (
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Practiced Roles</h3>
                      <div className="space-y-3">
                        {Object.entries(analytics.jobTypes)
                          .sort(([,a], [,b]) => b - a)
                          .slice(0, 5)
                          .map(([job, count]) => (
                            <div key={job} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <span className="font-medium text-gray-900">{job}</span>
                              <div className="flex items-center gap-2">
                                <div className="w-20 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-blue-500 h-2 rounded-full"
                                    style={{ width: `${(count / Math.max(...Object.values(analytics.jobTypes))) * 100}%` }}
                                  />
                                </div>
                                <span className="text-sm font-bold text-gray-700">{count}</span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Common Improvement Areas</h3>
                      <div className="space-y-3">
                        {Object.entries(analytics.improvementAreas)
                          .sort(([,a], [,b]) => b - a)
                          .slice(0, 5)
                          .map(([area, count]) => (
                            <div key={area} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                              <span className="font-medium text-gray-900">{area}</span>
                              <span className="text-sm font-bold text-orange-700">{count}x</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Sessions Tab */}
            {activeTab === 'sessions' && (
              <div className="space-y-6">
                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by job title or company..."
                      value={filters.search}
                      onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <select
                    value={filters.timeRange}
                    onChange={(e) => setFilters({ ...filters, timeRange: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                    <option value="90d">Last 90 days</option>
                    <option value="1y">Last year</option>
                  </select>

                  <select
                    value={filters.scoreRange}
                    onChange={(e) => setFilters({ ...filters, scoreRange: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All scores</option>
                    <option value="8-10">Excellent (8-10)</option>
                    <option value="6-8">Good (6-8)</option>
                    <option value="0-6">Needs improvement (0-6)</option>
                  </select>

                  <select
                    value={filters.jobType}
                    onChange={(e) => setFilters({ ...filters, jobType: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All job types</option>
                    {analytics && Object.keys(analytics.jobTypes).map(job => (
                      <option key={job} value={job}>{job}</option>
                    ))}
                  </select>
                </div>

                {/* Sessions List */}
                <div className="space-y-4">
                  {filteredSessions.length === 0 ? (
                    <div className="text-center py-12">
                      <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No sessions found</h3>
                      <p className="text-gray-600 mb-4">Try adjusting your filters or start a new practice session</p>
                      <Button onClick={() => navigate('/upload')}>
                        Start New Session
                      </Button>
                    </div>
                  ) : (
                    filteredSessions.map((session) => (
                      <SessionCard 
                        key={session.id} 
                        session={session} 
                        onClick={() => setSelectedSession(session)}
                      />
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && analytics && (
              <div className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Score Breakdown */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Score Breakdown</h3>
                    <div className="space-y-4">
                      {[
                        { label: 'Overall', value: analytics.avgOverallScore, color: 'blue' },
                        { label: 'Technical', value: analytics.avgTechnicalScore, color: 'purple' },
                        { label: 'Behavioral', value: analytics.avgBehavioralScore, color: 'green' },
                        { label: 'Confidence', value: analytics.avgConfidenceScore, color: 'orange' }
                      ].map((item) => (
                        <div key={item.label} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">{item.label}</span>
                            <span className="font-bold text-gray-900">{item.value.toFixed(1)}/10</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                              className={`h-3 rounded-full bg-${item.color}-500 transition-all duration-1000`}
                              style={{ width: `${(item.value / 10) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Performance Insights */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Insights</h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <h4 className="font-medium text-green-900 mb-2">Strengths</h4>
                        <ul className="text-sm text-green-800 space-y-1">
                          <li>• Consistent practice schedule</li>
                          <li>• Strong technical performance</li>
                          <li>• Improving confidence levels</li>
                        </ul>
                      </div>
                      
                      <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                        <h4 className="font-medium text-orange-900 mb-2">Areas for Growth</h4>
                        <ul className="text-sm text-orange-800 space-y-1">
                          <li>• Focus on behavioral questions</li>
                          <li>• Practice storytelling techniques</li>
                          <li>• Work on specific examples</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Session Detail Modal */}
        {selectedSession && (
          <SessionDetailModal 
            session={selectedSession} 
            onClose={() => setSelectedSession(null)}
          />
        )}
      </div>
    </div>
  )
}

// Session Card Component
const SessionCard = ({ session, onClick }) => {
  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-600 bg-green-100'
    if (score >= 6) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    return `${minutes}min`
  }

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-xl shadow-soft hover:shadow-lg transition-all duration-200 cursor-pointer p-6 border border-gray-100 card-hover"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <Briefcase className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900">
              {session.job_title || 'Untitled Position'}
            </h3>
            {session.company_name && (
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {session.company_name}
              </span>
            )}
            {session.voice_enabled && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                Voice Mode
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(session.created_at || session.timestamp).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {formatDuration(session.session_duration || 0)}
            </span>
            <span className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              {session.questions_data?.length || 0} questions
            </span>
            <span className="flex items-center gap-1">
              <User className="h-4 w-4" />
              {session.session_type || 'practice'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className={`px-4 py-2 rounded-full text-sm font-bold ${getScoreColor(session.overall_score)}`}>
              {session.overall_score?.toFixed(1) || 'N/A'}/10
            </div>
            <div className="text-xs text-gray-500 mt-1">Overall Score</div>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </div>
      </div>
    </div>
  )
}

// Session Detail Modal Component
const SessionDetailModal = ({ session, onClose }) => {
  if (!session) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Session Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            {/* Session Info */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Session Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Job Title:</span>
                    <span className="font-medium">{session.job_title || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Company:</span>
                    <span className="font-medium">{session.company_name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">
                      {new Date(session.created_at || session.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">
                      {Math.floor((session.session_duration || 0) / 60)}m {(session.session_duration || 0) % 60}s
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Performance Scores</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Overall', value: session.overall_score },
                    { label: 'Technical', value: session.technical_score },
                    { label: 'Behavioral', value: session.behavioral_score },
                    { label: 'Confidence', value: session.confidence_score }
                  ].map((score) => (
                    <div key={score.label} className="flex items-center justify-between">
                      <span className="text-gray-600">{score.label}:</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${((score.value || 0) / 10) * 100}%` }}
                          />
                        </div>
                        <span className="font-bold text-sm w-8">
                          {score.value?.toFixed(1) || 'N/A'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Questions and Responses */}
            {session.questions_data && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Questions & Responses ({session.questions_data.length})
                </h3>
                <div className="space-y-4 max-h-60 overflow-y-auto">
                  {session.questions_data.map((question, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">
                        Q{index + 1}: {question.question || question}
                      </h4>
                      {session.responses_data?.[index] && (
                        <p className="text-sm text-gray-700 bg-white p-3 rounded border">
                          {session.responses_data[index].length > 200 
                            ? session.responses_data[index].substring(0, 200) + '...'
                            : session.responses_data[index]
                          }
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Feedback Summary */}
            {session.feedback_summary && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">AI Feedback Summary</h3>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-800">{session.feedback_summary}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default InterviewHistoryPage