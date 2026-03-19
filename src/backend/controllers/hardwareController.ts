// File: src/backend/controllers/hardwareController.ts
import { Request, Response } from 'express';
import { db } from '../localDb';
import { handleFirestoreError, OperationType } from '../utils/errorHandlers';

export interface HardwareComponent {
  id: string;
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
  id: string;
  sourceId: string;
  targets: { id: string; action: string }[];
  condition: string;
  status: string;
}

export const getComponents = async (req: Request, res: Response) => {
  const path = 'hardware';
  try {
    const snapshot = await db.collection(path).get();
    const components = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    }));

    if (components.length === 0) {
      const initialComponents = [
        { name: 'Main Pump', type: 'Pump', status: 'Online', bg: 'bg-blue-50', isOn: true, zone: 'Main System' },
        { name: 'Zone 1 Valve', type: 'Valve', status: 'Online', bg: 'bg-indigo-50', isOn: false, zone: 'Zone 1' },
        { name: 'Soil Sensor', type: 'Soil Sensor', status: 'Online', bg: 'bg-orange-50', value: 55, zone: 'Zone 1' },
        { name: 'Primary Tank', type: 'Dual IR Sensor', status: 'Online', bg: 'bg-cyan-50', sensor10: true, sensor90: false, zone: 'Main System' },
        { name: 'Secondary Pump', type: 'Pump', status: 'Online', bg: 'bg-blue-50', isOn: false, zone: 'Main System' },
        { name: 'Zone 2 Valve', type: 'Valve', status: 'Online', bg: 'bg-indigo-50', isOn: false, zone: 'Zone 2' },
      ];
      const batch = db.batch();
      initialComponents.forEach(c => {
        const ref = db.collection(path).doc();
        batch.set(ref, c);
      });
      await batch.commit();
      const newSnapshot = await db.collection(path).get();
      return res.json(newSnapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })));
    }

    res.json(components);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    res.status(500).json({ error: 'Failed to fetch components' });
  }
};

export const updateComponent = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const path = `hardware/${id}`;
  try {
    const ref = db.collection('hardware').doc(id);
    await ref.update(req.body);
    const updated = await ref.get();
    res.json({ id, ...updated.data() });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    res.status(500).json({ error: 'Failed to update component' });
  }
};

export const addComponent = async (req: Request, res: Response) => {
  const path = 'hardware';
  try {
    const docRef = await db.collection(path).add(req.body);
    res.status(201).json({ id: docRef.id, ...req.body });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    res.status(500).json({ error: 'Failed to add component' });
  }
};

export const deleteComponent = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const path = `hardware/${id}`;
  try {
    await db.collection('hardware').doc(id).delete();
    res.json({ success: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
    res.status(500).json({ error: 'Failed to delete component' });
  }
};

export const getAutomations = async (req: Request, res: Response) => {
  const path = 'automations';
  try {
    const snapshot = await db.collection(path).get();
    const automations = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    }));
    
    if (automations.length === 0) {
      // Seed with some initial automations if needed
      // For now, return empty or mock
    }
    
    res.json(automations);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    res.status(500).json({ error: 'Failed to fetch automations' });
  }
};
