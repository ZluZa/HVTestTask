import { COLLECTIONS, THEMES } from './catalog';

export interface MetaState {
  version: 3;
  selectedTheme: string;
  unlockedThemes: string[];
  completedCollections: string[];
  /** Separate currency balances. Excess above completion cost stays in the wallet. */
  collectionBalances: Record<string, number>;
  dailyClaimed: string[];
}
export const STORAGE_KEY = 'block-build.meta.v3';
const LEGACY_KEYS = ['block-build.meta.v2', 'block-build.meta.v1'];
export const initialMeta = (): MetaState => ({
  version: 3,
  selectedTheme: 'lotus',
  unlockedThemes: ['lotus'],
  completedCollections: [],
  dailyClaimed: [],
  collectionBalances: Object.fromEntries(COLLECTIONS.map(c => [c.id, 0])),
});

export function parseMeta(input: unknown): MetaState {
  const fallback = initialMeta();
  if (!input || typeof input !== 'object') return fallback;
  const raw = input as Record<string, unknown>;
  if (raw.version !== 1 && raw.version !== 2 && raw.version !== 3) return fallback;
  const unlocked = raw.version === 3 && Array.isArray(raw.unlockedThemes)
    ? [...new Set(raw.unlockedThemes.filter((id): id is string =>
      typeof id === 'string' && THEMES.some(t => t.id === id)))]
    : fallback.unlockedThemes;
  if (!unlocked.includes('lotus')) unlocked.unshift('lotus');
  const selected = typeof raw.selectedTheme === 'string' && unlocked.includes(raw.selectedTheme)
    ? raw.selectedTheme : 'lotus';
  const balances = raw.collectionBalances as Record<string, unknown> | undefined;
  const legacyParts = raw.collectionParts as Record<string, unknown> | undefined;
  return {
    version: 3,
    dailyClaimed: Array.isArray(raw.dailyClaimed) ? [...new Set(raw.dailyClaimed.filter((id): id is string => typeof id==='string' && /^\d{4}-\d{2}-\d{2}$/.test(id) && !Number.isNaN(Date.parse(`${id}T00:00:00Z`))))] : [],
    selectedTheme: selected,
    unlockedThemes: unlocked,
    completedCollections: Array.isArray(raw.completedCollections) ? [...new Set(raw.completedCollections.filter((id): id is string => typeof id === 'string' && COLLECTIONS.some(c => c.id === id)))] : [],
    collectionBalances: Object.fromEntries(COLLECTIONS.map(c => {
      let amount = balances?.[c.id];
      if (raw.version === 1) {
        const parts = legacyParts?.[c.id];
        amount = Array.isArray(parts)
          ? new Set(parts.filter(n => Number.isInteger(n) && n >= 0 && n < 9)).size : 0;
      }
      return [c.id, typeof amount === 'number' && Number.isSafeInteger(amount) && amount >= 0 ? amount : 0];
    })),
  };
}

export function loadMeta(): MetaState {
  try {
    const current = localStorage.getItem(STORAGE_KEY);
    if (current !== null) return parseMeta(JSON.parse(current));
    for (const key of LEGACY_KEYS) {
      const legacy = localStorage.getItem(key);
      if (legacy !== null) return parseMeta(JSON.parse(legacy));
    }
    return initialMeta();
  } catch { return initialMeta(); }
}

export function saveMeta(state: MetaState): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  catch { /* Storage restrictions must not interrupt the game. */ }
}
