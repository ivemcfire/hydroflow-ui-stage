// File: src/backend/controllers/nodeController.ts
import { Request, Response } from 'express';
import { addActivityLog } from './activityController';
import { addNotification } from './notificationController';
import { addSensorLog } from './analyticsController';

export interface NodeRule {
  id: string;
  nodeId: string;
  sensor: string;
  condition: '<' | '>' | '=';
  threshold: number;
  action: 'Turn On' | 'Turn Off';
  component: string;
}

export interface IrrigationNode {
  id: string;
  name: string;
  location: string;
  hardware: string[];
  rules: number;
  status: 'Online' | 'Offline';
  time: string;
}

// In-memory store for now
let nodes: IrrigationNode[] = [
  { id: 'node-1', name: 'North Garden', location: 'Backyard North', hardware: ['Main Pump', 'Zone 1 Valve', 'Soil Sensor', 'Tank Sensor'], rules: 1, status: 'Online', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
  { id: 'node-2', name: 'South Greenhouse', location: 'Greenhouse Area', hardware: ['Zone 2 Valve', 'Temp Sensor'], rules: 0, status: 'Online', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
];

let rules: NodeRule[] = [
  { id: 'rule-1', nodeId: 'node-1', sensor: 'Soil Moisture', condition: '<', threshold: 30, action: 'Turn On', component: 'Main Pump' }
];

export const getNodes = (req: Request, res: Response) => {
  res.json(nodes);
};

export const createNode = (req: Request, res: Response) => {
  const newNode: IrrigationNode = {
    ...req.body,
    id: `node-${Date.now()}`,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
  nodes.push(newNode);
  addActivityLog('success', `Node ${newNode.name} created`);
  res.status(201).json(newNode);
};

export const updateNode = (req: Request, res: Response) => {
  const { id } = req.params;
  const index = nodes.findIndex(n => n.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Node not found' });
  }

  nodes[index] = {
    ...nodes[index],
    ...req.body,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
  
  addActivityLog('info', `Node ${nodes[index].name} updated`);
  res.json(nodes[index]);
};

export const deleteNode = (req: Request, res: Response) => {
  const { id } = req.params;
  const node = nodes.find(n => n.id === id);
  if (!node) return res.status(404).json({ error: 'Node not found' });

  nodes = nodes.filter(n => n.id !== id);
  rules = rules.filter(r => r.nodeId !== id);
  
  addActivityLog('warning', `Node ${node.name} deleted`);
  res.json({ success: true });
};

// Rules endpoints
export const getNodeRules = (req: Request, res: Response) => {
  const { nodeId } = req.params;
  res.json(rules.filter(r => r.nodeId === nodeId));
};

export const createRule = (req: Request, res: Response) => {
  const { nodeId } = req.params;
  const newRule: NodeRule = {
    ...req.body,
    id: `rule-${Date.now()}`,
    nodeId
  };
  rules.push(newRule);
  
  // Update node rule count
  const node = nodes.find(n => n.id === nodeId);
  if (node) {
    node.rules = rules.filter(r => r.nodeId === nodeId).length;
  }
  
  addActivityLog('info', `New rule added to node`);
  res.status(201).json(newRule);
};

export const deleteRule = (req: Request, res: Response) => {
  const { id } = req.params;
  const rule = rules.find(r => r.id === id);
  if (!rule) return res.status(404).json({ error: 'Rule not found' });

  rules = rules.filter(r => r.id !== id);
  
  // Update node rule count
  const node = nodes.find(n => n.id === rule.nodeId);
  if (node) {
    node.rules = rules.filter(r => r.nodeId === rule.nodeId).length;
  }

  res.json({ success: true });
};

// --- SIMULATION ENGINE ---
// This simulates the backend evaluating rules against incoming sensor data
export let mockSensorData: Record<string, number> = {
  'Soil Moisture': 45,
  'Temperature': 22,
  'Tank Level': 80
};

export const evaluateRules = () => {
  // Simulate sensor data fluctuating slightly
  mockSensorData['Soil Moisture'] += (Math.random() * 4 - 2); // +/- 2
  mockSensorData['Temperature'] += (Math.random() * 2 - 1); // +/- 1
  mockSensorData['Tank Level'] -= (Math.random() * 0.5); // slowly drains
  
  // Keep bounds
  mockSensorData['Soil Moisture'] = Math.max(0, Math.min(100, mockSensorData['Soil Moisture']));
  mockSensorData['Tank Level'] = Math.max(0, Math.min(100, mockSensorData['Tank Level']));

  // Log to DB
  addSensorLog('Soil Moisture', Number(mockSensorData['Soil Moisture'].toFixed(1)), '%');
  addSensorLog('Temperature', Number(mockSensorData['Temperature'].toFixed(1)), '°C');
  addSensorLog('Tank Level', Number(mockSensorData['Tank Level'].toFixed(1)), '%');

  // Check critical conditions for notifications
  if (mockSensorData['Tank Level'] < 20) {
    if (Math.random() < 0.1) {
      addNotification('warning', `Tank Level is critically low (${Math.round(mockSensorData['Tank Level'])}%)`);
    }
  }
  
  if (mockSensorData['Soil Moisture'] < 25) {
    if (Math.random() < 0.1) {
      addNotification('warning', `Soil Moisture is very low (${Math.round(mockSensorData['Soil Moisture'])}%)`);
    }
  }
  
  if (mockSensorData['Temperature'] > 35) {
    if (Math.random() < 0.1) {
      addNotification('error', `High Temperature Alert: ${Math.round(mockSensorData['Temperature'])}°C`);
    }
  }

  // Evaluate rules
  rules.forEach(rule => {
    const currentValue = mockSensorData[rule.sensor];
    if (currentValue === undefined) return;

    let conditionMet = false;
    switch (rule.condition) {
      case '<': conditionMet = currentValue < rule.threshold; break;
      case '>': conditionMet = currentValue > rule.threshold; break;
      case '=': conditionMet = Math.abs(currentValue - rule.threshold) < 1; break; // fuzzy equals for floats
    }

    if (conditionMet) {
      // In a real app, we would check if the component is already in this state
      // and publish an MQTT message to change it.
      // For this simulation, we'll just log it occasionally
      if (Math.random() < 0.05) { // 5% chance to log to prevent spamming the activity feed
        addActivityLog('info', `Rule triggered: ${rule.sensor} is ${Math.round(currentValue)}. Action: ${rule.action} ${rule.component}`);
      }
    }
  });
};

// Start the evaluation engine
setInterval(evaluateRules, 5000); // Run every 5 seconds
