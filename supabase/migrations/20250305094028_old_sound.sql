/*
  # Energy Monitoring System Schema

  1. New Tables
    - `energy_metrics`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `current` (numeric, amperes)
      - `voltage` (numeric, volts)
      - `power` (numeric, kilowatts)
      - `energy` (numeric, kilowatt hours)
      - `timestamp` (timestamptz)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `energy_metrics` table
    - Add policies for authenticated users to:
      - Read their own metrics
      - Insert their own metrics
*/

CREATE TABLE IF NOT EXISTS energy_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  current numeric NOT NULL,
  voltage numeric NOT NULL,
  power numeric NOT NULL,
  energy numeric NOT NULL,
  timestamp timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE energy_metrics ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can read their own metrics"
  ON energy_metrics
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own metrics"
  ON energy_metrics
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS energy_metrics_user_id_idx ON energy_metrics(user_id);
CREATE INDEX IF NOT EXISTS energy_metrics_timestamp_idx ON energy_metrics(timestamp);