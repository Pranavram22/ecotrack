export type User = {
  id: string;
  email: string;
  created_at: string;
};

export type EcoAction = {
  id: string;
  user_id: string;
  action_type: string;
  points: number;
  created_at: string;
};

export type Streak = {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_action_date: string;
};

export type Badge = {
  id: string;
  user_id: string;
  badge_type: string;
  earned_at: string;
};