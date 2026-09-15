import { it, expect } from 'vitest';
import { emptyBoard, newGame, place } from '../src/core/game';
import { shapeById } from '../src/core/shapes';
import { clearWave, WAVE_STEP_MS, moveAnimationDuration } from '../src/render/clear-wave';
function cross(x:number,y:number){const s=newGame();s.board=emptyBoard();for(let i=0;i<8;i++){s.board[y][i]=1;s.board[i][x]=1;}s.board[y][x]=0;s.hand=[{shape:shapeById('single-0'),color:1},null,null];return place(s,0,x,y)!;}
it('a wave from a middle contact spreads toward both ends of each axis',()=>{const r=cross(3,4),wave=clearWave(r);for(const{cell:[x,y],delay}of wave)expect(delay).toBe((Math.abs(x-3)+Math.abs(y-4))*WAVE_STEP_MS);expect(wave).toHaveLength(15);expect(wave.filter(c=>c.cell[0]===3&&c.cell[1]===4)).toHaveLength(1);});
it('Lotus right-edge placement clears from the right, never from board origin',()=>{const r=place(newGame(),0,6,2)!,wave=clearWave(r);expect(wave.map(c=>c.delay)).toEqual([6,5,4,3,2,1,0,0].map(n=>n*WAVE_STEP_MS));expect(moveAnimationDuration(r,false)).toBeLessThan(400);expect(moveAnimationDuration(r,true)).toBe(90);});
it('each simultaneously completed row uses its own contact cells',()=>{const s=newGame();s.board=emptyBoard();for(const y of [2,3])for(let x=0;x<8;x++)if(x!==5)s.board[y][x]=1;s.hand=[{shape:shapeById('line2-1'),color:1},null,null];const r=place(s,0,5,2)!;expect(clearWave(r)).toHaveLength(16);for(const{cell:[x],delay}of clearWave(r))expect(delay).toBe(Math.abs(x-5)*WAVE_STEP_MS);});
