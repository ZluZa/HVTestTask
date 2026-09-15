import { it, expect } from 'vitest';
import { advanceDaily, dailyChallenge, dayId, startDaily, timeToRefresh } from '../src/core/daily';
import { emptyBoard, place } from '../src/core/game';
import { shapeById } from '../src/core/shapes';
import { claimDailyChest } from '../src/meta/chests';
import { initialMeta, parseMeta } from '../src/meta/store';
import { solveDaily, play } from './daily-route';

it('generates reproducible, different puzzles with all objective types and a solution across a full year',()=>{
 const kinds=new Set<string>(),boards=new Set<string>();
 for(let n=0;n<365;n++){
  const id=new Date(Date.UTC(2026,0,1+n)).toISOString().slice(0,10);
  const a=startDaily(dailyChallenge(id)),b=startDaily(dailyChallenge(id));
  expect(a.state).toEqual(b.state);boards.add(JSON.stringify(a.state.board));kinds.add(a.challenge.kind);
  const {run}=solveDaily(id);expect(run.outcome,id).toBe('won');expect(run.state.moves).toBeLessThanOrEqual(run.challenge.limit);
 }
 expect(kinds.size).toBe(3);expect(boards.size).toBe(365);
});
it('counts cleared blue cells once at a row/column intersection, excluding placement-only cells',()=>{
 const run=startDaily({...dailyChallenge(),kind:'blue',target:100});
 run.state.board=emptyBoard();for(let i=0;i<8;i++){run.state.board[2][i]=3;run.state.board[i][4]=3;}
 run.state.board[2][4]=0;run.state.hand=[{shape:shapeById('single-0'),color:3},null,null];
 play(run,0,4,2);expect(run.progress).toBe(15);
});
it('invalid placements consume no moves and placed blue blocks alone do not advance the objective',()=>{
 const run=startDaily({...dailyChallenge(),kind:'blue',target:100});run.state.board=emptyBoard();
 run.state.hand=[{shape:shapeById('single-0'),color:3},null,null];
 expect(play(run,0,-1,0)).toBeNull();expect(run.state.moves).toBe(0);
 play(run,0,0,0);expect(run.progress).toBe(0);expect(run.state.moves).toBe(1);
});
it('success on the final allowed move takes priority over failure; an unmet goal loses at the limit',()=>{
 for(const target of [5,6]){
  const run=startDaily({...dailyChallenge(),kind:'score',target,limit:1});run.state.board=emptyBoard();run.state.board[7][7]=1;
  run.state.hand=[{shape:shapeById('single-0'),color:3},null,null];play(run,0,0,0);
  expect(run.outcome).toBe(target===5?'won':'lost');
 }
});
it('blocked boards end the attempt and completed runs cannot continue updating',()=>{
 const run=startDaily({...dailyChallenge(),target:99999});
 const move=place(run.state,0,0,7);expect(move).not.toBeNull();move!.state.status='blocked';advanceDaily(run,move!);
 expect(run.outcome).toBe('lost');const progress=run.progress;advanceDaily(run,{...move!,points:99999});expect(run.progress).toBe(progress);
});
it('awards a free rare chest exactly once, persists the claim and refunds duplicates to lighthouse',()=>{
 const {run}=solveDaily('2026-09-16');const meta=initialMeta();
 const reward=claimDailyChest(meta,run,()=>0)!;
 expect(reward.chestRarity).toBe('rare');expect(reward.duplicate).toBe(true);
 expect(reward.state.collectionBalances).toEqual({glasshouse:0,lighthouse:25,townhouse:0});
 expect(reward.state.completedCollections).toEqual([]);expect(meta.dailyClaimed).toEqual([]);
 const restored=parseMeta(JSON.parse(JSON.stringify(reward.state)));
 expect(claimDailyChest(restored,run)).toBeNull();
 expect(claimDailyChest(meta,startDaily())).toBeNull();
 const unlocked=claimDailyChest(meta,run,()=>.5)!;expect(unlocked.duplicate).toBe(false);
 expect(unlocked.state.unlockedThemes).toContain(unlocked.theme.id);expect(unlocked.state.collectionBalances.lighthouse).toBe(0);
});
it('uses local midnight, including year rollover, and sanitizes old/malformed saves',()=>{
 expect(dayId(new Date(2026,11,31,23,59,59))).toBe('2026-12-31');
 expect(timeToRefresh(new Date(2026,11,31,23,59,59))).toBe('00:00:01');
 expect(timeToRefresh(new Date(2027,0,1,0,0,0))).toBe('24:00:00');
 expect(parseMeta({version:3,dailyClaimed:['2026-09-16','2026-09-16','bad',22]}).dailyClaimed).toEqual(['2026-09-16']);
 expect(parseMeta({version:2}).dailyClaimed).toEqual([]);
});
