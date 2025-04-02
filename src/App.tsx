import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { supabase } from './lib/supabase';
import AuthForm from './components/AuthForm';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import CommutePlanning from './pages/CommutePlanning';

function App() {
  const [session, setSession] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session as any);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session as null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
        <BrowserRouter>
          {!session ? (
            <div className="container mx-auto px-4 py-8">
              <AuthForm />
            </div>
          ) : (
            <Layout darkMode={darkMode} setDarkMode={setDarkMode}>
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/commute-planning" element={<CommutePlanning />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Layout>
          )}
        </BrowserRouter>
        <Toaster position="top-right" />
      </div>
    </div>
  );
}

export default App;