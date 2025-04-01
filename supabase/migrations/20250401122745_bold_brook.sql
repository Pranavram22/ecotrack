/*
  # Initial Schema Setup for EcoHabit Tracker

  1. New Tables
    - eco_actions: Stores user's eco-friendly actions
    - streaks: Tracks user streaks
    - badges: Stores user badges
    
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create eco_actions table
CREATE TABLE IF NOT EXISTS eco_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type text NOT NULL,
  points integer NOT NULL DEFAULT 5,
  created_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_action_type CHECK (
    action_type IN (
      'transport',
      'plastic_free',
      'plant_based_meal',
      'reusable_items',
      'energy_water_saving',
      'eco_event'
    )
  )
);

-- Create streaks table
CREATE TABLE IF NOT EXISTS streaks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  last_action_date date,
  created_at timestamptz DEFAULT now()
);

-- Create badges table
CREATE TABLE IF NOT EXISTS badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_type text NOT NULL,
  earned_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_badge_type CHECK (
    badge_type IN (
      'green_starter',
      'eco_streaker',
      'sustainability_hero'
    )
  ),
  UNIQUE(user_id, badge_type)
);

-- Enable Row Level Security
ALTER TABLE eco_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

-- Policies for eco_actions
CREATE POLICY "Users can insert their own actions"
  ON eco_actions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own actions"
  ON eco_actions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for streaks
CREATE POLICY "Users can view their own streaks"
  ON streaks
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own streaks"
  ON streaks
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for badges
CREATE POLICY "Users can view their own badges"
  ON badges
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own badges"
  ON badges
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);