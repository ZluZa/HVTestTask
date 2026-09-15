import { COLLECTIONS } from './catalog';
import type { MoveResult } from '../core/game';
import type { MetaState } from './store';

export interface CollectionAward { collectionId: string; amount: number }
export interface RewardResult { state: MetaState; awards: CollectionAward[]; total: number }

export function rollCollection(rng: () => number = Math.random): string {
  const total = COLLECTIONS.reduce((sum, c) => sum + c.dropWeight, 0);
  const roll = rng() * total;
  let threshold = 0;
  for (const collection of COLLECTIONS) {
    threshold += collection.dropWeight;
    if (roll < threshold) return collection.id;
  }
  return COLLECTIONS[COLLECTIONS.length - 1].id;
}

/** One independent type roll per cleared row/column, then multiply that award by combo.
 * Unlike score, currency grows linearly with line count. Chest spending is isolated in chests.ts.
 */
export function rewardPlacement(meta: MetaState, result: MoveResult, rng = Math.random): RewardResult {
  const lineCount = result.clear.rows.length + result.clear.columns.length;
  if (lineCount === 0) return { state: meta, awards: [], total: 0 };
  const awarded = new Map<string, number>();
  for (let line = 0; line < lineCount; line++) {
    const id = rollCollection(rng);
    awarded.set(id, (awarded.get(id) || 0) + result.multiplier);
  }
  const collectionBalances = { ...meta.collectionBalances };
  const awards = [...awarded].map(([collectionId, amount]) => {
    collectionBalances[collectionId] += amount;
    return { collectionId, amount };
  });
  return { state: { ...meta, collectionBalances }, awards, total: lineCount * result.multiplier };
}

export function collectionProgress(meta: MetaState, id: string): number {
  const collection = COLLECTIONS.find(c => c.id === id);
  return collection ? Math.min(collection.partCount, meta.collectionBalances[id] || 0) : 0;
}
