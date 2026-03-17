// File: src/frontend/src/components/SystemHealth.tsx
import React, { useState, useEffect } from 'react';
import { BarChart2 } from 'lucide-react';
import { fetchSystemStatus } from '../services/api';

const SystemHealth = () => {
  const [healthData, setHealthData] = useState({
    systemOnline: 99.9,
    activePumps: 2,
    totalPumps: 5,
    waterStorage: 78,
    avgSoilHumidity: 62
  });

  useEffect(() => {
    const loadHealth = async () => {
      try {
        const data = await fetchSystemStatus();
        setHealthData(data);
      } catch (error) {
        console.error('Failed to load system health', error);
      }
    };

    loadHealth();
    const interval = setInterval(loadHealth, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div id="system-health" className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 scroll-mt-24">
      <div className="flex items-center gap-2 mb-6">
        <div className="bg-slate-800 p-1.5 rounded-lg text-white">
          <BarChart2 size={16} />
        </div>
        <h2 className="text-lg font-bold text-slate-800">System Health</h2>
      </div>
      
      <div className="space-y-6">
        <div>
          <div className="flex justify-between items-end mb-2">
            <span className="text-sm font-medium text-slate-600">System Online</span>
            <span className="text-sm font-bold text-emerald-600">{healthData.systemOnline}%</span>
          </div>
          <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${healthData.systemOnline}%` }}></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-end mb-2">
            <span className="text-sm font-medium text-slate-600">Active Pumps</span>
            <span className="text-sm font-bold text-slate-800">{healthData.activePumps} / {healthData.totalPumps}</span>
          </div>
          <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-[#00a3ff] rounded-full" style={{ width: `${(healthData.activePumps / Math.max(1, healthData.totalPumps)) * 100}%` }}></div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between items-end mb-2">
            <span className="text-sm font-medium text-slate-600">Water Storage</span>
            <span className="text-sm font-bold text-slate-800">{healthData.waterStorage}%</span>
          </div>
          <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${healthData.waterStorage < 20 ? 'bg-red-500' : 'bg-indigo-500'}`} style={{ width: `${healthData.waterStorage}%` }}></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-end mb-2">
            <span className="text-sm font-medium text-slate-600">Avg Soil Humidity</span>
            <span className="text-sm font-bold text-slate-800">{healthData.avgSoilHumidity}%</span>
          </div>
          <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${healthData.avgSoilHumidity < 30 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${healthData.avgSoilHumidity}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemHealth;
