import fs from 'fs';
import path from 'path';

// Use /tmp for Vercel Serverless environments
const dbPath = process.env.NODE_ENV === 'production' 
  ? '/tmp/responses.json' 
  : path.join(process.cwd(), 'responses.json');

export function getDb() {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify([]));
  }
  return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
}

export function saveDb(data: any) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

export function getCandidateResponse(email: string) {
  const db = getDb();
  return db.find((c: any) => c.email === email) || null;
}

export function updateCandidateResponse(email: string, updates: any) {
  const db = getDb();
  const index = db.findIndex((c: any) => c.email === email);
  if (index >= 0) {
    db[index] = { ...db[index], ...updates };
  } else {
    db.push({ email, createdAt: new Date().toISOString(), ...updates });
  }
  saveDb(db);
}
