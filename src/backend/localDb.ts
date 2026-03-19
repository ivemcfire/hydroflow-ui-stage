// File: src/backend/localDb.ts
import { mockDb, mockAuth } from './mockDb';

// Local Persistent Database (SQLite-backed)
export const db = mockDb as any;
export const auth = mockAuth as any;

export default {
  apps: [],
  initializeApp: () => {},
  app: () => ({}),
};
