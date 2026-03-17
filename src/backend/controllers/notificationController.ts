// File: src/backend/controllers/notificationController.ts
import { Request, Response } from 'express';

export interface Notification {
  id: string;
  type: 'error' | 'warning' | 'info' | 'update';
  message: string;
  timestamp: string;
  read: boolean;
}

// In-memory store for now
export const notifications: Notification[] = [
  { 
    id: 'notif-1', 
    type: 'error', 
    message: 'Moisture Sensor A disconnected in Zone 1', 
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), 
    read: false 
  },
  { 
    id: 'notif-2', 
    type: 'warning', 
    message: 'Nutrient Tank B level is low (15%)', 
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), 
    read: false 
  },
  { 
    id: 'notif-3', 
    type: 'update', 
    message: 'System firmware updated to v2.1.0', 
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), 
    read: true 
  },
];

export const getNotifications = (req: Request, res: Response) => {
  res.json(notifications);
};

export const markAsRead = (req: Request, res: Response) => {
  const { id } = req.params;
  const notif = notifications.find(n => n.id === id);
  if (notif) {
    notif.read = true;
  }
  res.json({ success: true });
};

export const markAllAsRead = (req: Request, res: Response) => {
  notifications.forEach(n => n.read = true);
  res.json({ success: true });
};

export const addNotification = (type: Notification['type'], message: string) => {
  notifications.unshift({
    id: `notif-${Date.now()}`,
    type,
    message,
    timestamp: new Date().toISOString(),
    read: false
  });
  
  if (notifications.length > 50) {
    notifications.pop();
  }
};
