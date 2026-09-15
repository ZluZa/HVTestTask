import { test,expect } from '@playwright/test';
const key='block-build.meta.v3';
const prefix=`docs/session/stage4-chests-${Date.now()}`;
async function setup(page:any,collection:string,amount:number,roll:number,unlocked=['lotus']){
 await page.addInitScript(({key,collection,amount,roll,unlocked}:any)=>{
  Math.random=()=>roll;
  if(!sessionStorage.getItem('chest-fixture')){localStorage.setItem(key,JSON.stringify({version:3,selectedTheme:'lotus',unlockedThemes:unlocked,completedCollections:[],collectionBalances:{glasshouse:0,lighthouse:0,townhouse:0,[collection]:amount}}));sessionStorage.setItem('chest-fixture','1');}
 },{key,collection,amount,roll,unlocked});await page.goto('/');
}
const card=(page:any,id:string)=>page.locator(`.collection-card[data-collection="${id}"]`);
const saved=(page:any)=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)!),key);
for(const[id,roll,skin,name]of [['glasshouse',.4,'sand','Пески'],['lighthouse',.5,'ocean','Океан'],['townhouse',.9,'aurora','Аврора']]as const){
 test(`${id} chest opens once, unlocks ${skin}, equips and persists`,async({page})=>{
  await setup(page,id,100,roll);await expect(page.locator('.theme-button:disabled')).toHaveCount(5);
  const claim=card(page,id).getByRole('button',{name:'Забрать'});await claim.click();await card(page,id).locator('.claim-button').dispatchEvent('click');
  await expect(page.locator('.reward-name')).toHaveText(name);await expect(page.locator('#chest-preview')).toHaveAttribute('data-duplicate','false');expect((await saved(page)).collectionBalances[id]).toBe(0);await expect(page.locator(`[data-theme="${skin}"]`)).toBeEnabled();
  await page.screenshot({path:`${prefix}-${skin}-reward.png`});await page.getByRole('button',{name:'Применить',exact:true}).click();await expect(page.locator(`[data-theme="${skin}"]`)).toHaveAttribute('aria-pressed','true');await expect(card(page,id)).toHaveClass(/is-complete/);await expect(card(page,id).locator('.parts b')).toHaveText('0');
  await page.reload();await expect(page.locator(`[data-theme="${skin}"]`)).toHaveAttribute('aria-pressed','true');await expect(card(page,id)).toHaveClass(/is-complete/);
 });
}
test('duplicate grants 25 parts only to opened collection and does not create another unlock',async({page})=>{
 await setup(page,'lighthouse',100,0);await card(page,'lighthouse').getByRole('button',{name:'Забрать'}).click();await expect(page.locator('#chest-preview')).toHaveAttribute('data-duplicate','true');await expect(page.locator('.chest-preview-copy')).toContainText('+25 частичек');await expect(page.locator('.chest-equip')).not.toBeVisible();const meta=await saved(page);expect(meta.collectionBalances).toEqual({glasshouse:0,lighthouse:25,townhouse:0});expect(meta.unlockedThemes).toEqual(['lotus']);await page.getByRole('button',{name:'Понятно',exact:true}).click();await expect(card(page,'lighthouse').locator('.parts b')).toHaveText('25');await expect(card(page,'lighthouse').locator('.claim-button')).not.toBeVisible();
});
test('reloading during opening keeps the transaction',async({page})=>{
 await setup(page,'townhouse',100,.9);await card(page,'townhouse').getByRole('button',{name:'Забрать'}).click();await page.reload();expect((await saved(page)).collectionBalances.townhouse).toBe(0);await expect(page.locator('[data-theme="aurora"]')).toBeEnabled();
});
test('mobile six-skin grid and chest reveal fit narrow screen with reduced motion',async({page})=>{
 await page.setViewportSize({width:320,height:740});await page.emulateMedia({reducedMotion:'reduce'});await setup(page,'townhouse',100,.9);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await expect(page.locator('.theme-button')).toHaveCount(6);await card(page,'townhouse').getByRole('button',{name:'Забрать'}).click();await expect(page.locator('.reward-name')).toHaveText('Аврора');expect(await page.locator('.skin-reward').evaluate(el=>getComputedStyle(el).animationName)).toBe('none');await page.screenshot({path:`${prefix}-mobile-reward.png`});await page.getByRole('button',{name:'Позже'}).click();await page.screenshot({path:`${prefix}-mobile-themes.png`,fullPage:true});
});
