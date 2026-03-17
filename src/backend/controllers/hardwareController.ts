// File: src/backend/controllers/hardwareController.ts
import { Request, Response } from 'express';

export interface HardwareComponent {
  id: number;
  name: string;
  type: string;
  status: string;
  bg: string;
  zone: string;
  isOn?: boolean;
  value?: number;
  sensor10?: boolean;
  sensor90?: boolean;
}

export interface Automation {
  id: number;
  sourceId: number;
  targets: { id: number; action: string }[];
  condition: string;
  status: string;
}

let components: HardwareComponent[] = [
  { id: 1, name: 'Main Pump', type: 'Pump', status: 'Online', bg: 'bg-blue-50', isOn: true, zone: 'Main System' },
  { id: 2, name: 'Zone 1 Valve', type: 'Valve', status: 'Online', bg: 'bg-indigo-50', isOn: false, zone: 'Zone 1' },
  { id: 3, name: 'Soil Sensor', type: 'Soil Sensor', status: 'Online', bg: 'bg-orange-50', value: 55, zone: 'Zone 1' },
  { id: 4, name: 'Primary Tank', type: 'Dual IR Sensor', status: 'Online', bg: 'bg-cyan-50', sensor10: true, sensor90: false, zone: 'Main System' },
  { id: 5, name: 'Secondary Pump', type: 'Pump', status: 'Online', bg: 'bg-blue-50', isOn: false, zone: 'Main System' },
  { id: 6, name: 'Zone 2 Valve', type: 'Valve', status: 'Online', bg: 'bg-indigo-50', isOn: false, zone: 'Zone 2' },
];

let automations: Automation[] = [
  { 
    id: 1, 
    sourceId: 3, 
    targets: [
      { id: 1, action: 'Turn On' },
      { id: 5, action: 'Turn On' },
      { id: 2, action: 'Turn On' },
      { id: 6, action: 'Turn On' }
    ], 
    condition: 'Value < 40%', 
    status: 'Active' 
  },
  { 
    id: 2, 
    sourceId: 4, 
    targets: [{ id: 1, action: 'Turn Off' }], 
    condition: 'Level < 10%', 
    status: 'Active' 
  },
  { 
    id: 3, 
    sourceId: 3, 
    targets: [{ id: 2, action: 'Turn Off' }], 
    condition: 'Value > 70%', 
    status: 'Paused' 
  },
];

export const getComponents = (req: Request, res: Response) => {
  res.json(components);
};

export const updateComponent = (req: Request, res: Response) => {
  const { id } = req.params;
  const index = components.findIndex(c => c.id === parseInt(id as string));
  if (index !== -1) {
    components[index] = { ...components[index], ...req.body };
    res.json(components[index]);
  } else {
    res.status(404).json({ error: 'Component not found' });
  }
};

export const addComponent = (req: Request, res: Response) => {
  const newComp = { ...req.body, id: Date.now() };
  components.push(newComp);
  res.status(201).json(newComp);
};

export const deleteComponent = (req: Request, res: Response) => {
  const { id } = req.params;
  components = components.filter(c => c.id !== parseInt(id as string));
  res.json({ success: true });
};

export const getAutomations = (req: Request, res: Response) => {
  res.json(automations);
};
