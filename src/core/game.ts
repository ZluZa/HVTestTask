import { SHAPES, shapeById, type Shape, type Cell } from './shapes';
export const SIZE=8;
export type Board = number[][];
export interface Piece { shape:Shape; color:number }
export interface GameState { board:Board; hand:(Piece|null)[]; score:number; moves:number; combo:number; misses:number; hasCombo:boolean; lines:number; status:'playing'|'blocked' }
export interface Clear { rows:number[]; columns:number[]; cells:Cell[] }
export interface MoveResult { state:GameState; placed:Cell[]; clear:Clear; beforeClear:Board; points:number; multiplier:number; allClear:boolean }
export const emptyBoard=():Board=>Array.from({length:SIZE},()=>Array(SIZE).fill(0));
export function canPlace(board:Board,shape:Shape,x:number,y:number):boolean { return Number.isInteger(x)&&Number.isInteger(y)&&shape.cells.every(([dx,dy])=>x+dx>=0&&y+dy>=0&&x+dx<SIZE&&y+dy<SIZE&&board[y+dy][x+dx]===0); }
export function fits(board:Board,shape:Shape):boolean { for(let y=0;y<SIZE;y++)for(let x=0;x<SIZE;x++)if(canPlace(board,shape,x,y))return true;return false; }
export function findLines(board:Board):Clear { const rows:number[]=[],columns:number[]=[]; for(let i=0;i<SIZE;i++){if(board[i].every(Boolean))rows.push(i);if(board.every(r=>r[i]!==0))columns.push(i);} const cells:Cell[]=[];for(let y=0;y<SIZE;y++)for(let x=0;x<SIZE;x++)if(rows.includes(y)||columns.includes(x))cells.push([x,y]); return {rows,columns,cells}; }
export function deal(board:Board,rng:()=>number=Math.random):Piece[]{ const pick=<T>(a:T[]):T=>a[Math.min(a.length-1,Math.floor(rng()*a.length))]; const possible=SHAPES.filter(s=>fits(board,s)); const hand=[pick(possible.length?possible:SHAPES),pick(SHAPES),pick(SHAPES)].map(shape=>({shape,color:1+Math.floor(rng()*6)})); const index=Math.min(2,Math.floor(rng()*3)); [hand[0],hand[index]]=[hand[index],hand[0]];return hand; }
export function newGame():GameState { const board=emptyBoard();for(const y of [2,5])for(let x=0;x<=5;x++)board[y][x]=1+x%6;return {board,hand:[{shape:shapeById('line2-0'),color:1},{shape:shapeById('line2-1'),color:3},{shape:shapeById('single-0'),color:5}],score:0,moves:0,combo:1,misses:0,hasCombo:false,lines:0,status:'playing'}; }
export function preview(board:Board,piece:Piece,x:number,y:number):Clear|null { if(!canPlace(board,piece.shape,x,y))return null;const next=board.map(r=>[...r]);for(const [dx,dy]of piece.shape.cells)next[y+dy][x+dx]=piece.color;return findLines(next); }
export function place(state:GameState,slot:number,x:number,y:number,rng:()=>number=Math.random,dealer:typeof deal=deal):MoveResult|null {
 const piece=state.hand[slot];if(state.status!=='playing'||!piece||!canPlace(state.board,piece.shape,x,y))return null;
 const board=state.board.map(r=>[...r]);const placed=piece.shape.cells.map(([dx,dy])=>[x+dx,y+dy] as Cell);for(const[cx,cy]of placed)board[cy][cx]=piece.color;
 const clear=findLines(board),count=clear.rows.length+clear.columns.length,beforeClear=board.map(r=>[...r]);for(const[cx,cy]of clear.cells)board[cy][cx]=0;
 const misses=count?0:state.misses+1,hasCombo=count>0||state.hasCombo&&misses<3;
 const combo=count?(state.hasCombo?state.combo+1:1):(misses>=3?1:state.combo);
 const allClear=board.every(r=>r.every(c=>c===0));const points=5*placed.length+100*count*count*combo+(allClear?300:0);
 const hand=[...state.hand];hand[slot]=null;const moves=state.moves+1;
 const next:GameState={board,hand:hand.every(p=>p===null)?dealer(board,rng):hand,score:state.score+points,moves,combo,misses,hasCombo,lines:state.lines+count,status:'playing'};
 next.status=next.hand.some(p=>p&&fits(board,p.shape))?'playing':'blocked';
 return {state:next,placed,clear,beforeClear,points,multiplier:combo,allClear};
}
