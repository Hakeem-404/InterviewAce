import { supabase } from '../lib/supabaseClient'

/**
 * Analyze CV and job description using Claude AI
 * @param {string} cvText - Extracted CV text
 * @param {string} jobDescription - Job description text
 * @returns {Promise<object>} Analysis results
 */
export const analyzeDocuments = async (cvText, jobDescription) => {
  try {
    const { data, error } = await supabase.functions.invoke('analyze-documents', {
      body: { cvText, jobDescription }
    })
    
    if (error) {
      console.error('Supabase function error:', error)
      throw new Error(error.message || 'Failed to analyze documents')
    }
    
    return data
  } catch (error) {
    console.error('Document analysis error:', error)
    throw error
  }
}

/**
 * Generate personalized interview questions
 * @param {string} cvText - Extracted CV text
 * @param {string} jobDescription - Job description text
 * @param {object} analysis - Analysis results from analyzeDocuments
 * @returns {Promise<object>} Generated questions
 */
export const generateQuestions = async (cvText, jobDescription, analysis) => {
  try {
    const { data, error } = await supabase.functions.invoke('generate-questions', {
      body: { cvText, jobDescription, analysis }
    })
    
    if (error) {
      console.error('Supabase function error:', error)
      throw new Error(error.message || 'Failed to generate questions')
    }
    
    return data
  } catch (error) {
    console.error('Question generation error:', error)
    throw error
  }
}

/**
 * Generate personalized interview questions with custom configuration
 * @param {string} cvText - Extracted CV text
 * @param {string} jobDescription - Job description text
 * @param {object} analysis - Analysis results from analyzeDocuments
 * @param {object} config - Custom configuration for question generation
 * @returns {Promise<object>} Generated questions
 */
export const generateQuestionsWithConfig = async (cvText, jobDescription, analysis, config) => {
  try {
    const { data, error } = await supabase.functions.invoke('generate-configured-questions', {
      body: { 
        cvText, 
        jobDescription, 
        analysis,
        configuration: config
      }
    })
    
    if (error) {
      console.error('Supabase function error:', error)
      throw new Error(error.message || 'Failed to generate configured questions')
    }
    
    return data
  } catch (error) {
    console.error('Configured question generation error:', error)
    throw error
  }
}

/**
 * Evaluate a candidate's answer to an interview question
 * @param {string} question - The interview question
 * @param {string} answer - The candidate's answer
 * @param {object} questionContext - Additional context about the question
 * @returns {Promise<object>} Evaluation results
 */
export const evaluateAnswer = async (question, answer, questionContext = {}) => {
  try {
    const { data, error } = await supabase.functions.invoke('evaluate-answer', {
      body: { question, answer, questionContext }
    })
    
    if (error) {
      console.error('Supabase function error:', error)
      throw new Error(error.message || 'Failed to evaluate answer')
    }
    
    return data
  } catch (error) {
    console.error('Answer evaluation error:', error)
    throw error
  }
}

/**
 * Evaluate a comprehensive response with detailed analysis
 * @param {string} question - The interview question
 * @param {string} answer - The candidate's answer
 * @param {string} cvContext - CV context for personalized feedback
 * @param {string} questionCategory - Category of the question
 * @param {object} questionContext - Additional question context
 * @returns {Promise<object>} Comprehensive evaluation results
 */
export const evaluateResponse = async (question, answer, cvContext, questionCategory, questionContext = {}) => {
  try {
    const { data, error } = await supabase.functions.invoke('evaluate-response', {
      body: { 
        question, 
        answer, 
        cvContext, 
        questionCategory,
        questionContext 
      }
    })
    
    if (error) {
      console.error('Supabase function error:', error)
      throw new Error(error.message || 'Failed to evaluate response')
    }
    
    return data
  } catch (error) {
    console.error('Response evaluation error:', error)
    throw new Error('Failed to evaluate response. Please try again.')
  }
}

/**
 * Get comprehensive interview feedback
 * @param {Array} questionsAndAnswers - Array of {question, answer, evaluation} objects
 * @param {object} analysis - Initial document analysis
 * @returns {object} Overall interview performance summary
 */
export const getInterviewSummary = (questionsAndAnswers, analysis) => {
  const evaluations = questionsAndAnswers
    .filter(qa => qa.evaluation)
    .map(qa => qa.evaluation)

  if (evaluations.length === 0) {
    return {
      overallScore: 0,
      totalQuestions: questionsAndAnswers.length,
      answeredQuestions: 0,
      categoryBreakdown: {},
      topStrengths: [],
      keyImprovements: [],
      overallFeedback: 'No answers to evaluate yet.',
      performanceMetrics: {
        averageResponseTime: 0,
        consistencyScore: 0,
        improvementTrend: 'stable'
      }
    }
  }

  // Calculate overall score
  const overallScore = Math.round(
    evaluations.reduce((sum, evaluation) => sum + evaluation.overallScore, 0) / evaluations.length
  )

  // Group by category
  const categoryBreakdown = {}
  questionsAndAnswers.forEach(qa => {
    const category = qa.question.category || 'General'
    if (!categoryBreakdown[category]) {
      categoryBreakdown[category] = { 
        total: 0, 
        answered: 0, 
        avgScore: 0,
        scores: []
      }
    }
    categoryBreakdown[category].total++
    if (qa.evaluation) {
      categoryBreakdown[category].answered++
      categoryBreakdown[category].scores.push(qa.evaluation.overallScore)
      categoryBreakdown[category].avgScore = 
        categoryBreakdown[category].scores.reduce((sum, score) => sum + score, 0) / 
        categoryBreakdown[category].scores.length
    }
  })

  // Collect top strengths and improvements
  const allStrengths = evaluations.flatMap(evaluation => evaluation.strengths || [])
  const allImprovements = evaluations.flatMap(evaluation => evaluation.improvements || [])

  // Get most common strengths and improvements
  const strengthCounts = {}
  const improvementCounts = {}

  allStrengths.forEach(strength => {
    strengthCounts[strength] = (strengthCounts[strength] || 0) + 1
  })

  allImprovements.forEach(improvement => {
    improvementCounts[improvement] = (improvementCounts[improvement] || 0) + 1
  })

  const topStrengths = Object.entries(strengthCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([strength]) => strength)

  const keyImprovements = Object.entries(improvementCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([improvement]) => improvement)

  // Calculate performance metrics
  const scores = evaluations.map(e => e.overallScore)
  const consistencyScore = scores.length > 1 ? 
    Math.max(0, 100 - (Math.max(...scores) - Math.min(...scores)) * 10) : 100

  // Determine improvement trend
  let improvementTrend = 'stable'
  if (scores.length >= 3) {
    const firstHalf = scores.slice(0, Math.floor(scores.length / 2))
    const secondHalf = scores.slice(Math.floor(scores.length / 2))
    const firstAvg = firstHalf.reduce((sum, score) => sum + score, 0) / firstHalf.length
    const secondAvg = secondHalf.reduce((sum, score) => sum + score, 0) / secondHalf.length
    
    if (secondAvg > firstAvg + 0.5) improvementTrend = 'improving'
    else if (secondAvg < firstAvg - 0.5) improvementTrend = 'declining'
  }

  // Generate overall feedback
  let overallFeedback = ''
  if (overallScore >= 8.5) {
    overallFeedback = 'Outstanding performance! You demonstrated exceptional interview skills with comprehensive, well-structured answers.'
  } else if (overallScore >= 7.5) {
    overallFeedback = 'Excellent performance! You showed strong interview skills and provided detailed, relevant responses.'
  } else if (overallScore >= 6.5) {
    overallFeedback = 'Good performance with solid answers. Focus on the improvement areas to enhance your interview skills further.'
  } else if (overallScore >= 5.5) {
    overallFeedback = 'Decent performance with room for improvement. Practice the suggested areas to strengthen your responses.'
  } else {
    overallFeedback = 'Keep practicing! Use the detailed feedback to improve your interview responses and build confidence.'
  }

  return {
    overallScore,
    totalQuestions: questionsAndAnswers.length,
    answeredQuestions: evaluations.length,
    categoryBreakdown,
    topStrengths,
    keyImprovements,
    overallFeedback,
    performanceMetrics: {
      consistencyScore: Math.round(consistencyScore),
      improvementTrend,
      strongestCategory: Object.entries(categoryBreakdown)
        .filter(([, data]) => data.answered > 0)
        .sort(([, a], [, b]) => b.avgScore - a.avgScore)[0]?.[0] || 'None',
      weakestCategory: Object.entries(categoryBreakdown)
        .filter(([, data]) => data.answered > 0)
        .sort(([, a], [, b]) => a.avgScore - b.avgScore)[0]?.[0] || 'None'
    },
    analysis: analysis || null
  }
}

/**
 * Generate performance analytics for multiple interview sessions
 * @param {Array} sessionResults - Array of interview session results
 * @returns {object} Performance analytics
 */
export const generatePerformanceAnalytics = (sessionResults) => {
  if (!sessionResults || sessionResults.length === 0) {
    return {
      totalSessions: 0,
      averageScore: 0,
      improvementRate: 0,
      skillsProgress: {},
      recommendations: []
    }
  }

  const totalSessions = sessionResults.length
  const scores = sessionResults.map(session => session.overallScore || 0)
  const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length

  // Calculate improvement rate
  let improvementRate = 0
  if (scores.length >= 2) {
    const firstScore = scores[0]
    const lastScore = scores[scores.length - 1]
    improvementRate = ((lastScore - firstScore) / firstScore) * 100
  }

  // Track skills progress across sessions
  const skillsProgress = {}
  sessionResults.forEach((session, index) => {
    if (session.categoryBreakdown) {
      Object.entries(session.categoryBreakdown).forEach(([category, data]) => {
        if (!skillsProgress[category]) {
          skillsProgress[category] = []
        }
        skillsProgress[category].push({
          session: index + 1,
          score: data.avgScore || 0
        })
      })
    }
  })

  // Generate recommendations based on performance
  const recommendations = []
  if (averageScore < 6) {
    recommendations.push('Focus on fundamental interview skills and practice basic question types')
  }
  if (improvementRate < 0) {
    recommendations.push('Review previous feedback and practice consistently to reverse declining trend')
  }
  if (Object.keys(skillsProgress).length > 0) {
    const weakestSkill = Object.entries(skillsProgress)
      .map(([skill, progress]) => ({
        skill,
        avgScore: progress.reduce((sum, p) => sum + p.score, 0) / progress.length
      }))
      .sort((a, b) => a.avgScore - b.avgScore)[0]
    
    if (weakestSkill) {
      recommendations.push(`Prioritize improvement in ${weakestSkill.skill} questions`)
    }
  }

  return {
    totalSessions,
    averageScore: Math.round(averageScore * 10) / 10,
    improvementRate: Math.round(improvementRate * 10) / 10,
    skillsProgress,
    recommendations
  }
}

/**
 * Generate question preview based on configuration
 * @param {object} config - Question configuration
 * @param {object} jobAnalysis - Job analysis data
 * @returns {Promise<Array>} Preview questions
 */
export const generateQuestionPreview = async (config, jobAnalysis) => {
  try {
    // In a real implementation, this would call the backend
    // For now, we'll generate mock questions based on the config
    
    const mockQuestions = [
      {
        id: 1,
        text: "Tell me about yourself and your professional background.",
        category: "behavioral",
        difficulty: config.difficulty === 'mixed' ? 'easy' : config.difficulty,
        type: "short_answer",
        estimatedTime: "2-3 minutes"
      },
      {
        id: 2,
        text: "Describe a challenging technical problem you solved recently.",
        category: "technical",
        difficulty: config.difficulty === 'mixed' ? 'medium' : config.difficulty,
        type: "detailed_explanation",
        estimatedTime: "4-5 minutes"
      },
      {
        id: 3,
        text: "How would you handle a situation where you disagree with your manager?",
        category: "situational",
        difficulty: config.difficulty === 'mixed' ? 'medium' : config.difficulty,
        type: "short_answer",
        estimatedTime: "3-4 minutes"
      }
    ]
    
    // Add company-specific question if enabled
    if (config.categories.company_specific > 0) {
      mockQuestions.push({
        id: 4,
        text: "What interests you about working at our company specifically?",
        category: "company_specific",
        difficulty: config.difficulty === 'mixed' ? 'medium' : config.difficulty,
        type: "short_answer",
        estimatedTime: "2-3 minutes"
      })
    }
    
    // Add case study if enabled
    if (config.questionTypes.case_study > 0) {
      mockQuestions.push({
        id: 5,
        text: "You're given a project with an impossible deadline. Walk me through how you would approach this situation.",
        category: "situational",
        difficulty: "hard",
        type: "case_study",
        estimatedTime: "7-8 minutes"
      })
    }
    
    return mockQuestions
  } catch (error) {
    console.error('Question preview generation error:', error)
    throw error
  }
}