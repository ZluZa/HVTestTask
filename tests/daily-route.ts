import { advanceDaily, dailyChallenge, startDaily, type DailyRun } from '../src/core/daily';
import { place, preview } from '../src/core/game';
export function solveDaily(id:string){
 const run=startDaily(dailyChallenge(id));const route:{slot:number;x:number;y:number}[]=[];
 while(run.outcome==='playing'&&route.length<6){
  const slot=run.state.hand.findIndex(Boolean),piece=run.state.hand[slot]!;
  let target:{slot:number;x:number;y:number}|undefined;
  for(let y=0;y<8&&!target;y++)for(let x=0;x<8;x++){
   if(preview(run.state.board,piece,x,y)?.rows.length){target={slot,x,y};break;}
  }
  if(!target)throw new Error(`No clear for ${id}, step ${route.length}`);
  route.push(target);advanceDaily(run,place(run.state,slot,target.x,target.y,run.rng,run.dealer)!);
 }
 return {run,route};
}
export function play(run:DailyRun,slot:number,x:number,y:number){
 const move=place(run.state,slot,x,y,run.rng,run.dealer);
 if(move)advanceDaily(run,move);return move;
}
