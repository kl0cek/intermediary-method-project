// src/lib/db.ts
import { Database } from 'sqlite3';
import { join } from 'path';

const dbFile = join(process.cwd(), 'data', 'db.sqlite');
const db = new Database(dbFile);

db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS projects (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       name TEXT,
       input TEXT,
       result TEXT,
       created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
       updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
     );`
  );
});

export default db;