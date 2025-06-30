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
    const { cvText, jobDescription, analysis } = await req.json()
    
    if (!cvText || !jobDescription) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const prompt = `You are an expert interview coach. Based on the CV, job description, and analysis provided, generate 8-10 personalized interview questions that will help the candidate prepare effectively.

CV Summary:
${cvText.substring(0, 1000)}...

Job Description:
${jobDescription}

Analysis Results:
${JSON.stringify(analysis)}

Generate interview questions that:
1. Address the candidate's experience gaps identified in the analysis
2. Leverage their strengths
3. Are appropriate for the role and experience level
4. Include a mix of technical, behavioral, and situational questions
5. Help the candidate demonstrate their fit for the position

Provide your response in this exact JSON format:

{
  "questions": [
    {
      "id": 1,
      "category": "Technical",
      "question": "Can you walk me through your experience with [specific technology mentioned in job description]?",
      "focusArea": "Address technical skill requirements",
      "difficulty": "medium",
      "tips": "Use the STAR method and provide specific examples"
    },
    {
      "id": 2,
      "category": "Behavioral",
      "question": "Tell me about a time when you had to work with a difficult team member. How did you handle it?",
      "focusArea": "Demonstrate interpersonal skills",
      "difficulty": "medium",
      "tips": "Focus on your problem-solving approach and positive outcome"
    }
  ],
  "totalQuestions": 8,
  "estimatedDuration": "45-60 minutes",
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
        questions: [
          {
            id: 1,
            category: "Introduction",
            question: "Tell me about yourself and why you're interested in this position.",
            focusArea: "Personal branding and motivation",
            difficulty: "easy",
            tips: "Keep it concise, focus on relevant experience, and connect to the role"
          },
          {
            id: 2,
            category: "Technical",
            question: "Describe your experience with the technologies mentioned in the job description.",
            focusArea: "Technical competency assessment",
            difficulty: "medium",
            tips: "Provide specific examples and mention any recent projects"
          },
          {
            id: 3,
            category: "Behavioral",
            question: "Tell me about a challenging project you worked on and how you overcame obstacles.",
            focusArea: "Problem-solving and resilience",
            difficulty: "medium",
            tips: "Use the STAR method: Situation, Task, Action, Result"
          },
          {
            id: 4,
            category: "Experience",
            question: "How do you handle working under pressure and tight deadlines?",
            focusArea: "Stress management and time management",
            difficulty: "medium",
            tips: "Provide concrete examples and mention specific strategies you use"
          },
          {
            id: 5,
            category: "Behavioral",
            question: "Describe a time when you had to learn a new technology or skill quickly.",
            focusArea: "Adaptability and learning ability",
            difficulty: "medium",
            tips: "Highlight your learning process and how you applied the new skill"
          },
          {
            id: 6,
            category: "Leadership",
            question: "Tell me about a time when you had to work with a difficult team member.",
            focusArea: "Interpersonal skills and conflict resolution",
            difficulty: "medium",
            tips: "Focus on your approach to communication and problem-solving"
          },
          {
            id: 7,
            category: "Career",
            question: "Where do you see yourself in 5 years?",
            focusArea: "Career goals and ambition",
            difficulty: "easy",
            tips: "Align your goals with the company's growth opportunities"
          },
          {
            id: 8,
            category: "Company",
            question: "What questions do you have for us about the role or company?",
            focusArea: "Engagement and research",
            difficulty: "easy",
            tips: "Prepare thoughtful questions that show you've researched the company"
          }
        ],
        totalQuestions: 8,
        estimatedDuration: "45-60 minutes",
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
    console.error('Error in generate-questions function:', error)
    
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