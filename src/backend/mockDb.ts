// File: src/backend/mockDb.ts
import db from './database';

class MockDoc {
  id: string;
  collectionName: string;

  constructor(id: string, collectionName: string) {
    this.id = id;
    this.collectionName = collectionName;
  }

  get ref() {
    return this;
  }

  collection(name: string) {
    return mockDb.collection(`${this.collectionName}/${this.id}/${name}`);
  }

  async get() {
    const row = db.prepare('SELECT data FROM documents WHERE collection = ? AND id = ?').get(this.collectionName, this.id) as any;
    const data = row ? JSON.parse(row.data) : null;
    return {
      id: this.id,
      exists: !!row,
      data: () => data,
    };
  }

  async update(newData: any) {
    const existing = await this.get();
    const data = existing.exists ? { ...existing.data(), ...newData } : newData;
    db.prepare('INSERT OR REPLACE INTO documents (collection, id, data) VALUES (?, ?, ?)').run(this.collectionName, this.id, JSON.stringify(data));
  }

  async set(newData: any) {
    db.prepare('INSERT OR REPLACE INTO documents (collection, id, data) VALUES (?, ?, ?)').run(this.collectionName, this.id, JSON.stringify(newData));
  }

  async delete() {
    db.prepare('DELETE FROM documents WHERE collection = ? AND id = ?').run(this.collectionName, this.id);
  }
}

class MockCollection {
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  doc(id?: string) {
    const docId = id || Math.random().toString(36).substr(2, 9);
    return new MockDoc(docId, this.name);
  }

  async add(data: any) {
    const id = Math.random().toString(36).substr(2, 9);
    db.prepare('INSERT INTO documents (collection, id, data) VALUES (?, ?, ?)').run(this.name, id, JSON.stringify(data));
    return new MockDoc(id, this.name);
  }

  async get() {
    const rows = db.prepare('SELECT id, data FROM documents WHERE collection = ?').all(this.name) as any[];
    const docs = rows.map(row => ({
      id: row.id,
      data: () => JSON.parse(row.data),
    }));
    return { docs };
  }

  orderBy() { return this; }
  limit() { return this; }
  
  where(field: string, op: string, value: any) {
    // Basic filtering in memory for now, can be optimized to SQL later if needed
    return {
      get: async () => {
        const all = await this.get();
        const filtered = all.docs.filter(doc => {
          const data = doc.data();
          if (op === '==') return data[field] === value;
          if (op === '>') return data[field] > value;
          if (op === '<') return data[field] < value;
          return false;
        });
        return { docs: filtered };
      }
    } as any;
  }
}

class MockDb {
  collection(name: string) {
    return new MockCollection(name);
  }

  batch() {
    return {
      set: (ref: MockDoc, data: any) => ref.set(data),
      update: (ref: MockDoc, data: any) => ref.update(data),
      delete: (ref: MockDoc) => ref.delete(),
      commit: () => Promise.resolve(),
    };
  }
}

export const mockDb = new MockDb();

export const mockAuth = {
  verifyIdToken: () => Promise.resolve({ uid: 'mock-user' }),
  getUser: () => Promise.resolve({ uid: 'mock-user', email: 'mock@example.com' }),
};
