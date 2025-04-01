import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Trophy, Medal } from 'lucide-react';
import toast from 'react-hot-toast';

type LeaderboardEntry = {
  user_id: string;
  email: string;
  total_points: number;
  current_streak: number;
};

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  async function fetchLeaderboard() {
    try {
      const { data, error } = await supabase
        .from('eco_actions')
        .select(`
          user_id,
          users!inner (email),
          count(*) as total_points,
          streaks!inner (current_streak)
        `)
        .group('user_id, users.email, streaks.current_streak')
        .order('count', { ascending: false })
        .limit(10);

      if (error) throw error;

      setLeaderboard(data || []);
    } catch (error) {
      toast.error('Error fetching leaderboard');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-3">
        <Trophy className="text-green-600" size={32} />
        <h2 className="text-2xl font-bold dark:text-white">Global Leaderboard</h2>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Rank
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Points
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Current Streak
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
            {leaderboard.map((entry, index) => (
              <tr key={entry.user_id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {index < 3 ? (
                      <Medal
                        className={
                          index === 0
                            ? 'text-yellow-400'
                            : index === 1
                            ? 'text-gray-400'
                            : 'text-orange-400'
                        }
                        size={20}
                      />
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400">{index + 1}</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {entry.email}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {entry.total_points * 5}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {entry.current_streak} days
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}