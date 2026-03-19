// File: src/backend/database.ts
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'hydroflow.db');
const db = new Database(dbPath);

// Initialize the database
db.exec(`
  CREATE TABLE IF NOT EXISTS documents (
    collection TEXT,
    id TEXT,
    data TEXT,
    PRIMARY KEY (collection, id)
  );
`);

export default db;
