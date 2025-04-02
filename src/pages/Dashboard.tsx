import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { Plus, Award, Flame } from 'lucide-react';
import toast from 'react-hot-toast';
import type { EcoAction, Streak, Badge } from '../types/database';

const COLORS = ['#22c55e', '#16a34a', '#15803d', '#166534', '#14532d'];
const ACTION_TYPES = [
  { id: 'transport', label: 'Used Public Transport', icon: '🚌' },
  { id: 'smokes', label: 'ciggerate smoked today', icon: '🚭'},
  { id: 'cardio', label: 'jogging/running', icon: '🏃'},
{ id: 'focused', label: 'study sessions today', icon: '📖'},
{ id: 'cooking', label: 'cooked food', icon: '📖'},
  
];

export default function Dashboard() {
  const [actions, setActions] = useState<EcoAction[]>([]);
  const [streak, setStreak] = useState<Streak | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Fetch actions for the current user
      const { data: actionsData, error: actionsError } = await supabase
        .from('eco_actions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (actionsError) throw actionsError;
      setActions(actionsData || []);

      // Fetch or create streak for the current user
      let { data: streakData, error: streakError } = await supabase
        .from('streaks')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (streakError && streakError.code === 'PGRST116') {
        // No streak record exists, create one
        const { data: newStreak, error: createError } = await supabase
          .from('streaks')
          .insert([{
            user_id: user.id,
            current_streak: 0,
            longest_streak: 0,
            last_action_date: null
          }])
          .select()
          .single();

        if (createError) throw createError;
        streakData = newStreak;
      } else if (streakError) {
        throw streakError;
      }

      setStreak(streakData);

      // Fetch badges for the current user
      const { data: badgesData, error: badgesError } = await supabase
        .from('badges')
        .select('*')
        .eq('user_id', user.id);

      if (badgesError) throw badgesError;
      setBadges(badgesData || []);

    } catch (error) {
      console.error('Err', error);
      toast.error('Err ');
    } finally {
      setLoading(false);
    }
  }

  const handleActionLog = async (actionType: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('eco_actions')
        .insert([{
          user_id: user.id,
          action_type: actionType,
          points: 5
        }]);

      if (error) throw error;

      toast.success('Action logged successfully!');
      fetchData();
    } catch (error) {
      console.error('Error putting', error);
      toast.error('Error put');
    }
  };

  const actionsByType = actions.reduce((acc, action) => {
    acc[action.action_type] = (acc[action.action_type] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(actionsByType).map(([name, value]) => ({
    name,
    value,
  }));

  const lineData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    return {
      date: dateStr,
      actions: actions.filter(a => a.created_at.startsWith(dateStr)).length,
    };
  }).reverse();

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center space-x-3">
            <Award className="text-green-600" size={24} />
            <h3 className="text-lg font-semibold dark:text-white">Total Points</h3>
          </div>
          <p className="text-3xl font-bold mt-2 dark:text-white">{actions.length * 5}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center space-x-3">
            <Flame className="text-green-600" size={24} />
            <h3 className="text-lg font-semibold dark:text-white">Current Streak</h3>
          </div>
          <p className="text-3xl font-bold mt-2 dark:text-white">{streak?.current_streak || 0} days</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center space-x-3">
            <Award className="text-green-600" size={24} />
            <h3 className="text-lg font-semibold dark:text-white">Badges Earned</h3>
          </div>
          <p className="text-3xl font-bold mt-2 dark:text-white">{badges.length}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">Log an Action</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {ACTION_TYPES.map((action) => (
            <button
              key={action.id}
              onClick={() => handleActionLog(action.id)}
              className="flex items-center space-x-2 p-4 rounded-lg bg-green-50 dark:bg-gray-700 hover:bg-green-100 dark:hover:bg-gray-600 transition-colors"
            >
              <span className="text-2xl">{action.icon}</span>
              <span className="dark:text-white">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Actions by Type</h3>
          <div className="flex justify-center">
            <PieChart width={300} height={300}>
              <Pie
                data={pieData}
                cx={150}
                cy={150}
                innerRadius={60}
                outerRadius={100}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Weekly Progress</h3>
          <LineChart width={500} height={300} data={lineData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="actions" stroke="#22c55e" />
          </LineChart>
        </div>
      </div>
    </div>
  );
}
