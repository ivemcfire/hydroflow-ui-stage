// File: src/backend/controllers/activityController.ts
import { Request, Response } from 'express';

export interface ActivityLog {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  timestamp: string;
}

// In-memory store for now
export const activityLogs: ActivityLog[] = [
  {
    id: 'act-1',
    type: 'info',
    message: 'System initialized successfully',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'act-2',
    type: 'success',
    message: 'Nutrient Pump A started on schedule',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
  }
];

export const addActivityLog = (type: ActivityLog['type'], message: string) => {
  const newLog: ActivityLog = {
    id: `act-${Date.now()}`,
    type,
    message,
    timestamp: new Date().toISOString(),
  };
  activityLogs.unshift(newLog); // Add to beginning
  
  // Keep only the last 50 logs
  if (activityLogs.length > 50) {
    activityLogs.pop();
  }
};

export const getActivityLogs = (req: Request, res: Response) => {
  res.json(activityLogs);
};
