// File: src/backend/controllers/nodeController.ts
import { Request, Response } from 'express';
import { addActivityLog } from './activityController';
import { addNotification } from './notificationController';
import { addSensorLog } from './analyticsController';
import { db } from '../localDb';
import { publishSensor } from '../services/mqttService';
import { handleFirestoreError, OperationType } from '../utils/errorHandlers';

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

export const getNodes = async (req: Request, res: Response) => {
  const path = 'nodes';
  try {
    const snapshot = await db.collection(path).get();
    const nodes = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    }));

    // Seed if empty
    if (nodes.length === 0) {
      const initialNodes = [
        { name: 'North Garden', location: 'Backyard North', hardware: ['Main Pump', 'Zone 1 Valve', 'Soil Sensor', 'Tank Sensor'], status: 'Online', lastSeen: new Date().toISOString() },
        { name: 'South Greenhouse', location: 'Greenhouse Area', hardware: ['Zone 2 Valve', 'Temp Sensor'], status: 'Online', lastSeen: new Date().toISOString() },
      ];
      const batch = db.batch();
      initialNodes.forEach(n => {
        const ref = db.collection(path).doc();
        batch.set(ref, n);
      });
      await batch.commit();
      const newSnapshot = await db.collection(path).get();
      return res.json(newSnapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })));
    }

    res.json(nodes);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
};

export const createNode = async (req: Request, res: Response) => {
  const path = 'nodes';
  try {
    const newNode = {
      ...req.body,
      lastSeen: new Date().toISOString()
    };
    const docRef = await db.collection(path).add(newNode);
    await addActivityLog('success', `Node ${newNode.name} created`);
    res.status(201).json({ id: docRef.id, ...newNode });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const updateNode = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const path = `nodes/${id}`;
  try {
    const nodeRef = db.collection('nodes').doc(id);
    await nodeRef.update({
      ...req.body,
      lastSeen: new Date().toISOString()
    });
    const updated = await nodeRef.get();
    await addActivityLog('info', `Node ${updated.data()?.name} updated`);
    res.json({ id, ...updated.data() });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

export const deleteNode = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const path = `nodes/${id}`;
  try {
    const nodeRef = db.collection('nodes').doc(id);
    const node = await nodeRef.get();
    if (!node.exists) return res.status(404).json({ error: 'Node not found' });

    // Delete subcollection rules
    const rulesSnapshot = await nodeRef.collection('rules').get();
    const batch = db.batch();
    rulesSnapshot.docs.forEach((doc: any) => batch.delete(doc.ref));
    batch.delete(nodeRef);
    await batch.commit();

    await addActivityLog('warning', `Node ${node.data()?.name} deleted`);
    res.json({ success: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

export const getNodeRules = async (req: Request, res: Response) => {
  const nodeId = req.params.nodeId as string;
  const path = `nodes/${nodeId}/rules`;
  try {
    const snapshot = await db.collection('nodes').doc(nodeId).collection('rules').get();
    const rules = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      nodeId,
      ...doc.data()
    }));
    res.json(rules);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
};

export const createRule = async (req: Request, res: Response) => {
  const nodeId = req.params.nodeId as string;
  const path = `nodes/${nodeId}/rules`;
  try {
    const newRule = {
      ...req.body,
    };
    const docRef = await db.collection('nodes').doc(nodeId).collection('rules').add(newRule);
    await addActivityLog('info', `New rule added to node`);
    res.status(201).json({ id: docRef.id, nodeId, ...newRule });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const deleteRule = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const path = `rules/${id}`;
  try {
    const nodesSnapshot = await db.collection('nodes').get();
    for (const nodeDoc of nodesSnapshot.docs) {
      const ruleRef = nodeDoc.ref.collection('rules').doc(id);
      const ruleDoc = await ruleRef.get();
      if (ruleDoc.exists) {
        await ruleRef.delete();
        return res.json({ success: true });
      }
    }
    res.status(404).json({ error: 'Rule not found' });
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

// --- SIMULATION ENGINE ---
export const mockSensorData: Record<string, number> = {
  'Soil Moisture': 45,
  'Temperature': 22,
  'Tank Level': 80
};

/**
 * Simulates environmental changes and publishes them via MQTT.
 * This triggers the real Automation Rule Engine in mqttService.ts.
 */
export const simulateEnvironment = async () => {
  mockSensorData['Soil Moisture'] += (Math.random() * 4 - 2);
  mockSensorData['Temperature'] += (Math.random() * 2 - 1);
  mockSensorData['Tank Level'] -= (Math.random() * 0.5);
  
  mockSensorData['Soil Moisture'] = Math.max(0, Math.min(100, mockSensorData['Soil Moisture']));
  mockSensorData['Tank Level'] = Math.max(0, Math.min(100, mockSensorData['Tank Level']));

  // Publish via MQTT (this will trigger Firestore updates AND Automation Rules via mqttService)
  publishSensor('node-1', 'Soil Moisture', Number(mockSensorData['Soil Moisture'].toFixed(1)));
  publishSensor('node-1', 'Temperature', Number(mockSensorData['Temperature'].toFixed(1)));
  publishSensor('node-1', 'Tank Level', Number(mockSensorData['Tank Level'].toFixed(1)));

  // Periodic notifications for extreme values (outside of automation rules)
  if (mockSensorData['Tank Level'] < 5 && Math.random() < 0.1) {
    await addNotification('error', `EMERGENCY: Tank Level is critically low (${Math.round(mockSensorData['Tank Level'])}%)`);
  }
};

setInterval(simulateEnvironment, 10000); // Run every 10 seconds
