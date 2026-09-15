import { COLLECTIONS, THEMES, type ChestRarity, type Theme } from './catalog';
import type { MetaState } from './store';
import type { DailyRun } from '../core/daily';

/** Percentage of skin rarity per chest; each row sums to 100. */
export const CHEST_ODDS: Record<ChestRarity, Record<ChestRarity, number>> = {
  common: { common: 75, rare: 20, legendary: 5 },
  rare: { common: 35, rare: 45, legendary: 20 },
  legendary: { common: 10, rare: 50, legendary: 40 },
};
export const DUPLICATE_PARTS = 25;
export interface ChestReward {
  state: MetaState;
  collectionId: string;
  chestRarity: ChestRarity;
  theme: Theme;
  duplicate: boolean;
  refund: number;
}

export function rollSkin(chest: ChestRarity, rng = Math.random): Theme {
  const roll = rng() * 100;
  let threshold = 0;
  let rarity: ChestRarity = 'legendary';
  for (const candidate of ['common', 'rare', 'legendary'] as const) {
    threshold += CHEST_ODDS[chest][candidate];
    if (roll < threshold) { rarity = candidate; break; }
  }
  // Owned skins (including the starter) remain in the pool: no reroll protection.
  const pool = THEMES.filter(theme => theme.rarity === rarity);
  return pool[Math.min(pool.length - 1, Math.floor(rng() * pool.length))];
}

/** One synchronous transaction: spend, roll, unlock/refund, remember assembled art. */
export function openChest(meta: MetaState, collectionId: string, rng = Math.random): ChestReward | null {
  const collection = COLLECTIONS.find(c => c.id === collectionId);
  if (!collection || meta.collectionBalances[collectionId] < collection.partCount) return null;
  const theme = rollSkin(collection.rarity, rng);
  const duplicate = meta.unlockedThemes.includes(theme.id);
  const refund = duplicate ? DUPLICATE_PARTS : 0;
  return {
    collectionId,
    chestRarity: collection.rarity,
    theme,
    duplicate,
    refund,
    state: {
      ...meta,
      unlockedThemes: duplicate ? [...meta.unlockedThemes] : [...meta.unlockedThemes, theme.id],
      collectionBalances: { ...meta.collectionBalances, [collectionId]: meta.collectionBalances[collectionId] - collection.partCount + refund },
      completedCollections: [...new Set([...meta.completedCollections, collectionId])],
    },
  };
}

/** Daily completion and reward are saved together; retries cannot spend or reroll. */
export function claimDailyChest(meta: MetaState, run: DailyRun, rng = Math.random): ChestReward | null {
  if(run.outcome!=='won' || meta.dailyClaimed.includes(run.challenge.id))return null;
  const theme=rollSkin('rare',rng), duplicate=meta.unlockedThemes.includes(theme.id);
  const refund=duplicate ? DUPLICATE_PARTS : 0;
  return {collectionId:'lighthouse',chestRarity:'rare',theme,duplicate,refund,state:{
    ...meta,
    dailyClaimed:[...meta.dailyClaimed,run.challenge.id],
    unlockedThemes:duplicate ? [...meta.unlockedThemes] : [...meta.unlockedThemes,theme.id],
    collectionBalances:{...meta.collectionBalances,lighthouse:meta.collectionBalances.lighthouse+refund},
  }};
}
