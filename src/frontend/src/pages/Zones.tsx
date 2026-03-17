// File: src/frontend/src/pages/Zones.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Map as MapIcon, Activity, Cpu, Database } from 'lucide-react';

const BlockSchemaSVG = () => (
  <svg viewBox="0 0 1200 400" className="w-full h-auto text-slate-800 font-sans">
    <defs>
      <marker id="arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
      </marker>
      <marker id="arrow-dashed" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
      </marker>
    </defs>

    {/* Paths (Water Flow - Solid) */}
    <path d="M 180 150 L 280 150" stroke="currentColor" strokeWidth="2" fill="none" markerEnd="url(#arrow)" />
    <path d="M 380 150 L 480 150" stroke="currentColor" strokeWidth="2" fill="none" markerEnd="url(#arrow)" />

    {/* Manifold to Zones */}
    <path d="M 580 150 L 650 150 L 650 80 L 730 80" stroke="currentColor" strokeWidth="2" fill="none" markerEnd="url(#arrow)" />
    <path d="M 580 150 L 730 150" stroke="currentColor" strokeWidth="2" fill="none" markerEnd="url(#arrow)" />
    <path d="M 580 150 L 650 150 L 650 220 L 730 220" stroke="currentColor" strokeWidth="2" fill="none" markerEnd="url(#arrow)" />

    {/* Paths (Data/Control - Dashed) */}
    <path d="M 800 250 L 800 320 L 650 320" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" fill="none" markerEnd="url(#arrow-dashed)" />
    <path d="M 450 320 L 330 320 L 330 200" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" fill="none" markerEnd="url(#arrow-dashed)" />
    <path d="M 450 320 L 530 320 L 530 200" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5,5" fill="none" markerEnd="url(#arrow-dashed)" />

    {/* Nodes */}
    {/* Main Tank */}
    <rect x="60" y="90" width="120" height="120" rx="10" fill="#cce5ef" stroke="currentColor" strokeWidth="1.5" />
    {/* Main Pump */}
    <polygon points="280,150 330,110 380,150 330,190" fill="#00ccff" stroke="currentColor" strokeWidth="1.5" />
    {/* Valve Manifold */}
    <rect x="480" y="110" width="100" height="80" rx="5" fill="#e6e0f8" stroke="currentColor" strokeWidth="1.5" />
    {/* Zones */}
    <rect x="740" y="50" width="120" height="60" rx="5" fill="#fae6d1" stroke="currentColor" strokeWidth="1.5" />
    <rect x="740" y="120" width="120" height="60" rx="5" fill="#fae6d1" stroke="currentColor" strokeWidth="1.5" />
    <rect x="740" y="190" width="120" height="60" rx="5" fill="#fae6d1" stroke="currentColor" strokeWidth="1.5" />
    {/* Smart Controller */}
    <polygon points="450,320 550,280 650,320 550,360" fill="#fef08a" stroke="currentColor" strokeWidth="1.5" />

    {/* Text */}
    <g fontSize="14" fontWeight="bold" textAnchor="middle">
      <text x="120" y="145">Main Water</text>
      <text x="120" y="165">Tank</text>

      <text x="330" y="155">Pump</text>

      <text x="530" y="145">Valve</text>
      <text x="530" y="165">Manifold</text>

      <text x="800" y="85">Zone 1</text>
      <text x="800" y="155">Zone 2</text>
      <text x="800" y="225">Zone 3</text>

      <text x="550" y="325">Smart Controller</text>
    </g>

    {/* Labels */}
    <g fontSize="12" textAnchor="middle" fill="#64748b">
      <text x="230" y="140">Water Supply</text>
      <text x="430" y="140">Pressurized</text>
      <text x="690" y="70">Irrigation</text>
      <text x="725" y="340">Sensor Data (Moisture)</text>
      <text x="390" y="340">Control Signals</text>
    </g>
  </svg>
);
import { fetchHardware, fetchAutomations, fetchNodes } from '../services/api';

const ConnectionsOverlay = ({ connections }: { connections: any[] }) => {
  const [lines, setLines] = useState<any[]>([]);

  useEffect(() => {
    const updateLines = () => {
      const container = document.getElementById('zones-container');
      if (!container) return;
      const containerRect = container.getBoundingClientRect();

      const newLines = connections.map((conn, idx) => {
        const el1 = document.getElementById(`comp-${conn.from}`);
        const el2 = document.getElementById(`comp-${conn.to}`);
        
        if (el1 && el2) {
          const rect1 = el1.getBoundingClientRect();
          const rect2 = el2.getBoundingClientRect();
          
          const x1 = rect1.left + rect1.width / 2 - containerRect.left;
          const y1 = rect1.top + rect1.height / 2 - containerRect.top;
          const x2 = rect2.left + rect2.width / 2 - containerRect.left;
          const y2 = rect2.top + rect2.height / 2 - containerRect.top;
          
          // Calculate angle to offset the arrow so it doesn't hide under the target element
          const angle = Math.atan2(y2 - y1, x2 - x1);
          
          // Offset by roughly half the component's width/height to point at the edge
          // This ensures the arrow and line start/end neatly at the component boundaries
          const offsetStart = 45;
          const offsetEnd = 55; 
          
          const targetX = x2 - Math.cos(angle) * offsetEnd;
          const targetY = y2 - Math.sin(angle) * offsetEnd;
          
          const startX = x1 + Math.cos(angle) * offsetStart;
          const startY = y1 + Math.sin(angle) * offsetStart;
          
          return {
            id: `conn-${idx}`,
            x1: startX, y1: startY, x2: targetX, y2: targetY
          };
        }
        return null;
      }).filter(Boolean);
      
      setLines(newLines);
    };

    const timeoutId = setTimeout(updateLines, 500);
    window.addEventListener('resize', updateLines);
    
    const observer = new MutationObserver(updateLines);
    const container = document.getElementById('zones-container');
    if (container) {
      observer.observe(container, { childList: true, subtree: true, attributes: true });
    }

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updateLines);
      observer.disconnect();
    };
  }, [connections]);

  return (
    <svg className="absolute inset-0 pointer-events-none z-20" style={{ width: '100%', height: '100%' }}>
      <defs>
        <marker id="arrowhead" markerWidth="6" markerHeight="5" refX="5" refY="2.5" orient="auto">
          <polygon points="0 0, 6 2.5, 0 5" fill="#94a3b8" />
        </marker>
      </defs>
      {lines.map((line: any) => (
        <g key={line.id}>
          <line 
            x1={line.x1} 
            y1={line.y1} 
            x2={line.x2} 
            y2={line.y2} 
            stroke="#cbd5e1" 
            strokeWidth="1.5" 
            markerEnd="url(#arrowhead)"
            className="opacity-80"
          />
          <circle cx={line.x1} cy={line.y1} r="2.5" fill="#94a3b8" className="opacity-80" />
        </g>
      ))}
    </svg>
  );
};

const Zones = () => {
  const [components, setComponents] = useState<any[]>([]);
  const [automations, setAutomations] = useState<any[]>([]);
  const [nodes, setNodes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [comps, autos, nds] = await Promise.all([
          fetchHardware(),
          fetchAutomations(),
          fetchNodes()
        ]);
        setComponents(comps);
        setAutomations(autos);
        setNodes(nds);
      } catch (error) {
        console.error('Failed to load zone data', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Determine logical connections between components based on automations
  const crossZoneConnections: { from: number, to: number }[] = [];
  const involvedComponentIds = new Set<number>();
  
  automations.forEach(auto => {
    const sourceComp = components.find(c => c.id === auto.sourceId);
    if (!sourceComp) return;
    
    auto.targets.forEach((target: any) => {
      const targetComp = components.find(c => c.id === target.id);
      if (targetComp && sourceComp.zone !== targetComp.zone) {
        // Check if connection already exists
        const exists = crossZoneConnections.some(
          c => c.from === sourceComp.id && c.to === targetComp.id
        );
        if (!exists) {
          crossZoneConnections.push({ from: sourceComp.id, to: targetComp.id });
          involvedComponentIds.add(sourceComp.id);
          involvedComponentIds.add(targetComp.id);
        }
      }
    });
  });

  // Filter components to only those involved in cross-zone automations
  const filteredComponents = components.filter(c => involvedComponentIds.has(c.id));

  // Group filtered components by zone
  const groupedComponents = filteredComponents.reduce((acc, comp) => {
    if (!acc[comp.zone]) acc[comp.zone] = [];
    acc[comp.zone].push(comp);
    return acc;
  }, {} as Record<string, any[]>);

  const zones = Object.keys(groupedComponents);

  // Find which node a component belongs to
  const getNodeForComponent = (compName: string) => {
    return nodes.find(n => n.hardware.includes(compName));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00a3ff]"></div>
      </div>
    );
  }

  if (zones.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6 relative z-10 pb-10"
      >
        <div className="flex justify-between items-center mb-8 relative z-20">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <MapIcon className="text-[#00a3ff]" />
              Zone Map
            </h2>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              This map visualizes active automations that span across different zones. It only displays hardware components involved in these cross-zone rules. The arrows indicate the flow of logic from the trigger source (e.g., a sensor) to the target action (e.g., a pump).
            </p>
          </div>
        </div>
        <div className="bg-white/40 rounded-3xl p-8 border border-slate-200/60 shadow-inner flex flex-col items-center justify-center min-h-[400px]">
          <Activity size={48} className="text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-700">No Cross-Zone Connections</h3>
          <p className="text-sm text-slate-500 text-center max-w-md mt-2">
            There are currently no hardware components logically connected across different zones. Create automations that link sensors in one zone to devices in another to see them here.
          </p>
        </div>

        <div className="mt-12 bg-white/60 backdrop-blur-md rounded-3xl p-8 border border-slate-200/60 shadow-sm">
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Database className="text-[#00a3ff]" />
            System Block Schema
          </h3>
          <BlockSchemaSVG />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 relative z-10 pb-10"
    >
      <div className="flex justify-between items-center mb-8 relative z-20">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <MapIcon className="text-[#00a3ff]" />
            Zone Map
          </h2>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            This map visualizes active automations that span across different zones. It only displays hardware components involved in these cross-zone rules. The arrows indicate the flow of logic from the trigger source (e.g., a sensor) to the target action (e.g., a pump).
          </p>
        </div>
      </div>

      <div id="zones-container" className="relative min-h-[400px] bg-white/40 rounded-3xl p-6 border border-slate-200/60 shadow-inner">
        <ConnectionsOverlay connections={crossZoneConnections} />
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 relative z-10">
          {zones.map(zoneName => (
            <div 
              key={zoneName} 
              id={`zone-${zoneName.replace(/\s+/g, '-')}`}
              className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 hover:shadow-md transition-all duration-300 flex flex-col"
            >
              <h3 className="text-sm font-bold text-slate-800 mb-3 text-center border-b border-slate-100 pb-2">{zoneName}</h3>
              
              <div className="space-y-2">
                {groupedComponents[zoneName].map(comp => {
                  const node = getNodeForComponent(comp.name);
                  return (
                    <div key={comp.id} id={`comp-${comp.id}`} className="flex flex-col bg-slate-50 p-2.5 rounded-lg border border-slate-100 relative z-10">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded flex items-center justify-center ${comp.bg}`}>
                            <Activity size={12} className="text-slate-600" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-700 leading-tight">{comp.name}</p>
                            <p className="text-[9px] font-medium text-slate-500 uppercase tracking-wider mt-0.5">{comp.type}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className={`w-1.5 h-1.5 rounded-full ${comp.status === 'Online' ? 'bg-emerald-400' : 'bg-red-400'}`}></div>
                        </div>
                      </div>
                      {node && (
                        <div className="flex items-center gap-1 mt-1 pt-1.5 border-t border-slate-200/60">
                          <Cpu size={10} className="text-slate-400" />
                          <span className="text-[9px] font-semibold text-slate-500 truncate">Node: {node.name}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 bg-white/60 backdrop-blur-md rounded-3xl p-8 border border-slate-200/60 shadow-sm">
        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Database className="text-[#00a3ff]" />
          System Block Schema
        </h3>
        <BlockSchemaSVG />
      </div>
    </motion.div>
  );
};

export default Zones;
