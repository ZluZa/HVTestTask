import {test,expect,type Page} from '@playwright/test';
import {solveDaily} from '../daily-route';
import {advanceDaily, dailyChallenge, startDaily} from '../../src/core/daily';
import {canPlace, place, preview} from '../../src/core/game';
const key='block-build.meta.v3';
async function setup(page:Page,id='2026-09-16'){
 await page.clock.setFixedTime(new Date(`${id}T12:00:00Z`));
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.addInitScript(()=>{Math.random=()=>.5;});await page.goto('/');
}
async function move(page:Page,slot:number,x:number,y:number){
 await page.locator(`[data-slot="${slot}"]`).click();
 const r=(await page.locator('#board').boundingBox())!;
 await page.mouse.click(r.x+(x+.5)*r.width/8,r.y+(y+.5)*r.height/8);
 await expect(page.locator('#daily-exit')).toBeEnabled();
}
for(const id of ['2026-09-16','2026-09-17','2026-09-18']){
 test(`daily ${dailyChallenge(id).kind}: real moves, reward, restored core and reload lock`,async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await setup(page,id);
  await page.locator('[data-slot="0"]').click();let r=(await page.locator('#board').boundingBox())!;
  await page.mouse.click(r.x+6.5*r.width/8,r.y+2.5*r.height/8);await expect(page.locator('#daily-open')).toBeEnabled();
  const hand=await page.locator('.piece-slot').evaluateAll(els=>els.map(e=>e.getAttribute('aria-label')));
  const balances=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!).collectionBalances,key);
  await page.locator('#daily-open').click();await expect(page.locator('.sidebar')).toBeHidden();await expect(page.locator('#moves')).toHaveText('0');
  for(const step of solveDaily(id).route)await move(page,step.slot,step.x,step.y);
  await expect(page.locator('#chest-preview')).toBeVisible();await expect(page.locator('.chest-source')).toContainText('Редкий сундук · Ежедневный уровень пройден');
  await expect(page.locator('.chest-actions')).toBeVisible();await page.getByRole('button',{name:'Применить',exact:true}).click();
  await expect(page.locator('#daily-objective')).toBeHidden();await expect(page.locator('.sidebar')).toBeVisible();
  await expect(page.locator('#moves')).toHaveText('1');await expect(page.locator('#score')).toHaveText('110');
  expect(await page.locator('.piece-slot').evaluateAll(els=>els.map(e=>e.getAttribute('aria-label')))).toEqual(hand);
  expect(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!).collectionBalances,key)).toEqual(balances);
  await expect(page.locator('#daily-open')).toBeDisabled();await expect(page.locator('#daily-action')).toHaveText('Пройдено ✓');
  await page.reload();await expect(page.locator('#daily-open')).toBeDisabled();expect(errors).toEqual([]);
 });
}
test('exit restores core; re-entry repeats puzzle; desktop and narrow mobile layouts fit',async({page})=>{
 await setup(page);await page.setViewportSize({width:1440,height:1100});
 await page.screenshot({path:'docs/session/daily-desktop.png',fullPage:true});
 await page.locator('#daily-open').click();const canvas=page.locator('#board');const before=await canvas.evaluate((c:HTMLCanvasElement)=>c.toDataURL());
 const step=solveDaily('2026-09-16').route[0];await move(page,step.slot,step.x,step.y);
 await page.locator('#daily-exit').click();await expect(page.locator('#score')).toHaveText('0');await expect(page.locator('#moves')).toHaveText('0');
 await page.locator('#daily-open').click();expect(await canvas.evaluate((c:HTMLCanvasElement)=>c.toDataURL())).toBe(before);
 await page.screenshot({path:'docs/session/daily-level-desktop.png',fullPage:true});
 for(const width of [390,320]){
  await page.setViewportSize({width,height:844});await expect(page.locator('#daily-exit')).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:`docs/session/daily-level-${width}.png`,fullPage:true});
 }
 await page.locator('#daily-exit').click();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:'docs/session/daily-entry-320.png',fullPage:true});
});
test('midnight refresh unlocks a new day while a running level retains its original conditions',async({page})=>{
 await setup(page);const oldTitle=await page.locator('#daily-summary').textContent();await page.locator('#daily-open').click();
 await page.clock.setFixedTime(new Date('2026-09-17T00:00:01Z'));await expect(page.locator('#daily-goal')).toHaveText(oldTitle!);
 for(const step of solveDaily('2026-09-16').route)await move(page,step.slot,step.x,step.y);
 await expect(page.locator('.chest-actions')).toBeVisible();await page.locator('.chest-actions .chest-close').click();
 await expect(page.locator('#daily-open')).toBeEnabled();await expect(page.locator('#daily-summary')).toHaveText(dailyChallenge('2026-09-17').description);
 await page.locator('#daily-open').click();await expect(page.locator('#daily-goal')).toHaveText(dailyChallenge('2026-09-17').description);
});
test('failed attempt offers retry with the same puzzle and no reward',async({page})=>{
 const id='2026-09-18';let route:{slot:number;x:number;y:number}[]=[];
 for(let seed=1;seed<=30;seed++){
  const run=startDaily(dailyChallenge(id)),candidateRoute:typeof route=[];let random=seed;
  while(run.outcome==='playing'){
   const candidates:{slot:number;x:number;y:number;clears:number}[]=[];
   for(let slot=0;slot<3;slot++){
    const p=run.state.hand[slot];if(!p)continue;
    for(let y=0;y<8;y++)for(let x=0;x<8;x++)if(canPlace(run.state.board,p.shape,x,y))candidates.push({slot,x,y,clears:preview(run.state.board,p,x,y)!.cells.length});
   }
   const min=Math.min(...candidates.map(c=>c.clears)),choices=candidates.filter(c=>c.clears===min);
   random=(Math.imul(random,1664525)+1013904223)>>>0;
   const step=choices[random%choices.length];candidateRoute.push(step);
   advanceDaily(run,place(run.state,step.slot,step.x,step.y,run.rng,run.dealer)!);
  }
  if(run.outcome==='lost'){route=candidateRoute;break;}
 }
 expect(route.length).toBeGreaterThan(0);
 await setup(page,id);await page.locator('#daily-open').click();
 for(const step of route)await move(page,step.slot,step.x,step.y);
 await expect(page.locator('#result')).toBeVisible();await expect(page.locator('#chest-preview')).toBeHidden();
 await page.getByRole('button',{name:'Попробовать снова'}).click();await expect(page.locator('#moves')).toHaveText('0');await expect(page.locator('#result')).toBeHidden();
 expect(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!).dailyClaimed,key)).toEqual([]);
});
