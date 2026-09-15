# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: chests.spec.ts >> glasshouse chest opens once, unlocks sand, equips and persists
- Location: tests/browser/chests.spec.ts:13:2

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.dispatchEvent: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('.collection-card[data-collection="glasshouse"]').getByRole('button', { name: 'Забрать' })

```

# Page snapshot

```yaml
- generic [ref=f1e2]:
  - banner [ref=f1e3]:
    - link "blockBuild" [ref=f1e4] [cursor=pointer]:
      - /url: ./
      - text: block
      - generic [ref=f1e9]: Build
      - generic [ref=f1e10]: /
      - generic [ref=f1e11]: место для спокойствия
    - generic [ref=f1e12]: В своём ритме
  - main [ref=f1e14]:
    - button [ref=f1e16] [cursor=pointer]:
      - generic [ref=f1e17]:
        - text: ЕЖЕДНЕВНЫЙ УРОВЕНЬ
        - strong [ref=f1e18]: Охота за очками
        - text: Набери 1000 очков за 15 ходов
        - generic [ref=f1e19]:
          - text: До обновления
          - time [ref=f1e20]: 23:47:33
      - generic [ref=f1e21]: Редкий сундук
      - text: Играть →
    - generic [ref=f1e31]:
      - region "Игра Block Build" [ref=f1e32]:
        - generic [ref=f1e33]:
          - generic [ref=f1e34]: ИГРОВОЕ ПОЛЕ8 × 8
          - button "Правила игры" [ref=f1e35] [cursor=pointer]: "?"
        - generic [ref=f1e36]:
          - generic [ref=f1e37]:
            - generic [ref=f1e38]: ОЧКИ
            - strong [ref=f1e39]: "0"
          - generic [ref=f1e40]:
            - generic [ref=f1e41]: ХОДЫ
            - strong [ref=f1e42]: "0"
          - generic [ref=f1e43]:
            - generic [ref=f1e44]: КОМБО
            - strong [ref=f1e45]: ×1
            - generic [aria-hidden] [ref=f1e46]: ● ● ●
        - img "Игровое поле 8 на 8. Выберите фигуру и нажмите на клетку." [ref=f1e48]
        - generic "Доступные фигуры" [ref=f1e49]:
          - button "Линия 2, 2 на 1" [ref=f1e50] [cursor=pointer]:
            - generic [ref=f1e51]: "1"
          - button "Линия 2, 1 на 2" [ref=f1e52] [cursor=pointer]:
            - generic [ref=f1e53]: "2"
          - button "Одна клетка, 1 на 1" [ref=f1e54] [cursor=pointer]:
            - generic [ref=f1e55]: "3"
        - paragraph [ref=f1e56]: Выбери фигуру и клетку или перетащи на поле
        - generic [ref=f1e57]:
          - generic [ref=f1e58]: ◈ Без спешки. Каждый блок на своём месте.
          - generic [ref=f1e59]: "Линий: 0"
      - complementary [ref=f1e60]:
        - generic [ref=f1e61]:
          - generic [ref=f1e62]:
            - generic [ref=f1e63]:
              - generic [ref=f1e64]: ТВОЙ МАЛЕНЬКИЙ МИР
              - heading "Коллекция" [level=2] [ref=f1e65]
            - generic [ref=f1e66]: 1 / 3
          - paragraph [ref=f1e67]: Истории, которые складываются по частям.
          - generic "Три картинки коллекции" [ref=f1e68]:
            - article [ref=f1e69]:
              - generic [ref=f1e70]:
                - 'img "Оранжерея: собираемая картинка здания" [ref=f1e71]'
                - generic [ref=f1e73]: "01"
                - generic [ref=f1e74]: Собрано
                - generic [ref=f1e76]: БОТАНИЧЕСКАЯ КОЛЛЕКЦИЯ
              - generic [ref=f1e77]:
                - generic [ref=f1e78]:
                  - heading "Оранжерея" [level=3] [ref=f1e79]
                  - paragraph [ref=f1e80]: Место, где всё начинается
                - generic [ref=f1e81]:
                  - generic [ref=f1e82]: ◆
                  - generic [ref=f1e83]: "0"
                  - generic [ref=f1e84]: / 100
              - generic [ref=f1e85]:
                - generic [ref=f1e86]:
                  - generic [ref=f1e87]:
                    - generic [ref=f1e88]: До следующего сундука
                    - generic [ref=f1e89]: 50% выпадения
                  - 'progressbar "Оранжерея: собрано частичек" [ref=f1e90]'
                - img "Обычный сундук" [ref=f1e91]
              - generic [ref=f1e99]: Обычный сундук
            - article [ref=f1e101]:
              - generic [ref=f1e102]:
                - 'img "Маяк: собираемая картинка здания" [ref=f1e103]'
                - generic [ref=f1e105]: "02"
                - generic [ref=f1e106]: Закрыто
                - generic [ref=f1e111]: ТИШИНА ПОБЕРЕЖЬЯ
              - generic [ref=f1e112]:
                - generic [ref=f1e113]:
                  - heading "Маяк" [level=3] [ref=f1e114]
                  - paragraph [ref=f1e115]: Тихий свет на краю берега
                - generic [ref=f1e116]:
                  - generic [ref=f1e117]: ◆
                  - generic [ref=f1e118]: "0"
                  - generic [ref=f1e119]: / 100
              - generic [ref=f1e120]:
                - generic [ref=f1e121]:
                  - generic [ref=f1e122]:
                    - generic [ref=f1e123]: Частички картинки
                    - generic [ref=f1e124]: 40% выпадения
                  - 'progressbar "Маяк: собрано частичек" [ref=f1e125]'
                - img "Редкий сундук" [ref=f1e126]
              - generic [ref=f1e135]: Редкий сундук
            - article [ref=f1e137]:
              - generic [ref=f1e138]:
                - 'img "Дом у парка: собираемая картинка здания" [ref=f1e139]'
                - generic [ref=f1e141]: "03"
                - generic [ref=f1e142]: Закрыто
                - generic [ref=f1e147]: ГОРОДСКИЕ ИСТОРИИ
              - generic [ref=f1e148]:
                - generic [ref=f1e149]:
                  - heading "Дом у парка" [level=3] [ref=f1e150]
                  - paragraph [ref=f1e151]: Маленький уголок большого города
                - generic [ref=f1e152]:
                  - generic [ref=f1e153]: ◆
                  - generic [ref=f1e154]: "0"
                  - generic [ref=f1e155]: / 100
              - generic [ref=f1e156]:
                - generic [ref=f1e157]:
                  - generic [ref=f1e158]:
                    - generic [ref=f1e159]: Частички картинки
                    - generic [ref=f1e160]: 10% выпадения
                  - 'progressbar "Дом у парка: собрано частичек" [ref=f1e161]'
                - img "Легендарный сундук" [ref=f1e162]
              - generic [ref=f1e173]: Легендарный сундук
          - generic [ref=f1e175]:
            - generic [ref=f1e176]: ◇
            - paragraph [ref=f1e177]: Каждая линия — частичка × комбо.Собери 100, чтобы открыть картинку.
        - generic [ref=f1e178]:
          - generic [ref=f1e179]:
            - heading "Настроение поля" [level=2] [ref=f1e180]
            - generic [ref=f1e181]: ТЕМЫ
          - generic [ref=f1e182]:
            - button "Тема Лотос" [pressed] [ref=f1e183] [cursor=pointer]:
              - generic [ref=f1e188]: Лотос
              - generic [ref=f1e189]: Обычный
              - generic [ref=f1e190]: ✓
            - button "Тема Сумерки" [disabled] [ref=f1e191]:
              - generic [ref=f1e200]: Сумерки
              - generic [ref=f1e201]: Редкий
            - button "Тема Пески" [ref=f1e202] [cursor=pointer]:
              - generic [ref=f1e207]: Пески
              - generic [ref=f1e208]: Обычный
            - button "Тема Терракота" [disabled] [ref=f1e209]:
              - generic [ref=f1e218]: Терракота
              - generic [ref=f1e219]: Обычный
            - button "Тема Океан" [disabled] [ref=f1e220]:
              - generic [ref=f1e229]: Океан
              - generic [ref=f1e230]: Редкий
            - button "Тема Аврора" [disabled] [ref=f1e231]:
              - generic [ref=f1e240]: Аврора
              - generic [ref=f1e241]: Легендарный
    - paragraph [ref=f1e242]
    - generic [ref=f1e243]:
      - text: Собрано из маленьких моментов.
      - generic [ref=f1e244]: blockBuild · 2026
```

# Test source

```ts
  1  | import { test,expect } from '@playwright/test';
  2  | const key='block-build.meta.v3';
  3  | const prefix=`docs/session/stage4-chests-${Date.now()}`;
  4  | async function setup(page:any,collection:string,amount:number,roll:number,unlocked=['lotus']){
  5  |  await page.addInitScript(({key,collection,amount,roll,unlocked}:any)=>{
  6  |   Math.random=()=>roll;
  7  |   if(!sessionStorage.getItem('chest-fixture')){localStorage.setItem(key,JSON.stringify({version:3,selectedTheme:'lotus',unlockedThemes:unlocked,completedCollections:[],collectionBalances:{glasshouse:0,lighthouse:0,townhouse:0,[collection]:amount}}));sessionStorage.setItem('chest-fixture','1');}
  8  |  },{key,collection,amount,roll,unlocked});await page.goto('/');
  9  | }
  10 | const card=(page:any,id:string)=>page.locator(`.collection-card[data-collection="${id}"]`);
  11 | const saved=(page:any)=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)!),key);
  12 | for(const[id,roll,skin,name]of [['glasshouse',.4,'sand','Пески'],['lighthouse',.5,'ocean','Океан'],['townhouse',.9,'aurora','Аврора']]as const){
  13 |  test(`${id} chest opens once, unlocks ${skin}, equips and persists`,async({page})=>{
  14 |   await setup(page,id,100,roll);await expect(page.locator('.theme-button:disabled')).toHaveCount(5);
> 15 |   const claim=card(page,id).getByRole('button',{name:'Забрать'});await claim.click();await claim.dispatchEvent('click');
     |                                                                                                  ^ Error: locator.dispatchEvent: Test timeout of 30000ms exceeded.
  16 |   await expect(page.locator('.reward-name')).toHaveText(name);await expect(page.locator('#chest-preview')).toHaveAttribute('data-duplicate','false');expect((await saved(page)).collectionBalances[id]).toBe(0);await expect(page.locator(`[data-theme="${skin}"]`)).toBeEnabled();
  17 |   await page.screenshot({path:`${prefix}-${skin}-reward.png`});await page.getByRole('button',{name:'Применить',exact:true}).click();await expect(page.locator(`[data-theme="${skin}"]`)).toHaveAttribute('aria-pressed','true');await expect(card(page,id)).toHaveClass(/is-complete/);await expect(card(page,id).locator('.parts b')).toHaveText('0');
  18 |   await page.reload();await expect(page.locator(`[data-theme="${skin}"]`)).toHaveAttribute('aria-pressed','true');await expect(card(page,id)).toHaveClass(/is-complete/);
  19 |  });
  20 | }
  21 | test('duplicate grants 25 parts only to opened collection and does not create another unlock',async({page})=>{
  22 |  await setup(page,'lighthouse',100,0);await card(page,'lighthouse').getByRole('button',{name:'Забрать'}).click();await expect(page.locator('#chest-preview')).toHaveAttribute('data-duplicate','true');await expect(page.locator('.chest-preview-copy')).toContainText('+25 частичек');await expect(page.locator('.chest-equip')).not.toBeVisible();const meta=await saved(page);expect(meta.collectionBalances).toEqual({glasshouse:0,lighthouse:25,townhouse:0});expect(meta.unlockedThemes).toEqual(['lotus']);await page.getByRole('button',{name:'Понятно',exact:true}).click();await expect(card(page,'lighthouse').locator('.parts b')).toHaveText('25');await expect(card(page,'lighthouse').locator('.claim-button')).not.toBeVisible();
  23 | });
  24 | test('reloading during opening keeps transaction, legacy migration locks demo themes',async({page})=>{
  25 |  await setup(page,'townhouse',100,.9);await card(page,'townhouse').getByRole('button',{name:'Забрать'}).click();await page.reload();expect((await saved(page)).collectionBalances.townhouse).toBe(0);await expect(page.locator('[data-theme="aurora"]')).toBeEnabled();
  26 | });
  27 | test('mobile six-skin grid and chest reveal fit narrow screen with reduced motion',async({page})=>{
  28 |  await page.setViewportSize({width:320,height:740});await page.emulateMedia({reducedMotion:'reduce'});await setup(page,'townhouse',100,.9);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await expect(page.locator('.theme-button')).toHaveCount(6);await card(page,'townhouse').getByRole('button',{name:'Забрать'}).click();await expect(page.locator('.reward-name')).toHaveText('Аврора');expect(await page.locator('.skin-reward').evaluate(el=>getComputedStyle(el).animationName)).toBe('none');await page.screenshot({path:`${prefix}-mobile-reward.png`});await page.getByRole('button',{name:'Позже'}).click();await page.screenshot({path:`${prefix}-mobile-themes.png`,fullPage:true});
  29 | });
  30 | 
```