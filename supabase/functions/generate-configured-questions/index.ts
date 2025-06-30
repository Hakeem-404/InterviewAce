import { corsHeaders } from "../_shared/cors.ts"
import { callClaudeAPI } from "../_shared/apiUtils.ts"

const CLAUDE_API_KEY = Deno.env.get('CLAUDE_API_KEY')

if (!CLAUDE_API_KEY) {
  console.error('CLAUDE_API_KEY environment variable is not set')
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { cvText, jobDescription, analysis, configuration } = await req.json()
    
    if (!cvText || !jobDescription) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Validate configuration
    if (!configuration) {
      return new Response(
        JSON.stringify({ error: 'Missing configuration' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const prompt = `You are an expert interview coach. Based on the CV, job description, analysis, and configuration provided, generate personalized interview questions that match the specified parameters.

CV Summary:
${cvText.substring(0, 1000)}...

Job Description:
${jobDescription}

Analysis Results:
${JSON.stringify(analysis)}

Configuration:
${JSON.stringify(configuration)}

Generate exactly ${configuration.totalQuestions} interview questions that:
1. Follow the category distribution: ${JSON.stringify(configuration.categories)}
2. Match the specified difficulty level: ${configuration.difficulty}
3. Include the specified question types: ${JSON.stringify(configuration.questionTypes)}
4. Address the candidate's experience gaps identified in the analysis
5. Leverage their strengths
6. Are appropriate for the role and experience level

${configuration.industrySpecific ? "Include industry-specific terminology and current trends." : ""}
${configuration.includeFollowUps ? "Include potential follow-up questions for each main question." : ""}

Provide your response in this exact JSON format:

{
  "questions": [
    {
      "id": 1,
      "category": "technical",
      "question": "Can you walk me through your experience with [specific technology mentioned in job description]?",
      "focusArea": "Address technical skill requirements",
      "difficulty": "medium",
      "type": "detailed_explanation",
      "tips": "Use the STAR method and provide specific examples",
      "followUpQuestions": ["What challenges did you face?", "How did you overcome them?"]
    }
  ],
  "totalQuestions": ${configuration.totalQuestions},
  "estimatedDuration": "${configuration.timeLimit} minutes",
  "preparationTips": [
    "Research the company's recent projects and initiatives",
    "Prepare specific examples using the STAR method",
    "Practice explaining technical concepts in simple terms"
  ]
}

Make sure each question is relevant to both the job requirements and the candidate's background.`

    if (!CLAUDE_API_KEY) {
      // Return mock questions if API key is not available
      const mockQuestions = {
        questions: generateMockQuestions(configuration),
        totalQuestions: configuration.totalQuestions,
        estimatedDuration: `${configuration.timeLimit} minutes`,
        preparationTips: [
          "Research the company's recent projects and initiatives",
          "Prepare specific examples using the STAR method",
          "Practice explaining technical concepts in simple terms",
          "Review your CV and be ready to discuss any point in detail"
        ]
      }
      
      return new Response(JSON.stringify(mockQuestions), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const data = await callClaudeAPI(prompt, 2500)

    let questions
    try {
      questions = JSON.parse(data.content[0].text)
    } catch (parseError) {
      console.error('Failed to parse Claude response as JSON:', data.content[0].text)
      throw new Error('Failed to parse question generation results')
    }

    return new Response(JSON.stringify(questions), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in generate-configured-questions function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: 'Failed to generate questions. Please try again.'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

// Helper function to generate mock questions based on configuration
function generateMockQuestions(configuration) {
  const questions = []
  const categories = Object.entries(configuration.categories)
  const questionTypes = Object.entries(configuration.questionTypes)
  const difficulties = configuration.difficulty === 'mixed' 
    ? ['easy', 'medium', 'hard'] 
    : [configuration.difficulty]
  
  // Calculate number of questions per category
  const categoryQuestions = {}
  categories.forEach(([category, percentage]) => {
    categoryQuestions[category] = Math.round((configuration.totalQuestions * Number(percentage)) / 100)
  })
  
  // Adjust to ensure we have exactly the requested number of questions
  const totalCalculated = Object.values(categoryQuestions).reduce((sum: number, count: number) => sum + count, 0)
  if (totalCalculated !== configuration.totalQuestions) {
    const diff = configuration.totalQuestions - totalCalculated
    const largestCategory = categories.sort(([,a], [,b]) => Number(b) - Number(a))[0][0]
    categoryQuestions[largestCategory] += diff
  }
  
  // Generate questions for each category
  let questionId = 1
  Object.entries(categoryQuestions).forEach(([category, count]) => {
    for (let i = 0; i < count; i++) {
      const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)]
      const typeEntry = questionTypes[Math.floor(Math.random() * questionTypes.length)]
      const type = typeEntry[0]
      
      const question = {
        id: questionId++,
        category,
        question: getQuestionForCategory(category, difficulty),
        focusArea: getFocusAreaForCategory(category),
        difficulty,
        type,
        tips: getTipsForCategory(category, type)
      }
      
      if (configuration.includeFollowUps) {
        question.followUpQuestions = getFollowUpQuestions(category, difficulty)
      }
      
      questions.push(question)
    }
  })
  
  return questions
}

function getQuestionForCategory(category, difficulty) {
  const questions = {
    technical: {
      easy: "Can you explain your experience with basic programming concepts?",
      medium: "Describe a challenging technical problem you've solved recently.",
      hard: "How would you design a scalable system for processing millions of transactions per day?"
    },
    behavioral: {
      easy: "Tell me about yourself and your background.",
      medium: "Describe a situation where you had to work under pressure to meet a deadline.",
      hard: "Tell me about a time when you had to make a difficult decision with limited information."
    },
    situational: {
      easy: "How would you handle a disagreement with a coworker?",
      medium: "What would you do if you were assigned a project with an impossible deadline?",
      hard: "How would you approach a situation where you need to implement a major change that faces resistance?"
    },
    company_specific: {
      easy: "What interests you about our company?",
      medium: "How do you see yourself contributing to our company culture?",
      hard: "How would you implement our company values in your daily work?"
    }
  }
  
  return questions[category]?.[difficulty] || "Tell me about your relevant experience for this role."
}

function getFocusAreaForCategory(category) {
  const focusAreas = {
    technical: "Technical skills assessment",
    behavioral: "Past experience and soft skills",
    situational: "Problem-solving and adaptability",
    company_specific: "Cultural fit and company knowledge"
  }
  
  return focusAreas[category] || "General assessment"
}

function getTipsForCategory(category, type) {
  const tips = {
    technical: "Provide specific examples and explain your thought process",
    behavioral: "Use the STAR method: Situation, Task, Action, Result",
    situational: "Focus on your approach and reasoning, not just the outcome",
    company_specific: "Show you've researched the company and understand its values"
  }
  
  return tips[category] || "Be concise and specific with your answer"
}

function getFollowUpQuestions(category, difficulty) {
  const followUps = {
    technical: [
      "What challenges did you face?",
      "How did you overcome technical obstacles?",
      "What would you do differently next time?"
    ],
    behavioral: [
      "What was the outcome?",
      "What did you learn from this experience?",
      "How did this experience change your approach?"
    ],
    situational: [
      "Why would you take that approach?",
      "What alternatives did you consider?",
      "How would you measure success?"
    ],
    company_specific: [
      "Why is that important to you?",
      "How does that align with your career goals?",
      "What specific aspects of our company culture appeal to you?"
    ]
  }
  
  // Return 1-2 follow-up questions based on difficulty
  const count = difficulty === 'easy' ? 1 : 2
  const options = followUps[category] || followUps.behavioral
  return options.slice(0, count)
}