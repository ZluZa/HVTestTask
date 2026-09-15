import {test,expect} from '@playwright/test';
test('diagnose core placement coordinates',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.addInitScript(()=>{Math.random=()=>.01;});await page.goto('/');
 const moves:[number,number,number][]=[[0,6,2],[1,6,4],[2,7,5],...Array.from({length:18},(_,i)=>[i%3,i%8,Math.floor(i/8)] as [number,number,number])];
 let n=0;
 for(const[slot,x,y]of moves){await page.locator(`[data-slot="${slot}"]`).click();const r=(await page.locator('#board').boundingBox())!;const p={x:r.x+(x+.5)*r.width/8,y:r.y+(y+.5)*r.height/8};const target=await page.evaluate(p=>document.elementFromPoint(p.x,p.y)?.tagName,p);await page.mouse.click(p.x,p.y);await page.waitForTimeout(140);const actual=await page.locator('#moves').textContent();console.log(JSON.stringify({expected:++n,actual,p,target,hint:await page.locator('#hint').textContent()}));expect(actual).toBe(String(n));}
});
