-- Create subscription tables

-- User subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text NOT NULL,
  status text NOT NULL,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Usage tracking table
CREATE TABLE IF NOT EXISTS usage_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  questions_used integer DEFAULT 0,
  feature_type text DEFAULT 'question',
  created_at timestamptz DEFAULT now()
);

-- Subscription plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text,
  price numeric NOT NULL,
  interval text,
  features jsonb DEFAULT '[]'::jsonb,
  stripe_price_id text,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Subscription events table for analytics
CREATE TABLE IF NOT EXISTS subscription_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  stripe_event_id text,
  amount numeric DEFAULT 0,
  plan text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_events ENABLE ROW LEVEL SECURITY;

-- Create policies for user_subscriptions
CREATE POLICY "Users can view their own subscriptions"
  ON user_subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for usage_tracking
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

-- Create policies for subscription_plans
CREATE POLICY "Anyone can view active subscription plans"
  ON subscription_plans
  FOR SELECT
  TO anon, authenticated
  USING (active = true);

-- Create policies for subscription_events
CREATE POLICY "Users can view their own subscription events"
  ON subscription_events
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id ON usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_created_at ON usage_tracking(created_at);
CREATE INDEX IF NOT EXISTS idx_subscription_events_user_id ON subscription_events(user_id);

-- Insert default subscription plans
INSERT INTO subscription_plans (id, name, description, price, interval, features, stripe_price_id)
VALUES
  ('free', 'Free', 'Basic features with limited usage', 0, NULL, 
   '["5 interview questions per month", "Basic AI feedback", "Text-only interface", "Limited question types"]'::jsonb,
   NULL),
  ('premium_monthly', 'Premium Monthly', 'Full access with monthly billing', 19.99, 'month', 
   '["Unlimited interview questions", "Advanced AI feedback", "Voice mode with 6 AI voices", "Detailed analytics", "Custom interview configurations", "Full interview history", "Priority support"]'::jsonb,
   'price_monthly'),
  ('premium_yearly', 'Premium Yearly', 'Full access with annual billing (save 17%)', 199.99, 'year', 
   '["All Premium Monthly features", "Save 17% compared to monthly", "Early access to new features", "Downloadable interview reports", "Interview readiness score"]'::jsonb,
   'price_yearly')
ON CONFLICT (id) DO NOTHING;