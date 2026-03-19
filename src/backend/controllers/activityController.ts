// File: src/backend/controllers/activityController.ts
import { Request, Response } from 'express';
import { db } from '../localDb';
import { handleFirestoreError, OperationType } from '../utils/errorHandlers';

export interface ActivityLog {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  timestamp: string;
}

export const addActivityLog = async (type: ActivityLog['type'], message: string) => {
  const path = 'activity';
  try {
    const newLog = {
      type,
      message,
      timestamp: new Date().toISOString(),
    };
    await db.collection(path).add(newLog);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const getActivityLogs = async (req: Request, res: Response) => {
  const path = 'activity';
  try {
    const snapshot = await db.collection(path)
      .orderBy('timestamp', 'desc')
      .limit(50)
      .get();
    
    const logs = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.json(logs);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
};
