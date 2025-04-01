import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Award, Medal, User } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Badge } from '../types/database';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalPoints: 0,
    totalActions: 0,
    currentStreak: 0,
    longestStreak: 0,
  });
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      const { data: actionsData, error: actionsError } = await supabase
        .from('eco_actions')
        .select('*')
        .eq('user_id', user.id);

      const { data: streakData, error: streakError } = await supabase
        .from('streaks')
        .select('*')
        .eq('user_id', user.id)
        .single();

      const { data: badgesData, error: badgesError } = await supabase
        .from('badges')
        .select('*')
        .eq('user_id', user.id);

      if (actionsError) throw actionsError;
      if (streakError) throw streakError;
      if (badgesError) throw badgesError;

      setStats({
        totalPoints: (actionsData?.length || 0) * 5,
        totalActions: actionsData?.length || 0,
        currentStreak: streakData?.current_streak || 0,
        longestStreak: streakData?.longest_streak || 0,
      });

      setBadges(badgesData || []);
    } catch (error) {
      toast.error('Error fetching profile');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="flex items-center space-x-4">
          <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
            <User className="text-green-600 dark:text-green-400" size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold dark:text-white">{user?.email}</h2>
            <p className="text-gray-600 dark:text-gray-400">Member since {new Date(user?.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2 dark:text-white">Total Points</h3>
          <p className="text-3xl font-bold text-green-600">{stats.totalPoints}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2 dark:text-white">Actions Completed</h3>
          <p className="text-3xl font-bold text-green-600">{stats.totalActions}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2 dark:text-white">Current Streak</h3>
          <p className="text-3xl font-bold text-green-600">{stats.currentStreak} days</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2 dark:text-white">Longest Streak</h3>
          <p className="text-3xl font-bold text-green-600">{stats.longestStreak} days</p>
        </div>
      </div>

      {/* Badges */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="flex items-center space-x-3 mb-6">
          <Award className="text-green-600" size={24} />
          <h3 className="text-lg font-semibold dark:text-white">Earned Badges</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className="flex items-center space-x-3 p-4 bg-green-50 dark:bg-gray-700 rounded-lg"
            >
              <Medal className="text-green-600 dark:text-green-400" size={24} />
              <div>
                <p className="font-semibold dark:text-white">
                  {badge.badge_type.split('_').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Earned {new Date(badge.earned_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}