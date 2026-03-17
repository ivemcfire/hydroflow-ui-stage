// File: src/backend/controllers/systemHealthController.ts
import { Request, Response } from 'express';
import { mockSensorData } from './nodeController';
import { pumps } from './pumpController';

export const getSystemHealth = (req: Request, res: Response) => {
  const activePumps = pumps.filter(p => p.status === 'on').length;
  const totalPumps = pumps.length;
  
  const healthData = {
    status: 'ok',
    color: process.env.APP_COLOR || 'blue',
    systemOnline: 99.9, // Simulated uptime
    activePumps,
    totalPumps,
    waterStorage: Math.round(mockSensorData['Tank Level'] || 78),
    avgSoilHumidity: Math.round(mockSensorData['Soil Moisture'] || 62),
  };

  res.json(healthData);
};
