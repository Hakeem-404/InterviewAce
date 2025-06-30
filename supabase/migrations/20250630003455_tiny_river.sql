/*
  # Create interview_sessions table

  1. New Tables
    - `interview_sessions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `job_title` (text)
      - `company_name` (text)
      - `session_type` (text) - 'practice', 'mock', 'quick'
      - `questions_data` (jsonb) - array of questions
      - `responses_data` (jsonb) - array of user responses
      - `analysis_results` (jsonb) - detailed analysis data
      - `overall_score` (float) - overall performance score
      - `confidence_score` (float) - confidence level score
      - `technical_score` (float) - technical skills score
      - `behavioral_score` (float) - behavioral questions score
      - `communication_score` (float) - communication skills score
      - `session_duration` (integer) - duration in seconds
      - `voice_enabled` (boolean) - whether voice mode was used
      - `cv_data` (text) - CV/resume content
      - `job_description` (text) - job description used
      - `feedback_summary` (text) - AI-generated feedback summary
      - `improvement_areas` (jsonb) - areas for improvement
      - `strengths_identified` (jsonb) - identified strengths
      - `created_at` (timestamptz) - creation timestamp

  2. Security
    - Enable RLS on `interview_sessions` table
    - Add policies for authenticated users to manage their own sessions
    - Users can only access their own interview session data
*/

-- Create the interview_sessions table
CREATE TABLE IF NOT EXISTS interview_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  job_title text,
  company_name text,
  session_type text DEFAULT 'practice',
  questions_data jsonb DEFAULT '[]'::jsonb,
  responses_data jsonb DEFAULT '[]'::jsonb,
  analysis_results jsonb DEFAULT '{}'::jsonb,
  overall_score float DEFAULT 0,
  confidence_score float DEFAULT 0,
  technical_score float DEFAULT 0,
  behavioral_score float DEFAULT 0,
  communication_score float DEFAULT 0,
  session_duration integer DEFAULT 0,
  voice_enabled boolean DEFAULT false,
  cv_data text,
  job_description text,
  feedback_summary text,
  improvement_areas jsonb DEFAULT '[]'::jsonb,
  strengths_identified jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE interview_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for interview_sessions
CREATE POLICY "Users can view their own interview sessions"
  ON interview_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own interview sessions"
  ON interview_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own interview sessions"
  ON interview_sessions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own interview sessions"
  ON interview_sessions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_interview_sessions_user_id ON interview_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_created_at ON interview_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_user_created ON interview_sessions(user_id, created_at DESC);