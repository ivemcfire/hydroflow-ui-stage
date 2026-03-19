// File: src/frontend/src/components/RecentActivity.tsx
import React, { useEffect, useState } from 'react';
import { History, Info, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { fetchActivityLogs } from '../services/api';

interface ActivityLog {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  timestamp: string;
}

const RecentActivity = ({ hideHeader = false }: { hideHeader?: boolean }) => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const data = await fetchActivityLogs();
        setLogs(data);
      } catch (error) {
        console.error('Failed to load activity logs', error);
      } finally {
        setLoading(false);
      }
    };

    loadLogs();
    // Poll for new logs every 5 seconds
    const interval = setInterval(loadLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle size={16} className="text-emerald-500" />;
      case 'warning': return <AlertTriangle size={16} className="text-amber-500" />;
      case 'error': return <XCircle size={16} className="text-red-500" />;
      default: return <Info size={16} className="text-blue-500" />;
    }
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`bg-white rounded-2xl ${hideHeader ? '' : 'p-6 shadow-sm border border-slate-100'} min-h-[200px] flex flex-col`}>
      {!hideHeader && (
        <div className="flex items-center gap-2 mb-6">
          <History size={20} className="text-slate-800" />
          <h2 className="text-lg font-bold text-slate-800">Recent Activity</h2>
        </div>
      )}
      
      <div className="flex-grow flex flex-col gap-4 overflow-y-auto max-h-[300px] pr-2">
        {loading ? (
          <div className="flex-grow flex items-center justify-center">
            <p className="text-sm text-slate-400">Loading activity...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex-grow flex items-center justify-center">
            <p className="text-sm text-slate-400">No recent activity</p>
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="flex items-start gap-3 pb-3 border-b border-slate-50 last:border-0 last:pb-0">
              <div className="mt-0.5">{getIcon(log.type)}</div>
              <div className="flex-grow">
                <p className="text-sm text-slate-700">{log.message}</p>
                <span className="text-xs text-slate-400">{formatTime(log.timestamp)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentActivity;
