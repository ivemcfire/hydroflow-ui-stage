// File: src/frontend/src/components/AnalyticsWidget.tsx
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChevronDown, BarChart2, Loader2 } from 'lucide-react';
import { fetchAnalyticsData } from '../services/api';

const graphs = [
  { id: 1, name: 'Water Usage vs AI Optimized', type: 'bar' },
  { id: 2, name: 'Soil Moisture Trends', type: 'area' },
  { id: 3, name: 'Temperature History', type: 'line' },
  { id: 4, name: 'Humidity Levels', type: 'line' },
  { id: 5, name: 'Nutrient (EC) Levels', type: 'line' },
  { id: 6, name: 'pH Balance History', type: 'line' },
  { id: 7, name: 'Pump Energy Consumption', type: 'bar' },
  { id: 8, name: 'Tank Level History', type: 'area' },
  { id: 9, name: 'Light Exposure (PAR)', type: 'line' },
  { id: 10, name: 'Crop Yield Estimates', type: 'bar' },
];

const AnalyticsWidget = () => {
  const [selectedGraph, setSelectedGraph] = useState(graphs[0]);
  const [isOpen, setIsOpen] = useState(false);
  const [graphData, setGraphData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = await fetchAnalyticsData(selectedGraph.id);
        setGraphData(data);
      } catch (error) {
        console.error('Failed to load analytics data', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [selectedGraph.id]);

  const renderGraph = () => {
    if (isLoading) {
      return (
        <div className="w-full h-full flex items-center justify-center text-slate-400">
          <Loader2 className="animate-spin" size={24} />
        </div>
      );
    }

    switch (selectedGraph.type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={graphData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Bar dataKey="value1" fill="#00a3ff" radius={[4, 4, 0, 0]} />
              {graphData[0]?.value2 !== undefined && <Bar dataKey="value2" fill="#34d399" radius={[4, 4, 0, 0]} />}
            </BarChart>
          </ResponsiveContainer>
        );
      case 'area':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={graphData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00a3ff" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00a3ff" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Area type="monotone" dataKey="value1" stroke="#00a3ff" fillOpacity={1} fill="url(#colorVal)" />
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={graphData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Line type="monotone" dataKey="value1" stroke="#00a3ff" strokeWidth={3} dot={{ r: 4, fill: '#00a3ff', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  return (
    <div id="analytics" className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col h-[350px] scroll-mt-24">
      <div className="flex items-center justify-between mb-4 relative">
        <div className="flex items-center gap-2">
          <div className="bg-blue-50 p-2 rounded-lg text-[#00a3ff]">
            <BarChart2 size={18} />
          </div>
          <h3 className="font-bold text-slate-800">Quick Analytics</h3>
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-colors"
          >
            <span className="truncate max-w-[120px]">{selectedGraph.name}</span>
            <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isOpen && (
            <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50 max-h-64 overflow-y-auto">
              {graphs.map(g => (
                <button
                  key={g.id}
                  onClick={() => {
                    setSelectedGraph(g);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-xs transition-colors ${selectedGraph.id === g.id ? 'bg-blue-50 text-[#00a3ff] font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  {g.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex-grow w-full">
        {renderGraph()}
      </div>
    </div>
  );
};

export default AnalyticsWidget;
