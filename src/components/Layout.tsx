import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Leaf, LayoutDashboard, Trophy, UserCircle, LogOut, Bus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface LayoutProps {
  children: React.ReactNode;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

export default function Layout({ children, darkMode, setDarkMode }: LayoutProps) {
  const location = useLocation();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Error signing out');
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className={`w-64 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <div className="p-4">
          <div className="flex items-center space-x-2 mb-8">
            <Leaf className="text-green-600" size={32} />
            <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              EcoHabit Tracker
            </h1>
          </div>
          
          <nav className="space-y-2">
            <Link
              to="/dashboard"
              className={`flex items-center space-x-2 p-3 rounded-lg transition-colors ${
                isActive('/dashboard')
                  ? 'bg-green-600 text-white'
                  : `${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`
              }`}
            >
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </Link>
            
            <Link
              to="/leaderboard"
              className={`flex items-center space-x-2 p-3 rounded-lg transition-colors ${
                isActive('/leaderboard')
                  ? 'bg-green-600 text-white'
                  : `${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`
              }`}
            >
              <Trophy size={20} />
              <span>Leaderboard</span>
            </Link>
            
            <Link
              to="/profile"
              className={`flex items-center space-x-2 p-3 rounded-lg transition-colors ${
                isActive('/profile')
                  ? 'bg-green-600 text-white'
                  : `${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`
              }`}
            >
              <UserCircle size={20} />
              <span>Profile</span>
            </Link>
            
            <Link
              to="/commute-planning"
              className={`flex items-center space-x-2 p-3 rounded-lg transition-colors ${
                isActive('/commute-planning')
                  ? 'bg-green-600 text-white'
                  : `${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`
              }`}
            >
              <Bus size={20} />
              <span>Commute Planning</span>
            </Link>
          </nav>
        </div>

        <div className="absolute bottom-0 w-64 p-4">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`w-full flex items-center justify-center space-x-2 p-3 rounded-lg mb-2 ${
              darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            <span>{darkMode ? '🌞' : '🌙'}</span>
            <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center space-x-2 p-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </div>
    </div>
  );
}