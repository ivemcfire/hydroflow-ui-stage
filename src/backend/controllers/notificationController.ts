// File: src/backend/controllers/notificationController.ts
import { Request, Response } from 'express';
import { db } from '../localDb';
import { handleFirestoreError, OperationType } from '../utils/errorHandlers';

export interface Notification {
  id: string;
  type: 'error' | 'warning' | 'info' | 'update';
  message: string;
  timestamp: string;
  read: boolean;
}

export const addNotification = async (type: Notification['type'], message: string) => {
  const path = 'notifications';
  try {
    const newNotif = {
      type,
      message,
      read: false,
      timestamp: new Date().toISOString(),
    };
    await db.collection(path).add(newNotif);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const getNotifications = async (req: Request, res: Response) => {
  const path = 'notifications';
  try {
    const snapshot = await db.collection(path)
      .orderBy('timestamp', 'desc')
      .limit(50)
      .get();
    
    const notificationsList = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.json(notificationsList);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const path = `notifications/${id}`;
  try {
    await db.collection('notifications').doc(id).update({ read: true });
    res.json({ success: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

export const markAllAsRead = async (req: Request, res: Response) => {
  const path = 'notifications';
  try {
    const snapshot = await db.collection(path).where('read', '==', false).get();
    const batch = db.batch();
    snapshot.docs.forEach((doc: any) => {
      batch.update(doc.ref, { read: true });
    });
    await batch.commit();
    res.json({ success: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};
