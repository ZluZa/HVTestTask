import { test, expect } from '@playwright/test';
const evidencePrefix = `docs/session/stage4-economy-${Date.now()}`;
const key = 'block-build.meta.v3';
async function setup(page:any,roll=.1,balances?:Record<string,number>){
 await page.addInitScript(({roll,key,balances}:any)=>{
  Math.random=()=>roll;
  if(balances&&!sessionStorage.getItem('fixture-seeded')){
   localStorage.setItem(key,JSON.stringify({version:3,selectedTheme:'lotus',unlockedThemes:['lotus'],completedCollections:[],collectionBalances:balances}));
   sessionStorage.setItem('fixture-seeded','yes');
  }
 },{roll,key,balances});
 await page.goto('/');
}
async function move(page:any,slot:number,x:number,y:number){
 await page.locator(`[data-slot="${slot}"]`).click();const r=await page.locator('#board').boundingBox();await page.mouse.click(r.x+(x+.5)*r.width/8,r.y+(y+.5)*r.height/8);
}
const balance=(page:any,id:string)=>page.evaluate(({key,id}:any)=>JSON.parse(localStorage.getItem(key)!).collectionBalances[id],{key,id});
const card=(page:any,id:string)=>page.locator(`[data-collection="${id}"].collection-card`);

test('fresh collection has three closed pictures, zero balances, distinct chests and 50/40/10 labels',async({page})=>{
 await page.setViewportSize({width:1440,height:1100});await setup(page);
 await expect(page.locator('.parts b')).toHaveText(['0','0','0']);await expect(page.locator('.claim-button:visible')).toHaveCount(0);
 await expect(page.locator('.collection-lock span')).toHaveText(['Закрыто','Закрыто','Закрыто']);await expect(page.locator('.drop-chance')).toHaveText(['50% выпадения','40% выпадения','10% выпадения']);
 for(const name of ['Обычный','Редкий','Легендарный'])await expect(page.getByRole('img',{name:`${name} сундук`,exact:true})).toHaveCount(1);
 await page.screenshot({path:`${evidencePrefix}-closed-desktop.png`,fullPage:true});
});
for(const[id,roll]of [['glasshouse',.1],['lighthouse',.6],['townhouse',.95]] as const){
 test(`one line awards only ${id} and flies into its destination`,async({page})=>{
  await page.setViewportSize({width:1440,height:1100});await setup(page,roll);await move(page,0,6,2);
  expect(await balance(page,id)).toBe(1);await expect(page.locator(`.flying-part[data-collection="${id}"]`)).toBeVisible();
  await expect(card(page,id).locator('.parts b')).toHaveText('1');await expect(card(page,id).locator('.collection-progress')).toHaveAttribute('aria-valuenow','1');
  await expect(page.locator('.flying-part')).toHaveCount(0);await expect(page.locator('#score')).toHaveText('110');
  const balances=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!).collectionBalances,key);expect(Object.values(balances).reduce((sum:any,n:any)=>sum+n,0)).toBe(1);
 });
}
test('combo rewards remain correct when reward flights overlap and persist after reload',async({page})=>{
 await setup(page,.1);await move(page,0,6,2);await page.waitForTimeout(400);await move(page,1,6,4);await page.waitForTimeout(240);await move(page,2,7,5);
 expect(await balance(page,'glasshouse')).toBe(3);await expect(card(page,'glasshouse').locator('.parts b')).toHaveText('3');await expect(page.locator('#score')).toHaveText('325');
 await page.reload();await expect(card(page,'glasshouse').locator('.parts b')).toHaveText('3');await expect(page.locator('#score')).toHaveText('0');
});
test('100 reveals the picture, pays for a chest and keeps assembled art visible afterwards',async({page})=>{
 await setup(page,.4,{glasshouse:99,lighthouse:0,townhouse:0});await expect(card(page,'glasshouse').locator('.claim-button')).not.toBeVisible();await move(page,0,6,2);
 await expect(card(page,'glasshouse').locator('.parts b')).toHaveText('100');await expect(card(page,'glasshouse')).toHaveClass(/is-complete/);await expect(page.locator('.counter')).toHaveText('1 / 3');
 await card(page,'glasshouse').getByRole('button',{name:'Забрать'}).click();await expect(page.locator('#chest-preview')).toBeVisible();await expect(page.locator('.reward-name')).toHaveText('Пески');expect(await balance(page,'glasshouse')).toBe(0);
 await page.getByRole('button',{name:'Позже',exact:true}).click();await expect(card(page,'glasshouse')).toHaveClass(/is-complete/);await expect(card(page,'glasshouse').locator('.claim-button')).not.toBeVisible();await page.screenshot({path:`${evidencePrefix}-completed.png`,fullPage:true});await page.reload();await expect(card(page,'glasshouse')).toHaveClass(/is-complete/);await expect(page.locator('[data-theme="sand"]')).toBeEnabled();
});
test('partial masks show progress, legendary chest becomes ready, and excess stays in reserve',async({page})=>{
 await page.setViewportSize({width:1440,height:1100});await setup(page,.1,{glasshouse:45,lighthouse:75,townhouse:104});
 await expect(card(page,'glasshouse').locator('.collection-progress')).toHaveAttribute('aria-valuenow','45');await expect(card(page,'lighthouse').locator('.collection-progress')).toHaveAttribute('aria-valuenow','75');
 await expect(card(page,'townhouse').locator('.parts b')).toHaveText('100');await expect(card(page,'townhouse').locator('.reserve')).toHaveText('В запасе: 4');
 for(const[id,count]of [['glasshouse',45],['lighthouse',75],['townhouse',100]]as const){const mask=await card(page,id).locator('.art-reveal').evaluate((el:HTMLElement)=>decodeURIComponent(el.style.maskImage));expect((mask.match(/<rect /g)||[]).length).toBe(count);}
 await page.screenshot({path:`${evidencePrefix}-partial.png`,fullPage:true});await card(page,'townhouse').getByRole('button',{name:'Забрать'}).click();await expect(page.locator('#chest-preview .chest-source')).toContainText('Легендарный сундук');await expect(page.locator('.skin-reward')).toBeVisible();await page.getByRole('button',{name:'Закрыть сундук',exact:true}).click();await page.screenshot({path:`${evidencePrefix}-legendary.png`,fullPage:true});
});
test('mobile offscreen destination receives a visible thumbnail without scrolling the board',async({browser})=>{
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2});const page=await context.newPage();await setup(page,.95);await page.locator('[data-slot="0"]').tap();const r=await page.locator('#board').boundingBox();await page.touchscreen.tap(r!.x+6.5*r!.width/8,r!.y+2.5*r!.height/8);const scroll=await page.evaluate(()=>scrollY);
 await expect(page.locator('.collection-receipt')).toBeVisible();await expect(page.locator('.collection-receipt strong')).toHaveText('Дом у парка');await page.screenshot({path:`${evidencePrefix}-mobile-flight.png`});
 await expect(card(page,'townhouse').locator('.parts b')).toHaveText('1');expect(await page.evaluate(()=>scrollY)).toBe(scroll);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:`${evidencePrefix}-mobile-full.png`,fullPage:true});await context.close();
});
test('reduced motion credits immediately without flying tokens; malformed save remains playable',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.addInitScript(()=>localStorage.setItem('block-build.meta.v3','bad-json'));await setup(page,.6);await move(page,0,6,2);await expect(card(page,'lighthouse').locator('.parts b')).toHaveText('1');await expect(page.locator('.flying-part')).toHaveCount(0);await expect(page.locator('.collection-receipt')).toHaveCount(0);expect(await balance(page,'lighthouse')).toBe(1);
});
