import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';

const here = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(here, '../../data');
const dbFile = path.join(dataDir, 'library.json');
const empty = { users: [], books: [], members: [], loans: [] };
let queue = Promise.resolve();

export async function readDB() {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    const parsed = JSON.parse(await fs.readFile(dbFile, 'utf8'));
    return { ...structuredClone(empty), ...parsed };
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    await writeDB(empty);
    return structuredClone(empty);
  }
}
export async function writeDB(data) {
  await fs.mkdir(dataDir, { recursive: true });
  const temp = `${dbFile}.tmp`;
  await fs.writeFile(temp, JSON.stringify(data, null, 2));
  await fs.rename(temp, dbFile);
}
export async function updateDB(mutator) {
  const operation = queue.then(async () => {
    const db = await readDB();
    const result = await mutator(db);
    await writeDB(db);
    return result;
  });
  queue = operation.catch(() => {});
  return operation;
}
export const newId = () => randomUUID();
export const now = () => new Date().toISOString();
export function byNewest(items) { return [...items].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)); }
