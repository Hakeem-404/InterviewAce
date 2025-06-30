import { supabase } from '../lib/supabaseClient'

export const sessionService = {
  // Save interview session
  async saveSession(sessionData) {
    try {
      const { data, error } = await supabase
        .from('interview_sessions')
        .insert([{
          user_id: sessionData.userId,
          job_title: sessionData.jobTitle,
          company_name: sessionData.companyName,
          session_type: sessionData.sessionType, // 'practice', 'mock', 'quick'
          questions_data: sessionData.questions,
          responses_data: sessionData.responses,
          analysis_results: sessionData.analysisResults,
          overall_score: sessionData.overallScore,
          confidence_score: sessionData.confidenceScore,
          technical_score: sessionData.technicalScore,
          behavioral_score: sessionData.behavioralScore,
          communication_score: sessionData.communicationScore,
          session_duration: sessionData.duration,
          voice_enabled: sessionData.voiceEnabled,
          cv_data: sessionData.cvData,
          job_description: sessionData.jobDescription,
          feedback_summary: sessionData.feedbackSummary,
          improvement_areas: sessionData.improvementAreas,
          strengths_identified: sessionData.strengths,
          created_at: new Date().toISOString()
        }])
        .select()

      if (error) throw error
      return data[0]
    } catch (error) {
      console.error('Failed to save session:', error)
      throw error
    }
  },

  // Get user's interview history
  async getUserSessions(userId, limit = 50, offset = 0) {
    try {
      const { data, error } = await supabase
        .from('interview_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error
      return data
    } catch (error) {
      console.error('Failed to fetch sessions:', error)
      throw error
    }
  },

  // Get detailed session by ID
  async getSessionById(sessionId) {
    try {
      const { data, error } = await supabase
        .from('interview_sessions')
        .select('*')
        .eq('id', sessionId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Failed to fetch session:', error)
      throw error
    }
  },

  // Get user analytics
  async getUserAnalytics(userId, timeRange = '30d') {
    try {
      const startDate = new Date()
      if (timeRange === '7d') startDate.setDate(startDate.getDate() - 7)
      else if (timeRange === '30d') startDate.setDate(startDate.getDate() - 30)
      else if (timeRange === '90d') startDate.setDate(startDate.getDate() - 90)
      else if (timeRange === '1y') startDate.setFullYear(startDate.getFullYear() - 1)

      const { data, error } = await supabase
        .from('interview_sessions')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true })

      if (error) throw error
      return this.calculateAnalytics(data)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
      throw error
    }
  },

  // Calculate analytics from session data
  calculateAnalytics(sessions) {
    if (!sessions.length) return null

    const totalSessions = sessions.length
    const avgOverallScore = sessions.reduce((sum, s) => sum + (s.overall_score || 0), 0) / totalSessions
    const avgConfidenceScore = sessions.reduce((sum, s) => sum + (s.confidence_score || 0), 0) / totalSessions
    const avgTechnicalScore = sessions.reduce((sum, s) => sum + (s.technical_score || 0), 0) / totalSessions
    const avgBehavioralScore = sessions.reduce((sum, s) => sum + (s.behavioral_score || 0), 0) / totalSessions

    // Calculate improvement trend
    const scoreTrend = sessions.map(s => ({
      date: s.created_at,
      overall: s.overall_score || 0,
      confidence: s.confidence_score || 0,
      technical: s.technical_score || 0,
      behavioral: s.behavioral_score || 0
    }))

    // Most practiced job types
    const jobTypes = sessions.reduce((acc, s) => {
      const job = s.job_title || 'Unknown'
      acc[job] = (acc[job] || 0) + 1
      return acc
    }, {})

    // Common improvement areas
    const improvementAreas = sessions.reduce((acc, s) => {
      if (s.improvement_areas) {
        s.improvement_areas.forEach(area => {
          acc[area] = (acc[area] || 0) + 1
        })
      }
      return acc
    }, {})

    return {
      totalSessions,
      avgOverallScore,
      avgConfidenceScore,
      avgTechnicalScore,
      avgBehavioralScore,
      scoreTrend,
      jobTypes,
      improvementAreas,
      totalPracticeTime: sessions.reduce((sum, s) => sum + (s.session_duration || 0), 0),
      streakDays: this.calculateStreak(sessions),
      bestScore: Math.max(...sessions.map(s => s.overall_score || 0)),
      mostRecentSession: sessions[sessions.length - 1]
    }
  },

  // Calculate practice streak
  calculateStreak(sessions) {
    if (!sessions.length) return 0

    const dates = [...new Set(sessions.map(s => 
      new Date(s.created_at).toDateString()
    ))].sort()

    let streak = 0
    let currentDate = new Date()
    
    for (let i = dates.length - 1; i >= 0; i--) {
      const sessionDate = new Date(dates[i])
      const daysDiff = Math.floor((currentDate - sessionDate) / (1000 * 60 * 60 * 24))
      
      if (daysDiff === streak) {
        streak++
      } else if (daysDiff > streak + 1) {
        break
      }
    }
    
    return streak
  },

  // Save session to localStorage as fallback
  saveSessionLocal(sessionData) {
    try {
      const sessions = JSON.parse(localStorage.getItem('interviewSessions') || '[]')
      const newSession = {
        id: Date.now(),
        ...sessionData,
        timestamp: new Date().toISOString()
      }
      sessions.push(newSession)
      localStorage.setItem('interviewSessions', JSON.stringify(sessions))
      return newSession
    } catch (error) {
      console.error('Failed to save session locally:', error)
      throw error
    }
  },

  // Get sessions from localStorage
  getSessionsLocal(userId) {
    try {
      const sessions = JSON.parse(localStorage.getItem('interviewSessions') || '[]')
      return sessions.filter(session => session.userId === userId)
    } catch (error) {
      console.error('Failed to get local sessions:', error)
      return []
    }
  }
}