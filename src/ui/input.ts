import type { Hover } from '../render/canvas';
export interface InputCallbacks {select:(slot:number)=>boolean;hover:(h:Hover|null)=>void;place:(slot:number,x:number,y:number)=>void;selected:()=>number;enabled:()=>boolean}
/** Top-left of a piece is the placement anchor. Touch drag floats one row above the finger. */
export function bindInput(board:HTMLCanvasElement,slots:HTMLButtonElement[],callbacks:InputCallbacks){
 let drag:{pointer:number;slot:number;sx:number;sy:number;moved:boolean;fromTray:boolean;touch:boolean}|null=null;
 const locate=(e:PointerEvent,offset=false)=>{const r=board.getBoundingClientRect(),s=r.width/8;return{x:Math.floor((e.clientX-r.left)/s),y:Math.floor((e.clientY-r.top)/s)-(offset?1:0)};};
 slots.forEach((button,slot)=>{
 button.addEventListener('pointerdown',e=>{if(e.button!==0||!callbacks.enabled()||!callbacks.select(slot))return;e.preventDefault();button.setPointerCapture(e.pointerId);drag={pointer:e.pointerId,slot,sx:e.clientX,sy:e.clientY,moved:false,fromTray:true,touch:e.pointerType==='touch'};});
 button.addEventListener('click',e=>{if(e.detail===0)callbacks.select(slot);});
 });
 board.addEventListener('pointerdown',e=>{if(e.button!==0||!callbacks.enabled()||callbacks.selected()<0)return;e.preventDefault();board.setPointerCapture(e.pointerId);drag={pointer:e.pointerId,slot:callbacks.selected(),sx:e.clientX,sy:e.clientY,moved:false,fromTray:false,touch:e.pointerType==='touch'};callbacks.hover({slot:drag.slot,...locate(e)});});
 window.addEventListener('pointermove',e=>{if(drag&&drag.pointer===e.pointerId){drag.moved ||= Math.hypot(e.clientX-drag.sx,e.clientY-drag.sy)>5;if(drag.moved)callbacks.hover({slot:drag.slot,...locate(e,drag.touch&&drag.fromTray)});}else if(e.target===board&&callbacks.selected()>=0)callbacks.hover({slot:callbacks.selected(),...locate(e)});});
 window.addEventListener('pointerup',e=>{if(!drag||drag.pointer!==e.pointerId)return;const d=drag;drag=null;if(d.fromTray&&!d.moved)return;const r=board.getBoundingClientRect();if(e.clientX>=r.left&&e.clientX<r.right&&e.clientY>=r.top&&e.clientY<r.bottom){const p=locate(e,d.touch&&d.fromTray);callbacks.place(d.slot,p.x,p.y);}callbacks.hover(null);});
 window.addEventListener('pointercancel',()=>{drag=null;callbacks.hover(null);});board.addEventListener('pointerleave',()=>{if(!drag)callbacks.hover(null);});
}
