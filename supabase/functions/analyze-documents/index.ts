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
    const { cvText, jobDescription } = await req.json()
    
    if (!cvText || !jobDescription) {
      return new Response(
        JSON.stringify({ error: 'Missing cvText or jobDescription' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const prompt = `You are an expert career coach and interview preparation specialist. Analyze the provided CV against the job description and provide structured feedback.

CV Content:
${cvText}

Job Description:
${jobDescription}

Please analyze the match between the CV and job requirements, then provide your response in this exact JSON format (ensure it's valid JSON):

{
  "skillsMatch": 85,
  "experienceLevel": "Mid-level",
  "experienceGaps": ["Leadership experience", "Cloud platforms", "Project management"],
  "strengths": ["Strong technical skills", "Relevant education", "Industry experience"],
  "focusAreas": ["Prepare examples of leadership", "Study AWS basics", "Practice STAR method"],
  "overallFit": "Good match with some areas for improvement",
  "confidenceLevel": "Medium-High",
  "keyRecommendations": [
    "Emphasize your technical problem-solving abilities",
    "Prepare specific examples of collaborative projects",
    "Research the company's tech stack and mention relevant experience"
  ]
}

Focus on providing actionable insights that will help the candidate prepare for their interview.`

    if (!CLAUDE_API_KEY) {
      // Return mock data if API key is not available
      const mockAnalysis = {
        skillsMatch: 82,
        experienceLevel: "Mid-level",
        experienceGaps: ["Leadership experience", "Cloud platforms"],
        strengths: ["Strong technical skills", "Relevant education", "Problem-solving abilities"],
        focusAreas: ["Prepare leadership examples", "Study cloud technologies", "Practice behavioral questions"],
        overallFit: "Good match with room for growth",
        confidenceLevel: "Medium-High",
        keyRecommendations: [
          "Emphasize your technical problem-solving abilities",
          "Prepare specific examples of collaborative projects",
          "Research the company's tech stack thoroughly"
        ]
      }
      
      return new Response(JSON.stringify(mockAnalysis), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const data = await callClaudeAPI(prompt, 1500)

    let analysis
    try {
      analysis = JSON.parse(data.content[0].text)
    } catch (parseError) {
      console.error('Failed to parse Claude response as JSON:', data.content[0].text)
      throw new Error('Failed to parse analysis results')
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in analyze-documents function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: 'Failed to analyze documents. Please try again.'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})