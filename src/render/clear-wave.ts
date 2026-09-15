import type { MoveResult } from '../core/game';
import type { Cell } from '../core/shapes';

export const WAVE_STEP_MS = 36;
export const BLOCK_FLASH_MS = 22;
export const BLOCK_BREAK_MS = 62;
export const PARTICLE_MS = 150;
export interface WaveCell { cell: Cell; delay: number }

/** Waves travel along each completed line from the newly placed contact cells.
 * If two waves reach an intersection, its one cell breaks at the earliest arrival.
 */
export function clearWave(result: MoveResult): WaveCell[] {
  return result.clear.cells.map(cell => {
    const [x, y] = cell;
    const distances: number[] = [];
    if (result.clear.rows.includes(y)) {
      for (const [px, py] of result.placed) {
        if (py === y) distances.push(Math.abs(x - px));
      }
    }
    if (result.clear.columns.includes(x)) {
      for (const [px, py] of result.placed) {
        if (px === x) distances.push(Math.abs(y - py));
      }
    }
    return { cell, delay: Math.min(...distances) * WAVE_STEP_MS };
  });
}

export function moveAnimationDuration(result: MoveResult, reduced: boolean): number {
  if (reduced) return 90;
  return Math.max(220, ...clearWave(result).map(c => c.delay + PARTICLE_MS));
}
