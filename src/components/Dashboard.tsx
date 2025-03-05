import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Leaf, Activity, Battery, Gauge } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface EnergyMetric {
  current: number;
  voltage: number;
  power: number;
  energy: number;
  timestamp: string;
}

const MetricCard = ({ title, value, unit, icon: Icon }) => (
  <div className="bg-gray-800 rounded-lg p-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-gray-400 text-sm">{title}</h3>
      <Icon className="text-green-400 w-5 h-5" />
    </div>
    <p className="text-3xl font-bold text-white">
      {value}
      <span className="text-gray-400 text-sm ml-1">{unit}</span>
    </p>
  </div>
);

export function Dashboard({ onSignOut }) {
  const [metrics, setMetrics] = useState<EnergyMetric | null>(null);
  const [historicalData, setHistoricalData] = useState([]);

  useEffect(() => {
    const fetchLatestMetrics = async () => {
      const { data, error } = await supabase
        .from('energy_metrics')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching metrics:', error);
        return;
      }

      setMetrics(data);
    };

    const fetchHistoricalData = async () => {
      const { data, error } = await supabase
        .from('energy_metrics')
        .select('power, timestamp')
        .order('timestamp', { ascending: true })
        .limit(24);

      if (error) {
        console.error('Error fetching historical data:', error);
        return;
      }

      setHistoricalData(data.map(d => ({
        time: new Date(d.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        usage: d.power
      })));
    };

    fetchLatestMetrics();
    fetchHistoricalData();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('energy_metrics')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'energy_metrics'
      }, payload => {
        setMetrics(payload.new as EnergyMetric);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <nav className="flex justify-between items-center mb-8">
        <div className="flex items-center">
          <Leaf className="w-8 h-8 text-green-400" />
          <h1 className="text-2xl font-bold text-white ml-2">EcoTrack</h1>
        </div>
        <button
          onClick={onSignOut}
          className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-700"
        >
          Sign Out
        </button>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard 
          title="Current" 
          value={metrics?.current?.toFixed(1) || '0.0'} 
          unit="A" 
          icon={Activity} 
        />
        <MetricCard 
          title="Voltage" 
          value={metrics?.voltage?.toFixed(0) || '0'} 
          unit="V" 
          icon={Activity} 
        />
        <MetricCard 
          title="Power" 
          value={metrics?.power?.toFixed(2) || '0.00'} 
          unit="kW" 
          icon={Gauge} 
        />
        <MetricCard 
          title="Energy" 
          value={metrics?.energy?.toFixed(2) || '0.00'} 
          unit="kWh" 
          icon={Battery} 
        />
      </div>

      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-white mb-6">Live Energy Metrics</h2>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={historicalData}>
              <defs>
                <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4ADE80" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#4ADE80" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: 'none',
                  borderRadius: '0.5rem',
                  color: '#fff',
                }}
              />
              <Area
                type="monotone"
                dataKey="usage"
                stroke="#4ADE80"
                fillOpacity={1}
                fill="url(#colorUsage)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}