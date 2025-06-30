import { supabase } from '../lib/supabaseClient'

export const analyticsService = {
  // Generate comprehensive user insights
  async generateUserInsights(userId, timeRange = '90d') {
    try {
      const sessions = await this.getUserSessionsWithDetails(userId, timeRange)
      
      if (!sessions.length) return null

      const insights = {
        performanceAnalysis: this.analyzePerformance(sessions),
        skillsGapAnalysis: this.analyzeSkillsGaps(sessions),
        confidenceTrends: this.analyzeConfidenceTrends(sessions),
        questionTypePerformance: this.analyzeQuestionTypes(sessions),
        timeBasedPatterns: this.analyzeTimePatterns(sessions),
        industryBenchmarks: await this.getIndustryBenchmarks(sessions),
        predictiveInsights: this.generatePredictiveInsights(sessions),
        personalizedRecommendations: this.generateRecommendations(sessions),
        strengthsWeaknessesMap: this.mapStrengthsWeaknesses(sessions),
        improvementTrajectory: this.calculateImprovementTrajectory(sessions)
      }

      return insights
    } catch (error) {
      console.error('Failed to generate insights:', error)
      throw error
    }
  },

  // Get user sessions with details for analysis
  async getUserSessionsWithDetails(userId, timeRange) {
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
      return data || []
    } catch (error) {
      console.error('Failed to fetch sessions for insights:', error)
      // Fallback to localStorage
      const sessions = JSON.parse(localStorage.getItem('interviewSessions') || '[]')
      return sessions.filter(session => session.userId === userId)
    }
  },

  // Analyze overall performance patterns
  analyzePerformance(sessions) {
    const scores = sessions.map(s => s.overall_score).filter(Boolean)
    const recentSessions = sessions.slice(-5)
    const olderSessions = sessions.slice(0, 5)
    
    const recentAvg = recentSessions.reduce((sum, s) => sum + (s.overall_score || 0), 0) / recentSessions.length
    const olderAvg = olderSessions.reduce((sum, s) => sum + (s.overall_score || 0), 0) / olderSessions.length
    
    const improvementRate = olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0
    const consistency = this.calculateConsistency(scores)
    const performanceStability = this.calculateStability(scores)
    
    return {
      currentLevel: this.categorizePerformanceLevel(recentAvg),
      improvementRate,
      consistency,
      performanceStability,
      trendDirection: improvementRate > 5 ? 'improving' : improvementRate < -5 ? 'declining' : 'stable',
      scoreDistribution: this.calculateScoreDistribution(scores),
      performanceVariability: this.calculateVariability(scores)
    }
  },

  // Analyze skills gaps across sessions
  analyzeSkillsGaps(sessions) {
    const skillsData = {}
    const improvementAreas = {}
    
    sessions.forEach(session => {
      if (session.analysis_results) {
        // Technical skills analysis
        const technical = session.technical_score || 0
        const behavioral = session.behavioral_score || 0
        const communication = session.communication_score || 0
        
        skillsData.technical = skillsData.technical || []
        skillsData.behavioral = skillsData.behavioral || []
        skillsData.communication = skillsData.communication || []
        
        skillsData.technical.push(technical)
        skillsData.behavioral.push(behavioral)
        skillsData.communication.push(communication)
      }
      
      if (session.improvement_areas) {
        session.improvement_areas.forEach(area => {
          improvementAreas[area] = (improvementAreas[area] || 0) + 1
        })
      }
    })

    return {
      skillsTrends: Object.keys(skillsData).map(skill => ({
        skill,
        currentLevel: skillsData[skill].slice(-3).reduce((a, b) => a + b, 0) / 3,
        trend: this.calculateTrend(skillsData[skill]),
        improvementRate: this.calculateSkillImprovementRate(skillsData[skill])
      })),
      persistentGaps: Object.entries(improvementAreas)
        .filter(([_, count]) => count >= sessions.length * 0.3)
        .map(([area, count]) => ({ area, frequency: count / sessions.length })),
      emergingStrengths: this.identifyEmergingStrengths(skillsData),
      priorityAreas: this.identifyPriorityAreas(improvementAreas, sessions.length)
    }
  },

  // Analyze confidence patterns
  analyzeConfidenceTrends(sessions) {
    const confidenceScores = sessions.map(s => ({
      score: s.confidence_score || 0,
      date: s.created_at,
      jobType: s.job_title,
      sessionType: s.session_type
    }))

    return {
      overallTrend: this.calculateTrend(confidenceScores.map(c => c.score)),
      confidenceByJobType: this.groupConfidenceByJobType(confidenceScores),
      confidencePatterns: this.identifyConfidencePatterns(confidenceScores),
      confidenceVolatility: this.calculateVolatility(confidenceScores.map(c => c.score)),
      confidenceCorrelations: this.analyzeConfidenceCorrelations(sessions)
    }
  },

  // Analyze question type performance
  analyzeQuestionTypes(sessions) {
    const questionTypes = {}
    
    sessions.forEach(session => {
      if (session.questions_data) {
        session.questions_data.forEach((question, index) => {
          const category = question.category || 'General'
          if (!questionTypes[category]) {
            questionTypes[category] = { scores: [], count: 0 }
          }
          questionTypes[category].count++
          
          // If we have evaluation data for this question
          if (session.analysis_results && session.analysis_results[index]) {
            questionTypes[category].scores.push(session.analysis_results[index].score || 0)
          }
        })
      }
    })

    return Object.entries(questionTypes).map(([type, data]) => ({
      type,
      averageScore: data.scores.length > 0 ? data.scores.reduce((a, b) => a + b, 0) / data.scores.length : 0,
      totalQuestions: data.count,
      trend: this.calculateTrend(data.scores)
    }))
  },

  // Generate predictive insights
  generatePredictiveInsights(sessions) {
    const recentPerformance = sessions.slice(-10)
    const performanceTrend = this.calculateTrend(recentPerformance.map(s => s.overall_score))
    
    return {
      readinessScore: this.calculateInterviewReadiness(recentPerformance),
      successProbability: this.predictSuccessProbability(recentPerformance),
      recommendedPracticeAreas: this.recommendPracticeAreas(sessions),
      timeToImprovement: this.estimateImprovementTime(sessions),
      riskFactors: this.identifyRiskFactors(sessions),
      opportunityAreas: this.identifyOpportunities(sessions)
    }
  },

  // Generate personalized recommendations
  generateRecommendations(sessions) {
    const recentSessions = sessions.slice(-5)
    const recommendations = []

    // Performance-based recommendations
    const avgScore = recentSessions.reduce((sum, s) => sum + (s.overall_score || 0), 0) / recentSessions.length
    
    if (avgScore < 6) {
      recommendations.push({
        type: 'urgent',
        category: 'fundamentals',
        title: 'Focus on Interview Fundamentals',
        description: 'Your scores suggest you need to work on basic interview skills',
        actions: [
          'Practice STAR method for behavioral questions',
          'Prepare 5-7 core stories about your experience',
          'Research common interview questions for your field'
        ],
        priority: 'high',
        estimatedImpact: 'high'
      })
    }

    // Confidence-based recommendations
    const avgConfidence = recentSessions.reduce((sum, s) => sum + (s.confidence_score || 0), 0) / recentSessions.length
    
    if (avgConfidence < 5) {
      recommendations.push({
        type: 'development',
        category: 'confidence',
        title: 'Build Interview Confidence',
        description: 'Work on projecting confidence and reducing interview anxiety',
        actions: [
          'Practice power posing before interviews',
          'Record yourself answering questions',
          'Focus on accomplishment-based stories'
        ],
        priority: 'medium',
        estimatedImpact: 'medium'
      })
    }

    // Skill-specific recommendations
    const skillGaps = this.analyzeSkillsGaps(sessions)
    skillGaps.persistentGaps.forEach(gap => {
      recommendations.push({
        type: 'skill',
        category: 'technical',
        title: `Improve ${gap.area}`,
        description: `This area appears in ${Math.round(gap.frequency * 100)}% of your sessions`,
        actions: this.getSkillSpecificActions(gap.area),
        priority: gap.frequency > 0.5 ? 'high' : 'medium',
        estimatedImpact: 'high'
      })
    })

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  },

  // Calculate interview readiness score
  calculateInterviewReadiness(sessions) {
    if (!sessions.length) return 0

    const factors = {
      recentPerformance: sessions.slice(-3).reduce((sum, s) => sum + (s.overall_score || 0), 0) / 3,
      consistency: this.calculateConsistency(sessions.map(s => s.overall_score)),
      confidence: sessions.slice(-3).reduce((sum, s) => sum + (s.confidence_score || 0), 0) / 3,
      practiceFrequency: this.calculatePracticeFrequency(sessions),
      skillsCoverage: this.calculateSkillsCoverage(sessions)
    }

    // Weighted readiness score
    const readinessScore = (
      factors.recentPerformance * 0.3 +
      factors.consistency * 0.2 +
      factors.confidence * 0.2 +
      factors.practiceFrequency * 0.15 +
      factors.skillsCoverage * 0.15
    )

    return Math.min(10, Math.max(0, readinessScore))
  },

  // Helper methods
  calculateConsistency(scores) {
    if (!scores.length) return 0
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length
    return Math.max(0, 10 - Math.sqrt(variance))
  },

  calculateTrend(values) {
    if (values.length < 2) return 0
    const n = values.length
    const sumX = n * (n + 1) / 2
    const sumY = values.reduce((a, b) => a + b, 0)
    const sumXY = values.reduce((sum, y, i) => sum + (i + 1) * y, 0)
    const sumX2 = n * (n + 1) * (2 * n + 1) / 6
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
    return slope
  },

  calculateStability(scores) {
    if (scores.length < 2) return 10
    const changes = []
    for (let i = 1; i < scores.length; i++) {
      changes.push(Math.abs(scores[i] - scores[i-1]))
    }
    const avgChange = changes.reduce((a, b) => a + b, 0) / changes.length
    return Math.max(0, 10 - avgChange)
  },

  calculateVariability(scores) {
    if (!scores.length) return 0
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length
    return Math.sqrt(variance)
  },

  calculateScoreDistribution(scores) {
    const distribution = { excellent: 0, good: 0, fair: 0, poor: 0 }
    scores.forEach(score => {
      if (score >= 8) distribution.excellent++
      else if (score >= 6) distribution.good++
      else if (score >= 4) distribution.fair++
      else distribution.poor++
    })
    return distribution
  },

  categorizePerformanceLevel(score) {
    if (score >= 8.5) return 'expert'
    if (score >= 7) return 'proficient'
    if (score >= 5.5) return 'developing'
    if (score >= 4) return 'beginner'
    return 'needs_improvement'
  },

  calculateSkillImprovementRate(scores) {
    if (scores.length < 2) return 0
    const recent = scores.slice(-3).reduce((a, b) => a + b, 0) / 3
    const older = scores.slice(0, 3).reduce((a, b) => a + b, 0) / 3
    return older > 0 ? ((recent - older) / older) * 100 : 0
  },

  identifyEmergingStrengths(skillsData) {
    return Object.keys(skillsData)
      .filter(skill => {
        const scores = skillsData[skill]
        const trend = this.calculateTrend(scores)
        const recent = scores.slice(-3).reduce((a, b) => a + b, 0) / 3
        return trend > 0.5 && recent > 7
      })
      .map(skill => ({ skill, trend: this.calculateTrend(skillsData[skill]) }))
  },

  identifyPriorityAreas(improvementAreas, totalSessions) {
    return Object.entries(improvementAreas)
      .filter(([_, count]) => count / totalSessions > 0.4)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([area, count]) => ({ area, frequency: count / totalSessions }))
  },

  groupConfidenceByJobType(confidenceScores) {
    const grouped = {}
    confidenceScores.forEach(({ score, jobType }) => {
      if (!grouped[jobType]) grouped[jobType] = []
      grouped[jobType].push(score)
    })
    
    return Object.entries(grouped).map(([jobType, scores]) => ({
      jobType,
      averageConfidence: scores.reduce((a, b) => a + b, 0) / scores.length,
      sessionCount: scores.length
    }))
  },

  identifyConfidencePatterns(confidenceScores) {
    // Analyze patterns like time of day, session length, etc.
    return {
      averageBySessionType: this.groupBy(confidenceScores, 'sessionType'),
      trendOverTime: this.calculateTrend(confidenceScores.map(c => c.score))
    }
  },

  calculateVolatility(scores) {
    if (scores.length < 2) return 0
    const changes = []
    for (let i = 1; i < scores.length; i++) {
      changes.push(Math.abs(scores[i] - scores[i-1]))
    }
    return changes.reduce((a, b) => a + b, 0) / changes.length
  },

  analyzeConfidenceCorrelations(sessions) {
    // Analyze correlation between confidence and performance
    const pairs = sessions.map(s => ({
      confidence: s.confidence_score || 0,
      performance: s.overall_score || 0
    })).filter(p => p.confidence > 0 && p.performance > 0)
    
    if (pairs.length < 2) return 0
    
    // Simple correlation calculation
    const n = pairs.length
    const sumX = pairs.reduce((sum, p) => sum + p.confidence, 0)
    const sumY = pairs.reduce((sum, p) => sum + p.performance, 0)
    const sumXY = pairs.reduce((sum, p) => sum + p.confidence * p.performance, 0)
    const sumX2 = pairs.reduce((sum, p) => sum + p.confidence * p.confidence, 0)
    const sumY2 = pairs.reduce((sum, p) => sum + p.performance * p.performance, 0)
    
    const correlation = (n * sumXY - sumX * sumY) / 
      Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY))
    
    return isNaN(correlation) ? 0 : correlation
  },

  analyzeTimePatterns(sessions) {
    // Analyze performance patterns by time
    const timePatterns = {}
    sessions.forEach(session => {
      const hour = new Date(session.created_at).getHours()
      const timeSlot = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'
      
      if (!timePatterns[timeSlot]) timePatterns[timeSlot] = []
      timePatterns[timeSlot].push(session.overall_score || 0)
    })
    
    return Object.entries(timePatterns).map(([timeSlot, scores]) => ({
      timeSlot,
      averageScore: scores.reduce((a, b) => a + b, 0) / scores.length,
      sessionCount: scores.length
    }))
  },

  getIndustryBenchmarks(sessions) {
    // Mock industry benchmarks - in real app, this would come from aggregated data
    return {
      averageScore: 6.8,
      topPercentile: 8.5,
      industryMedian: 6.2,
      yourRanking: 'Above Average' // Based on user's performance
    }
  },

  predictSuccessProbability(sessions) {
    if (!sessions.length) return 0
    
    const recentAvg = sessions.slice(-3).reduce((sum, s) => sum + (s.overall_score || 0), 0) / 3
    const consistency = this.calculateConsistency(sessions.map(s => s.overall_score))
    const trend = this.calculateTrend(sessions.map(s => s.overall_score))
    
    // Simple probability model
    let probability = (recentAvg / 10) * 0.6 + (consistency / 10) * 0.3 + Math.max(0, trend) * 0.1
    return Math.min(1, Math.max(0, probability))
  },

  recommendPracticeAreas(sessions) {
    const skillGaps = this.analyzeSkillsGaps(sessions)
    return skillGaps.priorityAreas.map(area => area.area)
  },

  estimateImprovementTime(sessions) {
    const trend = this.calculateTrend(sessions.map(s => s.overall_score))
    if (trend <= 0) return '8-12 weeks'
    
    const currentAvg = sessions.slice(-3).reduce((sum, s) => sum + (s.overall_score || 0), 0) / 3
    const targetScore = 8
    const weeksToTarget = Math.ceil((targetScore - currentAvg) / (trend * 4))
    
    return `${Math.max(2, weeksToTarget)} weeks`
  },

  identifyRiskFactors(sessions) {
    const risks = []
    
    const recentSessions = sessions.slice(-5)
    const avgScore = recentSessions.reduce((sum, s) => sum + (s.overall_score || 0), 0) / recentSessions.length
    
    if (avgScore < 5) risks.push('Low overall performance')
    
    const consistency = this.calculateConsistency(sessions.map(s => s.overall_score))
    if (consistency < 5) risks.push('Inconsistent performance')
    
    const trend = this.calculateTrend(sessions.map(s => s.overall_score))
    if (trend < -0.5) risks.push('Declining performance trend')
    
    return risks
  },

  identifyOpportunities(sessions) {
    const opportunities = []
    
    const skillGaps = this.analyzeSkillsGaps(sessions)
    if (skillGaps.emergingStrengths.length > 0) {
      opportunities.push('Leverage emerging strengths in technical areas')
    }
    
    const confidenceTrend = this.calculateTrend(sessions.map(s => s.confidence_score))
    if (confidenceTrend > 0.5) {
      opportunities.push('Building confidence - continue current approach')
    }
    
    return opportunities
  },

  calculatePracticeFrequency(sessions) {
    if (sessions.length < 2) return 0
    
    const dates = sessions.map(s => new Date(s.created_at))
    const daysBetween = (dates[dates.length - 1] - dates[0]) / (1000 * 60 * 60 * 24)
    const frequency = sessions.length / Math.max(1, daysBetween)
    
    return Math.min(10, frequency * 30) // Normalize to 0-10 scale
  },

  calculateSkillsCoverage(sessions) {
    const skillTypes = new Set()
    sessions.forEach(session => {
      if (session.questions_data) {
        session.questions_data.forEach(question => {
          if (question.category) skillTypes.add(question.category)
        })
      }
    })
    
    const expectedSkills = ['Technical', 'Behavioral', 'Communication', 'Leadership']
    const coverage = skillTypes.size / expectedSkills.length
    return Math.min(10, coverage * 10)
  },

  getSkillSpecificActions(area) {
    const actions = {
      'Technical Skills': [
        'Practice coding problems on LeetCode',
        'Review system design concepts',
        'Prepare technical project explanations'
      ],
      'Communication': [
        'Practice explaining complex topics simply',
        'Work on active listening skills',
        'Record yourself speaking to improve clarity'
      ],
      'Leadership': [
        'Prepare leadership scenario examples',
        'Practice conflict resolution stories',
        'Develop team management examples'
      ]
    }
    
    return actions[area] || [
      'Research best practices for this area',
      'Practice with mock scenarios',
      'Seek feedback from mentors'
    ]
  },

  groupBy(array, key) {
    return array.reduce((groups, item) => {
      const group = item[key] || 'unknown'
      groups[group] = groups[group] || []
      groups[group].push(item)
      return groups
    }, {})
  }
}