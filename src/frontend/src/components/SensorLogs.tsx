// File: src/frontend/src/components/SensorLogs.tsx
import React, { useState, useEffect } from 'react';
import { Activity, Loader2 } from 'lucide-react';

const API_BASE = '/api';

const SensorLogs = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch(`${API_BASE}/sensors/logs`);
        if (response.ok) {
          const data = await response.json();
          setLogs(data);
        }
      } catch (error) {
        console.error('Failed to fetch sensor logs', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      <div className="flex items-center gap-2 mb-6">
        <div className="bg-indigo-50 p-2 rounded-lg text-indigo-500">
          <Activity size={20} />
        </div>
        <h2 className="text-lg font-bold text-slate-800">Live Sensor Logs</h2>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8 text-slate-400">
          <Loader2 className="animate-spin" size={24} />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-slate-400 border-b border-slate-100">
                <th className="pb-3 font-medium">Timestamp</th>
                <th className="pb-3 font-medium">Sensor</th>
                <th className="pb-3 font-medium text-right">Value</th>
              </tr>
            </thead>
            <tbody>
              {logs.slice(0, 10).map((log, i) => (
                <tr key={i} className="border-b border-slate-50 last:border-0">
                  <td className="py-3 text-slate-500">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="py-3 font-medium text-slate-700">{log.sensor}</td>
                  <td className="py-3 text-right font-bold text-slate-800">
                    {log.value} <span className="text-slate-400 font-normal">{log.unit}</span>
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-slate-400">No logs available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SensorLogs;
