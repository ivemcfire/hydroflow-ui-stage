// File: src/frontend/src/pages/HydroFlow.tsx
import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Droplets, Database, Sprout, Activity, Settings, Zap, Trash2 } from 'lucide-react';

type NodeType = 'tank' | 'garden' | 'pump' | 'valve' | 'sensor';

interface Node {
  id: string;
  type: NodeType;
  x: number;
  y: number;
  label: string;
}

interface Connection {
  id: string;
  from: string;
  to: string;
}

const AnimatedPipe = ({ id, x1, y1, x2, y2, onDelete }: { id?: string, x1: number, y1: number, x2: number, y2: number, onDelete?: (id: string) => void }) => {
  const dx = Math.abs(x2 - x1);
  const controlPointOffset = Math.max(dx / 2, 50);
  
  const path = `M ${x1} ${y1} C ${x1 + controlPointOffset} ${y1}, ${x2 - controlPointOffset} ${y2}, ${x2} ${y2}`;
  
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;

  return (
    <g className="group">
      {/* Invisible wide path for easier hovering */}
      <path 
        d={path} 
        fill="none" 
        stroke="transparent" 
        strokeWidth="30" 
        cursor={onDelete ? "pointer" : "default"}
        onClick={(e) => {
          if (onDelete && id) {
            e.stopPropagation();
            onDelete(id);
          }
        }} 
      />
      
      {/* Visible paths */}
      <path d={path} fill="none" stroke="#cbd5e1" strokeWidth="6" strokeLinecap="round" className={`pointer-events-none transition-colors ${onDelete ? 'group-hover:stroke-red-200' : ''}`} />
      <path d={path} fill="none" stroke="#38bdf8" strokeWidth="4" strokeDasharray="8 8" strokeLinecap="round" className={`pointer-events-none transition-colors ${onDelete ? 'group-hover:stroke-red-400' : ''}`}>
        <animate attributeName="stroke-dashoffset" from="16" to="0" dur="0.4s" repeatCount="indefinite" />
      </path>

      {/* Delete Button at midpoint */}
      {onDelete && id && (
        <g 
          transform={`translate(${midX}, ${midY})`} 
          className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(id);
          }}
        >
          <circle cx="0" cy="0" r="10" fill="#ef4444" className="hover:fill-red-600 transition-colors" />
          <path d="M -3 -3 L 3 3 M -3 3 L 3 -3" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        </g>
      )}
    </g>
  );
};

const NodeShape = ({ type }: { type: NodeType }) => {
  switch (type) {
    case 'tank':
      return (
        <g>
          <rect width="60" height="60" rx="8" fill="#e0f2fe" stroke="#0ea5e9" strokeWidth="2" />
          <path d="M 5 45 Q 30 40 55 45 L 55 55 Q 30 60 5 55 Z" fill="#38bdf8">
            <animate attributeName="d" values="M 5 45 Q 30 40 55 45 L 55 55 Q 30 60 5 55 Z; M 5 45 Q 30 50 55 45 L 55 55 Q 30 60 5 55 Z; M 5 45 Q 30 40 55 45 L 55 55 Q 30 60 5 55 Z" dur="2s" repeatCount="indefinite" />
          </path>
          <text x="30" y="30" textAnchor="middle" dominantBaseline="middle" fontSize="12" fontWeight="bold" fill="#0284c7">TANK</text>
        </g>
      );
    case 'garden':
      return (
        <g>
          <rect width="60" height="60" rx="8" fill="#dcfce7" stroke="#22c55e" strokeWidth="2" />
          <g>
            <animateTransform attributeName="transform" type="rotate" values="-8 30 45; 8 30 45; -8 30 45" dur="3s" repeatCount="indefinite" />
            <path d="M 30 45 C 30 25 10 15 10 15 C 10 15 25 25 30 35 C 30 25 50 15 50 15 C 50 15 30 25 30 45" fill="none" stroke="#16a34a" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          </g>
          <circle cx="30" cy="45" r="4" fill="#15803d" />
        </g>
      );
    case 'pump':
      return (
        <g>
          <circle cx="30" cy="30" r="30" fill="#f3e8ff" stroke="#a855f7" strokeWidth="2" />
          <g>
            <animateTransform attributeName="transform" type="rotate" from="0 30 30" to="360 30 30" dur="1s" repeatCount="indefinite" />
            <path d="M 30 5 L 30 55 M 5 30 L 55 30" stroke="#9333ea" strokeWidth="5" strokeLinecap="round" />
            <circle cx="30" cy="30" r="8" fill="#7e22ce" />
          </g>
        </g>
      );
    case 'valve':
      return (
        <g>
          <rect width="60" height="60" rx="8" fill="#fef08a" stroke="#eab308" strokeWidth="2" />
          <polygon points="12,18 48,18 30,30" fill="#ca8a04" />
          <polygon points="12,42 48,42 30,30" fill="#ca8a04" />
          <circle cx="30" cy="30" r="5" fill="#854d0e" />
        </g>
      );
    case 'sensor':
      return (
        <g>
          <rect width="60" height="60" rx="30" fill="#ffedd5" stroke="#f97316" strokeWidth="2" />
          <circle cx="30" cy="30" r="16" fill="none" stroke="#ea580c" strokeWidth="4" strokeDasharray="6 6">
            <animateTransform attributeName="transform" type="rotate" from="0 30 30" to="360 30 30" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx="30" cy="30" r="5" fill="#c2410c" />
        </g>
      );
    default:
      return null;
  }
};

const HydroFlow = () => {
  const [nodes, setNodes] = useState<Node[]>([
    { id: '1', type: 'tank', x: 100, y: 200, label: 'Tank 1' },
    { id: '2', type: 'pump', x: 300, y: 200, label: 'Pump 1' },
    { id: '3', type: 'garden', x: 500, y: 200, label: 'Garden 1' },
  ]);
  const [connections, setConnections] = useState<Connection[]>([
    { id: 'c1', from: '1', to: '2' },
    { id: 'c2', from: '2', to: '3' },
  ]);

  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [connectingFromId, setConnectingFromId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  const getMouseCoords = (e: React.MouseEvent | MouseEvent) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const CTM = svgRef.current.getScreenCTM();
    if (!CTM) return { x: 0, y: 0 };
    return {
      x: (e.clientX - CTM.e) / CTM.a,
      y: (e.clientY - CTM.f) / CTM.d
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const coords = getMouseCoords(e);
    setMousePos(coords);

    if (draggingNodeId) {
      setNodes(nodes.map(n => n.id === draggingNodeId ? { ...n, x: coords.x - 30, y: coords.y - 30 } : n));
    }
  };

  const handleMouseUp = () => {
    setDraggingNodeId(null);
    setConnectingFromId(null);
  };

  const startDrag = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDraggingNodeId(id);
  };

  const startConnect = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setConnectingFromId(id);
    setMousePos(getMouseCoords(e));
  };

  const finishConnect = (e: React.MouseEvent, toId: string) => {
    e.stopPropagation();
    if (connectingFromId && connectingFromId !== toId) {
      const exists = connections.some(c => c.from === connectingFromId && c.to === toId);
      if (!exists) {
        setConnections([...connections, { id: `c-${Date.now()}`, from: connectingFromId, to: toId }]);
      }
    }
    setConnectingFromId(null);
  };

  const addNode = (type: NodeType) => {
    const defaultLabels: Record<NodeType, string> = {
      tank: 'New Tank',
      garden: 'New Garden',
      pump: 'New Pump',
      valve: 'New Valve',
      sensor: 'New Sensor'
    };
    setNodes([...nodes, { id: `n-${Date.now()}`, type, x: 60, y: 60, label: defaultLabels[type] }]);
  };

  const updateNodeLabel = (id: string, newLabel: string) => {
    setNodes(nodes.map(n => n.id === id ? { ...n, label: newLabel } : n));
  };

  const removeNode = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setNodes(nodes.filter(n => n.id !== id));
    setConnections(connections.filter(c => c.from !== id && c.to !== id));
  };

  const removeConnection = (id: string) => {
    setConnections(connections.filter(c => c.id !== id));
  };

  const clearCanvas = () => {
    setNodes([]);
    setConnections([]);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 relative z-10 pb-10 flex flex-col h-[calc(100vh-120px)]"
    >
      <div className="flex justify-between items-center relative z-20 shrink-0">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Droplets className="text-[#00a3ff]" />
            HydroFlow Sandbox
          </h2>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            Design your custom irrigation system. Add blocks, drag them around, and connect them by dragging from the blue output port on the right of any block to another block.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 shrink-0">
        <button onClick={() => addNode('tank')} className="px-3 py-2 bg-white rounded-lg shadow-sm text-sm font-semibold flex items-center gap-2 hover:bg-slate-50 border border-slate-200 transition-colors">
          <Database size={16} className="text-[#0ea5e9]" /> Add Tank
        </button>
        <button onClick={() => addNode('pump')} className="px-3 py-2 bg-white rounded-lg shadow-sm text-sm font-semibold flex items-center gap-2 hover:bg-slate-50 border border-slate-200 transition-colors">
          <Activity size={16} className="text-[#a855f7]" /> Add Pump
        </button>
        <button onClick={() => addNode('valve')} className="px-3 py-2 bg-white rounded-lg shadow-sm text-sm font-semibold flex items-center gap-2 hover:bg-slate-50 border border-slate-200 transition-colors">
          <Settings size={16} className="text-[#eab308]" /> Add Valve
        </button>
        <button onClick={() => addNode('sensor')} className="px-3 py-2 bg-white rounded-lg shadow-sm text-sm font-semibold flex items-center gap-2 hover:bg-slate-50 border border-slate-200 transition-colors">
          <Zap size={16} className="text-[#f97316]" /> Add Sensor
        </button>
        <button onClick={() => addNode('garden')} className="px-3 py-2 bg-white rounded-lg shadow-sm text-sm font-semibold flex items-center gap-2 hover:bg-slate-50 border border-slate-200 transition-colors">
          <Sprout size={16} className="text-[#22c55e]" /> Add Garden
        </button>
        <div className="flex-grow"></div>
        <button onClick={clearCanvas} className="px-3 py-2 bg-red-50 text-red-600 rounded-lg shadow-sm text-sm font-semibold flex items-center gap-2 hover:bg-red-100 border border-red-100 transition-colors">
          <Trash2 size={16} /> Clear All
        </button>
      </div>

      <div className="flex-grow relative bg-white/60 backdrop-blur-md rounded-3xl border border-slate-200/60 shadow-inner overflow-hidden">
        <svg 
          ref={svgRef}
          className="w-full h-full absolute inset-0"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Grid Background */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="1" opacity="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Connections */}
          {connections.map(conn => {
            const fromNode = nodes.find(n => n.id === conn.from);
            const toNode = nodes.find(n => n.id === conn.to);
            if (!fromNode || !toNode) return null;
            return (
              <AnimatedPipe 
                key={conn.id} 
                id={conn.id}
                x1={fromNode.x + 60} 
                y1={fromNode.y + 30} 
                x2={toNode.x} 
                y2={toNode.y + 30} 
                onDelete={removeConnection}
              />
            );
          })}
          
          {/* Temporary Connection */}
          {connectingFromId && (
            <AnimatedPipe 
              x1={(nodes.find(n => n.id === connectingFromId)?.x ?? 0) + 60} 
              y1={(nodes.find(n => n.id === connectingFromId)?.y ?? 0) + 30} 
              x2={mousePos.x} 
              y2={mousePos.y} 
            />
          )}

          {/* Nodes */}
          {nodes.map(node => (
            <g key={node.id} transform={`translate(${node.x}, ${node.y})`} className="group">
              <NodeShape type={node.type} />
              
              {/* Editable Label */}
              <foreignObject x="-45" y="-25" width="150" height="24">
                <input
                  type="text"
                  value={node.label}
                  onChange={(e) => updateNodeLabel(node.id, e.target.value)}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="w-full h-full bg-transparent text-center text-xs font-bold text-slate-700 outline-none border-none focus:ring-2 focus:ring-[#00a3ff]/50 rounded px-1"
                />
              </foreignObject>

              {/* Main Drag Area */}
              <rect 
                width="60" height="60" 
                fill="transparent" 
                cursor={connectingFromId ? 'crosshair' : 'move'}
                onMouseDown={(e) => {
                  if (!connectingFromId) startDrag(e, node.id);
                }}
                onMouseUp={(e) => {
                  if (connectingFromId) finishConnect(e, node.id);
                }}
              />
              
              {/* Input Port (Left) - Visual */}
              <circle 
                cx="0" cy="30" r="6" 
                fill="#cbd5e1" 
                stroke="#fff" strokeWidth="2"
                className="pointer-events-none"
              />
              {/* Input Port (Left) - Hit Area */}
              <circle 
                cx="0" cy="30" r="20" 
                fill="transparent" 
                cursor={connectingFromId ? 'crosshair' : 'move'}
                onMouseDown={(e) => {
                  if (!connectingFromId) startDrag(e, node.id);
                }}
                onMouseUp={(e) => {
                  if (connectingFromId) finishConnect(e, node.id);
                }}
              />

              {/* Output Port (Right) - Visual */}
              <circle 
                cx="60" cy="30" r="8" 
                fill="#38bdf8" 
                stroke="#fff" strokeWidth="2"
                className="pointer-events-none"
              />
              {/* Output Port (Right) - Hit Area */}
              <circle 
                cx="60" cy="30" r="20" 
                fill="transparent" 
                cursor="crosshair"
                onMouseDown={(e) => startConnect(e, node.id)} 
                onMouseUp={(e) => {
                  if (connectingFromId) finishConnect(e, node.id);
                }}
              />

              {/* Delete Button */}
              <g 
                transform="translate(30, 70)" 
                cursor="pointer" 
                onClick={(e) => removeNode(e, node.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <circle cx="0" cy="0" r="10" fill="#ef4444" className="hover:fill-red-600" />
                <path d="M -3 -3 L 3 3 M -3 3 L 3 -3" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                {/* Hit area for delete button */}
                <circle cx="0" cy="0" r="16" fill="transparent" />
              </g>
            </g>
          ))}
        </svg>
      </div>
    </motion.div>
  );
};

export default HydroFlow;

