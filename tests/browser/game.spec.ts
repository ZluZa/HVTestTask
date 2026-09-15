import { test,expect } from '@playwright/test';
const evidencePrefix = `docs/session/stage4-regression-${Date.now()}`;
async function cell(page:any,x:number,y:number){const r=await page.locator('#board').boundingBox();return{x:r.x+(x+.5)*r.width/8,y:r.y+(y+.5)*r.height/8};}
test('desktop: select, preview, clear, invalid placement, drag, themes and rules',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.setViewportSize({width:1440,height:1000});await page.goto('/');
 await expect(page.locator('#score')).toHaveText('0');await page.locator('[data-slot="0"]').click();const p=await cell(page,6,2);await page.mouse.move(p.x,p.y);await page.screenshot({path:`${evidencePrefix}-desktop-preview.png`});await page.mouse.click(p.x,p.y);await expect(page.locator('#score')).toHaveText('110');await expect(page.locator('#moves')).toHaveText('1');await expect(page.locator('[data-slot="0"]')).toBeDisabled();await page.waitForTimeout(760);
 await page.locator('[data-slot="1"]').click();const invalid=await cell(page,0,5);await page.mouse.click(invalid.x,invalid.y);await expect(page.locator('#moves')).toHaveText('1');
 const slot=await page.locator('[data-slot="1"]').boundingBox();const target=await cell(page,7,4);await page.mouse.move(slot!.x+slot!.width/2,slot!.y+slot!.height/2);await page.mouse.down();await page.mouse.move(target.x,target.y,{steps:12});await page.mouse.up();await expect(page.locator('#moves')).toHaveText('2');await page.waitForTimeout(760);
 await expect(page.getByRole('button',{name:'Тема Сумерки',exact:true})).toBeDisabled();await expect(page.locator('.theme-button:disabled')).toHaveCount(5);await page.reload();await expect(page.locator('[data-theme="lotus"]')).toHaveAttribute('aria-pressed','true');await page.getByRole('button',{name:'Тема Лотос',exact:true}).click();
 await page.getByRole('button',{name:'Правила игры'}).click();await expect(page.locator('#rules')).toBeVisible();await page.getByRole('button',{name:'Всё понятно'}).click();await expect(page.locator('#rules')).not.toBeVisible();await page.screenshot({path:`${evidencePrefix}-desktop.png`,fullPage:true});expect(errors).toEqual([]);
});
test('mobile touch: tap placement and drag, no overflow, three collection cards',async({browser})=>{
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2});const page=await context.newPage();await page.goto('/');await page.locator('[data-slot="0"]').tap();let p=await cell(page,6,2);await page.touchscreen.tap(p.x,p.y);await expect(page.locator('#score')).toHaveText('110');await page.waitForTimeout(760);
 const cdp=await context.newCDPSession(page);const slot=await page.locator('[data-slot="1"]').boundingBox();p=await cell(page,7,5);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:slot!.x+slot!.width/2,y:slot!.y+slot!.height/2}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:p.x,y:p.y}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await expect(page.locator('#moves')).toHaveText('2');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await expect(page.locator('.collection-card')).toHaveCount(3);await page.waitForTimeout(760);await page.screenshot({path:`${evidencePrefix}-mobile.png`,fullPage:true});await context.close();
});
test('320px and reduced motion',async({page})=>{await page.setViewportSize({width:320,height:740});await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.locator('[data-slot="0"]').click();const p=await cell(page,6,2);await page.mouse.click(p.x,p.y);await expect(page.locator('#score')).toHaveText('110');expect(await page.locator('#score-pop').evaluate(el=>getComputedStyle(el).animationName)).toBe('none');});
test('continues past 18 placements without a result dialog or field title',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.addInitScript(()=>{Math.random=()=>.01;});await page.goto('/');
 const moves:[number,number,number][]=[[0,6,2],[1,6,4],[2,7,5],...Array.from({length:18},(_,i)=>[i%3,i%8,Math.floor(i/8)] as [number,number,number])];
 for(const[slot,x,y]of moves){await page.locator(`[data-slot="${slot}"]`).click();await page.locator('#board').scrollIntoViewIfNeeded();const p=await cell(page,x,y);await page.mouse.click(p.x,p.y);await page.waitForTimeout(140);}
 await expect(page.locator('#moves')).toHaveText('21');await expect(page.locator('#result')).not.toBeVisible();await expect(page.locator('#board')).toHaveAttribute('data-status','playing');await expect(page.locator('#theme-title')).toHaveCount(0);await expect(page.locator('.piece-slot:disabled')).toHaveCount(0);
});
test('no legal remaining pieces opens the blocked result',async({page})=>{
 const {newGame,place,canPlace}=await import('../../src/core/game');
 let route:{slot:number;x:number;y:number}[]=[];
 for(let seed=1;seed<100;seed++){
  let model=newGame(),random=seed;const candidateRoute:typeof route=[];
  while(model.status==='playing'){
   const candidates:typeof route=[];
   for(let slot=0;slot<3;slot++){const piece=model.hand[slot];if(!piece)continue;for(let y=0;y<8;y++)for(let x=0;x<8;x++)if(canPlace(model.board,piece.shape,x,y))candidates.push({slot,x,y});}
   random=(random*1664525+1013904223)>>>0;
   const next=candidates[random%candidates.length];candidateRoute.push(next);model=place(model,next.slot,next.x,next.y,()=>.999)!.state;
  }
  if(model.status==='blocked'){route=candidateRoute;break;}
 }
 expect(route.length).toBeGreaterThan(0);
 await page.emulateMedia({reducedMotion:'reduce'});await page.addInitScript(()=>{Math.random=()=>.999;});await page.goto('/');
 for(const{slot,x,y}of route){await page.locator(`[data-slot="${slot}"]`).click();await page.locator('#board').scrollIntoViewIfNeeded();const p=await cell(page,x,y);await page.mouse.click(p.x,p.y);await page.waitForTimeout(140);}
 await expect(page.locator('#board')).toHaveAttribute('data-status','blocked');await expect(page.locator('#result')).toBeVisible();await expect(page.locator('#result-copy')).toContainText('нет места');await page.getByRole('button',{name:'Сыграть ещё'}).click();await expect(page.locator('#moves')).toHaveText('0');await expect(page.locator('#score')).toHaveText('0');
});
test('invalid hover draws nothing; valid hover remains visible',async({page})=>{
 await page.goto('/');await page.locator('[data-slot="0"]').click();
 const canvas=page.locator('#board');const baseline=await canvas.evaluate((c:HTMLCanvasElement)=>c.toDataURL());
 for(const[x,y]of [[0,2],[7,0]]){const p=await cell(page,x,y);await page.mouse.move(p.x,p.y);expect(await canvas.evaluate((c:HTMLCanvasElement)=>c.toDataURL())).toBe(baseline);}
 const p=await cell(page,6,2);await page.mouse.move(p.x,p.y);expect(await canvas.evaluate((c:HTMLCanvasElement)=>c.toDataURL())).not.toBe(baseline);
});
test('clear wave visibly starts at last placement and reaches the far edge later',async({page})=>{
 await page.clock.install({time:new Date('2026-09-16T12:00:00Z')});await page.goto('/');await page.clock.pauseAt(new Date('2026-09-16T12:01:00Z'));await page.locator('[data-slot="0"]').click();const p=await cell(page,6,2);await page.mouse.click(p.x,p.y);
 const pixel=(x:number)=>page.locator('#board').evaluate((c:HTMLCanvasElement,x:number)=>{const s=c.width/8;return Array.from(c.getContext('2d')!.getImageData((x+.5)*s,2.5*s,1,1).data).join(',');},x);
 await page.clock.runFor(125);const near=await pixel(7),far=await pixel(0);expect(near).not.toBe(far);await page.screenshot({path:`${evidencePrefix}-wave-125ms-v2.png`});
 await page.clock.runFor(280);expect(await pixel(0)).toBe(near);await page.screenshot({path:`${evidencePrefix}-wave-405ms-v2.png`});
});
