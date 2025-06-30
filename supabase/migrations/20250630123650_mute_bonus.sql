/*
  # Create subscription tables

  1. New Tables
    - `subscription_plans`
      - `id` (text, primary key)
      - `name` (text)
      - `description` (text)
      - `price` (numeric)
      - `interval` (text)
      - `features` (jsonb)
      - `stripe_price_id` (text)
      - `active` (boolean)
      - `created_at` (timestamp with time zone)
      - `updated_at` (timestamp with time zone)
    - `user_subscriptions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `stripe_customer_id` (text)
      - `stripe_subscription_id` (text)
      - `plan` (text)
      - `status` (text)
      - `current_period_start` (timestamp with time zone)
      - `current_period_end` (timestamp with time zone)
      - `cancel_at_period_end` (boolean)
      - `created_at` (timestamp with time zone)
      - `updated_at` (timestamp with time zone)
    - `usage_tracking`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `questions_used` (integer)
      - `feature_type` (text)
      - `created_at` (timestamp with time zone)
    - `subscription_events`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `type` (text)
      - `stripe_event_id` (text)
      - `amount` (numeric)
      - `plan` (text)
      - `created_at` (timestamp with time zone)
  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for each table
*/

-- Create subscription_plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  interval TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  stripe_price_id TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT NOT NULL,
  status TEXT NOT NULL,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create usage_tracking table
CREATE TABLE IF NOT EXISTS usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  questions_used INTEGER DEFAULT 0,
  feature_type TEXT DEFAULT 'question',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create subscription_events table
CREATE TABLE IF NOT EXISTS subscription_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  stripe_event_id TEXT,
  amount NUMERIC DEFAULT 0,
  plan TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id ON usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_created_at ON usage_tracking(created_at);
CREATE INDEX IF NOT EXISTS idx_subscription_events_user_id ON subscription_events(user_id);

-- Enable Row Level Security
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- subscription_plans policies
CREATE POLICY "Anyone can view active subscription plans" 
  ON subscription_plans 
  FOR SELECT 
  TO anon, authenticated 
  USING (active = true);

-- user_subscriptions policies
CREATE POLICY "Users can view their own subscriptions" 
  ON user_subscriptions 
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id);

-- usage_tracking policies
CREATE POLICY "Users can view their own usage" 
  ON usage_tracking 
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage" 
  ON usage_tracking 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

-- subscription_events policies
CREATE POLICY "Users can view their own subscription events" 
  ON subscription_events 
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id);

-- Insert default subscription plans
INSERT INTO subscription_plans (id, name, description, price, interval, features, stripe_price_id, active)
VALUES
  ('free', 'Free', 'Basic features with limited usage', 0, NULL, 
   '["5 interview questions per month", "Basic AI feedback", "Text-only interface", "Limited question types"]'::jsonb, 
   NULL, true),
  
  ('premium_monthly', 'Premium Monthly', 'Full access with monthly billing', 19.99, 'month', 
   '["Unlimited interview questions", "Advanced AI feedback", "Voice mode with 6 AI voices", "Detailed analytics", "Custom interview configurations", "Full interview history", "Priority support"]'::jsonb, 
   'price_monthly', true),
  
  ('premium_yearly', 'Premium Yearly', 'Full access with annual billing (save 17%)', 199.99, 'year', 
   '["All Premium Monthly features", "Save 17% compared to monthly", "Early access to new features", "Downloadable interview reports", "Interview readiness score"]'::jsonb, 
   'price_yearly', true)
ON CONFLICT (id) DO NOTHING;