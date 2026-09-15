import { deal, emptyBoard, type GameState, type MoveResult, type Piece } from './game';
import { shapeById } from './shapes';

export interface DailyChallenge {
  id: string;
  kind: 'score' | 'blue' | 'combo';
  target: number;
  limit: number;
  title: string;
  description: string;
}
export interface DailyRun {
  challenge: DailyChallenge;
  state: GameState;
  progress: number;
  outcome: 'playing' | 'won' | 'lost';
  rng: () => number;
  dealer: typeof deal;
}
export function dayId(now = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
}
export function timeToRefresh(now = new Date()): string {
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()+1);
  const seconds = Math.max(0, Math.ceil((midnight.getTime()-now.getTime())/1000));
  return [Math.floor(seconds/3600), Math.floor(seconds/60)%60, seconds%60].map(n=>String(n).padStart(2,'0')).join(':');
}
function seedFor(id: string): number {
  return [...id].reduce((seed,c)=>Math.imul(seed ^ c.charCodeAt(0),16777619)>>>0,2166136261);
}
function seededRandom(seed: number): () => number {
  return () => { seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296; };
}
export function dailyChallenge(id = dayId()): DailyChallenge {
  const day = Math.floor(Date.parse(`${id}T00:00:00Z`)/86400000);
  const kind = (['score','blue','combo'] as const)[((day%3)+3)%3];
  const variant = seedFor(id)%3;
  const target = kind==='score' ? [1000,1250,1500][variant] : kind==='blue' ? [5,7,9][variant] : 5;
  const limit = kind==='score' ? 15 : kind==='blue' ? 20 : 50;
  const title = kind==='score' ? 'Охота за очками' : kind==='blue' ? 'Синие сокровища' : 'В ритме комбо';
  const description = kind==='score' ? `Набери ${target} очков за ${limit} ходов` : kind==='blue' ? `Собери ${target} синих блоков за ${limit} ходов` : `Достигни комбо ×${target} за ${limit} ходов`;
  return {id,kind,target,limit,title,description};
}
/** Date-seeded puzzle with a guaranteed five-clear solution. The opening six
 * pieces match its row gaps; subsequent hands use the normal seeded dealer. */
export function startDaily(challenge = dailyChallenge()): DailyRun {
  const rng = seededRandom(seedFor(challenge.id));
  const board = emptyBoard(), rows = Array.from({length:8},(_,i)=>i);
  for(let i=7;i>0;i--){const j=Math.floor(rng()*(i+1));[rows[i],rows[j]]=[rows[j],rows[i]];}
  const pieces: Piece[] = [];
  for(let i=0;i<6;i++){
    const length = 1+Math.floor(rng()*4), gap = Math.floor(rng()*(9-length));
    pieces.push({shape:shapeById(length===1?'single-0':`line${length}-0`),color:1+Math.floor(rng()*6)});
    if(i<5){
      const y=rows[i];
      for(let x=0;x<8;x++)if(x<gap || x>=gap+length)board[y][x]=1+Math.floor(rng()*6);
      // At least two blue cells per row, independent of the player's skin.
      const filled=board[y].map((v,x)=>v?x:-1).filter(x=>x>=0);
      board[y][filled[0]]=3;board[y][filled[1]]=3;
    }
  }
  let firstRefill = true;
  const dealer: typeof deal = (board, random=rng) => {
    if(firstRefill){firstRefill=false;return pieces.slice(3);}
    return deal(board,random);
  };
  return {challenge,rng,dealer,progress:0,outcome:'playing',state:{board,hand:pieces.slice(0,3),score:0,moves:0,combo:1,misses:0,hasCombo:false,lines:0,status:'playing'}};
}
export function advanceDaily(run: DailyRun, move: MoveResult): void {
  if(run.outcome!=='playing')return;
  run.state=move.state;
  run.progress=run.challenge.kind==='score' ? move.state.score : run.challenge.kind==='combo'
    ? Math.max(run.progress,move.clear.cells.length ? move.multiplier : 0)
    : run.progress+move.clear.cells.filter(([x,y])=>move.beforeClear[y][x]===3).length;
  // Completing the objective on the last move (even a blocked board) wins.
  run.outcome=run.progress>=run.challenge.target ? 'won' : move.state.moves>=run.challenge.limit || move.state.status==='blocked' ? 'lost' : 'playing';
}
