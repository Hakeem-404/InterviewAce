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
    const { question, answer, questionContext } = await req.json()
    
    if (!question || !answer) {
      return new Response(
        JSON.stringify({ error: 'Missing question or answer' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const prompt = `You are an expert interview coach evaluating a candidate's answer. Provide constructive feedback that will help them improve.

Interview Question:
${question}

Question Context:
Category: ${questionContext?.category || 'General'}
Focus Area: ${questionContext?.focusArea || 'General assessment'}
Difficulty: ${questionContext?.difficulty || 'medium'}

Candidate's Answer:
${answer}

Please evaluate this answer and provide feedback in this exact JSON format:

{
  "score": 75,
  "strengths": [
    "Clear structure and logical flow",
    "Provided specific examples",
    "Demonstrated relevant skills"
  ],
  "improvements": [
    "Could have been more specific about the outcome",
    "Missing quantifiable results",
    "Could elaborate on lessons learned"
  ],
  "overallFeedback": "Good answer that demonstrates relevant experience. The response shows understanding of the question and provides concrete examples. To improve, consider adding more specific metrics and outcomes.",
  "suggestedRevision": "Consider restructuring your answer using the STAR method: Situation, Task, Action, Result. This will help you provide more comprehensive and impactful responses.",
  "keyTakeaways": [
    "Use the STAR method for behavioral questions",
    "Include quantifiable results when possible",
    "Connect your experience directly to the role requirements"
  ]
}

Be constructive and encouraging while providing specific, actionable feedback.`

    if (!CLAUDE_API_KEY) {
      // Return mock evaluation if API key is not available
      const mockEvaluation = {
        score: 78,
        strengths: [
          "Clear communication and structure",
          "Relevant examples provided",
          "Shows understanding of the question"
        ],
        improvements: [
          "Could include more specific metrics",
          "Consider using the STAR method",
          "Elaborate on the final outcome"
        ],
        overallFeedback: "Good response that demonstrates relevant experience and skills. Your answer shows you understand what the interviewer is looking for. To make it even stronger, consider adding more specific details about the results you achieved.",
        suggestedRevision: "Try restructuring your answer using the STAR method (Situation, Task, Action, Result) to make it more comprehensive and impactful.",
        keyTakeaways: [
          "Use specific examples with measurable outcomes",
          "Structure answers using the STAR method",
          "Connect your experience to the role requirements"
        ]
      }
      
      return new Response(JSON.stringify(mockEvaluation), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const data = await callClaudeAPI(prompt, 1000)

    let evaluation
    try {
      evaluation = JSON.parse(data.content[0].text)
    } catch (parseError) {
      console.error('Failed to parse Claude response as JSON:', data.content[0].text)
      throw new Error('Failed to parse evaluation results')
    }

    return new Response(JSON.stringify(evaluation), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in evaluate-answer function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: 'Failed to evaluate answer. Please try again.'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})