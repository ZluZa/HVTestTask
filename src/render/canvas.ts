import { preview, type GameState, type MoveResult, type Piece } from '../core/game';
import type { Theme } from '../meta/catalog';
import { clearWave, moveAnimationDuration, BLOCK_FLASH_MS, BLOCK_BREAK_MS, PARTICLE_MS, type WaveCell } from './clear-wave';
export interface Hover {slot:number;x:number;y:number}
function rounded(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,r:number){ctx.beginPath();ctx.roundRect(x,y,w,h,r);}
export function block(ctx:CanvasRenderingContext2D,x:number,y:number,size:number,color:string,alpha=1){
 ctx.save();ctx.globalAlpha=alpha;const gap=size*.065;x+=gap;y+=gap;const s=size-gap*2;
 ctx.fillStyle='#071518';rounded(ctx,x,y+3,s,s,Math.max(3,s*.12));ctx.fill();
 const g=ctx.createLinearGradient(x,y,x,y+s);g.addColorStop(0,color);g.addColorStop(1,color);ctx.fillStyle=g;rounded(ctx,x,y,s,s,Math.max(3,s*.12));ctx.fill();
 ctx.fillStyle='#ffffff40';ctx.beginPath();ctx.moveTo(x+3,y+2);ctx.lineTo(x+s-3,y+2);ctx.lineTo(x+s-8,y+8);ctx.lineTo(x+8,y+8);ctx.fill();
 ctx.fillStyle='#00000024';ctx.beginPath();ctx.moveTo(x+s-2,y+3);ctx.lineTo(x+s-2,y+s-3);ctx.lineTo(x+3,y+s-3);ctx.lineTo(x+8,y+s-9);ctx.lineTo(x+s-8,y+s-9);ctx.lineTo(x+s-8,y+8);ctx.fill();ctx.restore();
}
export function drawPiece(canvas:HTMLCanvasElement,piece:Piece|null,theme:Theme){const w=canvas.clientWidth||120,h=canvas.clientHeight||94,dpr=Math.min(devicePixelRatio||1,2);canvas.width=w*dpr;canvas.height=h*dpr;const ctx=canvas.getContext('2d')!;ctx.scale(dpr,dpr);if(!piece)return;const s=Math.min(27,(w-18)/piece.shape.width,(h-16)/piece.shape.height);const x=(w-s*piece.shape.width)/2,y=(h-s*piece.shape.height)/2;for(const[dx,dy]of piece.shape.cells)block(ctx,x+dx*s,y+dy*s,s,theme.colors[piece.color-1]);}
export class BoardRenderer {
 private ctx:CanvasRenderingContext2D;private animation:{result:MoveResult;start:number;wave:WaveCell[]}|null=null;private raf=0;
 state:GameState;theme:Theme;hover:Hover|null=null;reduced=matchMedia('(prefers-reduced-motion: reduce)');
 constructor(public canvas:HTMLCanvasElement,state:GameState,theme:Theme){this.ctx=canvas.getContext('2d')!;this.state=state;this.theme=theme;new ResizeObserver(()=>this.draw()).observe(canvas);this.reduced.addEventListener('change',()=>this.draw());this.draw();}
 set(state:GameState,theme=this.theme){this.state=state;this.theme=theme;this.draw();}
 showHover(hover:Hover|null){this.hover=hover;this.draw();}
 animate(result:MoveResult){this.animation={result,start:performance.now(),wave:clearWave(result)};cancelAnimationFrame(this.raf);this.draw();return moveAnimationDuration(result,this.reduced.matches);}
 draw=()=>{
 cancelAnimationFrame(this.raf);
 const size=this.canvas.clientWidth||440,dpr=Math.min(devicePixelRatio||1,2);if(this.canvas.width!==Math.round(size*dpr)){this.canvas.width=Math.round(size*dpr);this.canvas.height=Math.round(size*dpr);}const ctx=this.ctx;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,size,size);const s=size/8;
 const anim=this.animation,t=anim?performance.now()-anim.start:0,duration=anim?moveAnimationDuration(anim.result,this.reduced.matches):0;
 if(anim&&t>=duration)this.animation=null;
 ctx.save();if(this.animation&&!this.reduced.matches&&anim!.result.clear.cells.length){const shake=Math.max(0,1-t/160)*3.5;ctx.translate(Math.sin(t*.07)*shake,Math.cos(t*.09)*shake);}
 ctx.fillStyle=this.theme.board;ctx.fillRect(0,0,size,size);
 for(let y=0;y<8;y++)for(let x=0;x<8;x++){
 ctx.fillStyle=this.theme.cell;rounded(ctx,x*s+2,y*s+2,s-4,s-4,6);ctx.fill();
 const value=this.state.board[y][x];if(value){const placed=this.animation?.result.placed.some(([px,py])=>px===x&&py===y);const pop=placed&&!this.reduced.matches?Math.sin(Math.min(1,t/200)*Math.PI)*.09:0;block(ctx,x*s-pop*s/2,y*s-pop*s/2,s*(1+pop),this.theme.colors[value-1]);}
 }
 if (this.animation) {
   const { result, wave } = this.animation;
   for (const { cell: [x, y], delay } of wave) {
     const color = this.theme.colors[result.beforeClear[y][x] - 1];
     if (this.reduced.matches) {
       block(ctx, x*s, y*s, s, color, Math.max(0, 1-t/90));
       continue;
     }
     const age = t-delay;
     if (age < 0) {
       block(ctx, x*s, y*s, s, color);
       continue;
     }
     if (age < BLOCK_FLASH_MS) {
       block(ctx, x*s, y*s, s, color);
       ctx.fillStyle = '#eafff0b0';
       rounded(ctx, x*s+3, y*s+3, s-6, s-6, 5);
       ctx.fill();
     } else {
       // A quick snap inward instead of a long transparent dissolve.
       const progress = Math.min(1, (age-BLOCK_FLASH_MS)/BLOCK_BREAK_MS);
       const scale = (1-progress)*(1-progress);
       if (scale > 0) {
         ctx.save();
         ctx.translate((x+.5)*s, (y+.5)*s);
         ctx.scale(scale, scale);
         block(ctx, -s/2, -s/2, s, color);
         ctx.restore();
       }
     }
     if (age < PARTICLE_MS) {
       const progress = age/PARTICLE_MS;
       ctx.globalAlpha = (1-progress)*(1-progress);
       for (let k=0; k<4; k++) {
         ctx.fillStyle = k%2 ? color : this.theme.accent;
         const angle = (x*7+y*3+k)*2.4;
         const travel = Math.sqrt(progress)*s*.65;
         ctx.fillRect((x+.5)*s+Math.cos(angle)*travel, (y+.5)*s+Math.sin(angle)*travel, 4, 4);
       }
       ctx.globalAlpha = 1;
     }
   }
 }
 if (this.hover && this.state.status === 'playing' && !this.animation) {
   const { slot, x, y } = this.hover;
   const piece = this.state.hand[slot];
   const clear = piece ? preview(this.state.board, piece, x, y) : null;
   if (piece && clear) {
     for (const [dx, dy] of piece.shape.cells) {
       ctx.fillStyle = '#9cf1cf65';
       rounded(ctx, (x+dx)*s+2, (y+dy)*s+2, s-4, s-4, 6);
       ctx.fill();
       ctx.strokeStyle = this.theme.accent;
       ctx.lineWidth = 2;
       ctx.stroke();
     }
     ctx.fillStyle = '#b8ffdf4a';
     for (const row of clear.rows) ctx.fillRect(0, row*s, size, s);
     for (const col of clear.columns) ctx.fillRect(col*s, 0, s, size);
   }
 }
 ctx.restore();if(this.animation)this.raf=requestAnimationFrame(this.draw);
 };
}
