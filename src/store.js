import fs from 'node:fs/promises';
import path from 'node:path';

const file = path.resolve('data/state.json');

export async function loadState() {
  try { return JSON.parse(await fs.readFile(file, 'utf8')); }
  catch { return { lastCheckedAt: 0, processedIds: [] }; }
}

export async function saveState(state) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  state.processedIds = state.processedIds.slice(-500);
  await fs.writeFile(file, JSON.stringify(state, null, 2));
}
