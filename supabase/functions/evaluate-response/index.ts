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
    const { question, answer, cvContext, questionCategory, questionContext } = await req.json()
    
    if (!question || !answer) {
      return new Response(
        JSON.stringify({ error: 'Missing question or answer' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const prompt = `You are an expert interview coach and HR professional. Evaluate this interview response and provide detailed, constructive feedback.

Interview Question: ${question}
Question Category: ${questionCategory || 'General'}
Question Context: ${JSON.stringify(questionContext || {})}
Candidate's Answer: ${answer}
CV Context: ${cvContext || 'Not provided'}

Provide a comprehensive analysis in this exact JSON format:

{
  "overallScore": 8.5,
  "scores": {
    "relevance": 9,
    "completeness": 8,
    "clarity": 8,
    "structure": 7,
    "examples": 9,
    "confidence": 8
  },
  "strengths": [
    "Provided specific example with quantifiable results",
    "Clear STAR method structure",
    "Demonstrated relevant technical skills"
  ],
  "improvements": [
    "Could have mentioned team collaboration aspect",
    "Add more detail about lessons learned",
    "Consider discussing alternative approaches"
  ],
  "feedback": "Strong response that demonstrates relevant experience and provides concrete examples. The answer shows good understanding of the question and uses the STAR method effectively. To improve, consider expanding on the collaborative aspects and lessons learned from the experience.",
  "suggestedAnswer": "A more comprehensive answer might include: 'In addition to the technical solution I implemented, I also worked closely with the design team to ensure user experience wasn't compromised. This taught me the importance of cross-functional collaboration in delivering successful projects.'",
  "keywordAnalysis": {
    "used": ["leadership", "project management", "results", "problem-solving"],
    "missing": ["teamwork", "communication", "stakeholder management"],
    "industrySpecific": ["agile", "scrum", "technical debt"]
  },
  "detailedAnalysis": {
    "communicationStyle": "Clear and professional",
    "storytelling": "Good use of narrative structure",
    "technicalDepth": "Appropriate level of detail",
    "businessImpact": "Well articulated"
  },
  "nextSteps": [
    "Practice incorporating more collaborative examples",
    "Prepare metrics for similar scenarios",
    "Research industry-specific terminology"
  ]
}

Focus on providing actionable, specific feedback that will help the candidate improve their interview performance. Be encouraging while highlighting areas for growth.`

    if (!CLAUDE_API_KEY) {
      // Return mock evaluation if API key is not available
      const mockEvaluation = {
        overallScore: 78,
        scores: {
          relevance: 8,
          completeness: 7,
          clarity: 8,
          structure: 7,
          examples: 8,
          confidence: 8
        },
        strengths: [
          "Clear communication and structure",
          "Relevant examples provided",
          "Shows understanding of the question",
          "Professional tone throughout"
        ],
        improvements: [
          "Could include more specific metrics",
          "Consider using the STAR method more explicitly",
          "Elaborate on the final outcome and impact",
          "Add more details about challenges faced"
        ],
        feedback: "Good response that demonstrates relevant experience and skills. Your answer shows you understand what the interviewer is looking for and you provide concrete examples. To make it even stronger, consider adding more specific details about the results you achieved and any challenges you overcame.",
        suggestedAnswer: "Try restructuring your answer using the STAR method (Situation, Task, Action, Result) to make it more comprehensive and impactful. For example: 'In my previous role (Situation), I was tasked with... (Task), so I implemented... (Action), which resulted in... (Result).'",
        keywordAnalysis: {
          used: ["experience", "project", "team", "results"],
          missing: ["leadership", "collaboration", "problem-solving", "innovation"],
          industrySpecific: ["agile", "stakeholder", "metrics", "optimization"]
        },
        detailedAnalysis: {
          communicationStyle: "Clear and professional",
          storytelling: "Good narrative flow",
          technicalDepth: "Appropriate for the role",
          businessImpact: "Could be more specific"
        },
        nextSteps: [
          "Practice quantifying achievements with specific numbers",
          "Prepare examples that highlight leadership and collaboration",
          "Research industry-specific terminology for your field"
        ]
      }
      
      return new Response(JSON.stringify(mockEvaluation), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const data = await callClaudeAPI(prompt, 2500)

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
    console.error('Error in evaluate-response function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: 'Failed to evaluate response. Please try again.'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})