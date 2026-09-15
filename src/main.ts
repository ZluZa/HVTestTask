import './style.css';
import { newGame, place, type GameState } from './core/game';
import { dailyChallenge, startDaily, advanceDaily, timeToRefresh, type DailyRun } from './core/daily';
import { claimDailyChest } from './meta/chests';
import { THEMES } from './meta/catalog';
import { loadMeta, saveMeta } from './meta/store';
import { rewardPlacement } from './meta/economy';
import { CollectionView, collectionMarkup, chestSvg } from './ui/collections';
import { ChestView, themeMarkup } from './ui/chests';
import { BoardRenderer, drawPiece } from './render/canvas';
import { bindInput } from './ui/input';
const app=document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML=`
<header class="header"><a class="brand" href="./" aria-label="blockBuild"><span class="brand-mark"><i></i><i></i><i></i></span>block<span>Build</span><b> / </b><small>место для спокойствия</small></a><span class="header-note"><span class="online-dot"></span> В своём ритме</span></header>
<main><section class="intro"><button id="daily-open" class="daily-banner"><span class="daily-banner-copy"><span class="eyebrow">ЕЖЕДНЕВНЫЙ УРОВЕНЬ</span><strong id="daily-title"></strong><span id="daily-summary"></span><span class="daily-refresh">До обновления <time id="daily-timer"></time></span></span><span class="daily-banner-reward"><span aria-hidden="true">${chestSvg('rare')}</span><span>Редкий сундук</span></span><span id="daily-action" class="daily-action">Играть →</span></button></section>
<div class="layout"><section class="game-card" aria-label="Игра Block Build"><div class="game-heading"><div><span id="board-title" class="eyebrow">ИГРОВОЕ ПОЛЕ</span><span class="pill">8 × 8</span></div><button id="rules-open" class="icon-button" aria-label="Правила игры">?</button></div>
<section id="daily-objective" class="daily-objective" hidden><div class="daily-objective-heading"><span id="daily-date"></span><button id="daily-exit" class="secondary">В основную игру</button></div><h2 id="daily-goal"></h2><p id="daily-help"></p><div class="daily-progress-caption" aria-live="polite"><strong id="daily-progress"></strong><span id="daily-remaining"></span></div><progress id="daily-track" value="0" max="1" aria-label="Прогресс ежедневного задания"></progress></section>
<div class="stats"><div><span>ОЧКИ</span><strong id="score">0</strong></div><div><span>ХОДЫ</span><strong><b id="moves">0</b></strong></div><div><span>КОМБО</span><strong id="combo">×1</strong><div id="combo-dots" aria-hidden="true">● ● ●</div></div></div>
<div class="board-wrap"><canvas id="board" role="img" aria-label="Игровое поле 8 на 8. Выберите фигуру и нажмите на клетку."></canvas><div id="score-pop" aria-hidden="true"></div></div>
<div class="tray" aria-label="Доступные фигуры">${[0,1,2].map(i=>`<button class="piece-slot" data-slot="${i}" aria-label="Фигура ${i+1}"><canvas></canvas><span class="slot-mark">${i+1}</span></button>`).join('')}</div>
<p id="hint" class="hint" aria-live="polite">Выбери фигуру и клетку или перетащи на поле</p><div class="game-bottom"><span><i class="tiny-leaf">◈</i> Без спешки. Каждый блок на своём месте.</span><span id="line-count">0 линий</span></div></section>
<aside class="sidebar"><section class="collection-panel"><div class="section-heading"><div><div class="eyebrow">ТВОЙ МАЛЕНЬКИЙ МИР</div><h2>Коллекция</h2></div><span class="counter">0 / 3</span></div><p class="section-copy">Истории, которые складываются по частям.</p><div class="collection-scroll" tabindex="0" aria-label="Три картинки коллекции">${collectionMarkup()}</div><div class="collection-foot"><span>◇</span><p>Каждая линия — частичка × комбо.<br>Собери 100, чтобы открыть картинку.</p></div></section>
<section class="themes-panel"><div class="section-heading"><h2>Настроение поля</h2><span class="eyebrow">ТЕМЫ</span></div><div class="themes">${themeMarkup(THEMES)}</div></section></aside></div>
<p id="collection-announcement" class="collection-announcement" aria-live="polite"></p><footer>Собрано из маленьких моментов.<span>blockBuild · 2026</span></footer></main>
<dialog id="rules"><button class="dialog-close icon-button" aria-label="Закрыть правила">×</button><div class="eyebrow">ПРОСТО И СПОКОЙНО</div><h2>Каждому блоку — место</h2><p>Выбери одну из трёх фигур и нажми на поле: выбранная клетка станет её левым верхним углом. Можно перетаскивать фигуры; на телефоне фигура поднимается на клетку над пальцем.</p><p>Заполняй строки и столбцы. Все готовые линии исчезают одновременно. Используй три фигуры, чтобы получить новые. Поворота нет.</p><p><b>Очки:</b> 5 за клетку + 100 × линии² × комбо. За пустое поле — ещё 300.</p><p><b>Частички:</b> одна за каждую линию × комбо. Для каждой линии тип выбирается отдельно: Оранжерея — 50%, Маяк — 40%, Дом у парка — 10%. Каждая картинка собирается из 100 частичек; остаток сохраняется. «Забрать» тратит 100 частичек на сундук со случайным скином. Дубликат возвращает 25 частичек этой же картинки. Собранные картинки остаются открытыми; сундуки можно получать повторно.</p><p><b>Ежедневный уровень:</b> новые условия и раскладка каждый день, обновление в местную полночь. Синие блоки считаются при очистке линий; палитра уровня — «Лотос». Попытки не ограничены. Награда — один редкий сундук за день, дубликат даёт 25 частичек «Маяка». Частички за линии здесь не начисляются. Основная партия сохраняется на время уровня.</p><p>Первая очистка даёт ×1, следующая ×2 и так далее. Три хода без очистки сбрасывают комбо. Партия продолжается, пока есть доступные ходы, и заканчивается, когда нет места ни для одной оставшейся фигуры.</p><button class="primary dialog-close">Всё понятно</button></dialog>
<dialog id="chest-preview"><button class="chest-close icon-button" aria-label="Закрыть сундук">×</button><div class="eyebrow chest-source"></div><div class="chest-preview-art"></div><h2></h2><div class="skin-reward" hidden><canvas aria-label="Предпросмотр выпавшего скина"></canvas><h3 class="reward-name"></h3><span class="reward-rarity"></span></div><p class="chest-preview-copy" aria-live="polite"></p><div class="chest-actions" hidden><button class="primary chest-equip">Применить</button><button class="secondary chest-close">Позже</button></div><p class="chest-odds"></p></dialog>
<dialog id="result"><div class="result-symbol">✦</div><div class="eyebrow">МОМЕНТ ДЛЯ ПАУЗЫ</div><h2 id="result-title"></h2><p id="result-copy"></p><strong id="result-score"></strong><span class="result-label">очков за партию</span><button id="again" class="primary">Сыграть ещё</button><button id="result-exit" class="secondary" hidden>В основную игру</button></dialog>`;
const $=<T extends HTMLElement>(s:string)=>document.querySelector<T>(s)!;
let state:GameState=newGame(),meta=loadMeta(),selected=-1,busy=false;let theme=THEMES.find(t=>t.id===meta.selectedTheme)!;
const board=$<HTMLCanvasElement>('#board'),slots=Array.from(document.querySelectorAll<HTMLButtonElement>('.piece-slot')),renderer=new BoardRenderer(board,state,theme);
const result=$<HTMLDialogElement>('#result');
let daily:DailyRun|null=null,coreState:GameState|null=null;
const activeTheme=()=>daily ? THEMES[0] : theme;
saveMeta(meta);
const collections=new CollectionView($('.collection-panel'),meta,id=>chests.open(id));
const chests=new ChestView(()=>meta,next=>{meta=next;saveMeta(meta);collections.setMeta(meta);update();},equipTheme);
function equipTheme(id:string){if(!meta.unlockedThemes.includes(id))return;theme=THEMES.find(t=>t.id===id)!;meta.selectedTheme=id;saveMeta(meta);update();}
function update(){
 updateDaily();
 $('#score').textContent=state.score.toLocaleString('ru-RU');$('#moves').textContent=String(state.moves);$('#combo').textContent=`×${state.combo}`;$('#combo-dots').textContent=Array.from({length:3},(_,i)=>i<Math.min(state.misses,3)?'○':'●').join(' ');$('#line-count').textContent=`Линий: ${state.lines}`;
 document.documentElement.style.setProperty('--accent',activeTheme().accent);renderer.set(state,activeTheme());
 slots.forEach((button,i)=>{const p=state.hand[i];button.disabled=!p||state.status!=='playing'||!!daily&&daily.outcome!=='playing';button.classList.toggle('selected',selected===i&&!!p);button.setAttribute('aria-pressed',String(selected===i));button.setAttribute('aria-label',p?`${p.shape.name}, ${p.shape.width} на ${p.shape.height}`:'Фигура использована');drawPiece(button.querySelector('canvas')!,p,activeTheme());});
 document.querySelectorAll<HTMLButtonElement>('[data-theme]').forEach(b=>{const unlocked=meta.unlockedThemes.includes(b.dataset.theme!);b.disabled=!unlocked;b.classList.toggle('locked',!unlocked);b.classList.toggle('active',b.dataset.theme===theme.id);b.setAttribute('aria-pressed',String(b.dataset.theme===theme.id));const skin=THEMES.find(t=>t.id===b.dataset.theme)!;b.title=unlocked?skin.description:`${skin.name}: выпадает из сундуков`;});
 board.dataset.moves=String(state.moves);board.dataset.score=String(state.score);board.dataset.status=state.status;
}
function makeMove(slot:number,x:number,y:number){if(busy||daily&&daily.outcome!=='playing')return;const move=place(state,slot,x,y,daily?.rng,daily?.dealer);if(!move){$('#hint').textContent='Здесь фигура не помещается. Попробуй другую клетку.';return;}
 state=move.state;if(daily)advanceDaily(daily,move);selected=-1;busy=true;renderer.hover=null;update();const animationDuration=renderer.animate(move);
 const lines=move.clear.rows.length+move.clear.columns.length;$('#hint').textContent=move.allClear?'Чистое поле! +300 очков':lines?`Линий: ${lines} · комбо ×${move.multiplier} · +${move.points} очков`:`+${move.points} очков. Продолжай в своём ритме.`;
 const pop=$('#score-pop');pop.textContent=`+${move.points}`;pop.classList.remove('show');void pop.offsetWidth;pop.classList.add('show');
 const reward=daily ? {state:meta,awards:[],total:0} : rewardPlacement(meta,move);
 if(reward.total){
  meta=reward.state;saveMeta(meta);
  const bounds=board.getBoundingClientRect();
  const origin={x:bounds.left+(x+.5)*bounds.width/8,y:bounds.top+(y+.5)*bounds.height/8};
  collections.award(meta,reward.awards,origin,Math.min(animationDuration,240));
  $('#hint').textContent+=` · Частички: +${reward.total}`;
 }
 window.setTimeout(()=>{busy=false;updateDaily();if(daily){finishDailyMove();return;}if(state.status!=='playing'){$('#result-title').textContent='Время начать с чистого листа';$('#result-copy').textContent=`Для оставшихся фигур нет места. Ходов: ${state.moves}. Линий: ${state.lines}.`;$('#result-score').textContent=state.score.toLocaleString('ru-RU');result.showModal();}},state.status==='blocked'&&reward.total&&!renderer.reduced.matches?Math.max(animationDuration+16,1100):animationDuration+16);
}
bindInput(board,slots,{selected:()=>selected,enabled:()=>!busy&&state.status==='playing'&&(!daily||daily.outcome==='playing'),select:(i)=>{if(busy||!state.hand[i]||state.status!=='playing'||daily&&daily.outcome!=='playing')return false;selected=i;update();$('#hint').textContent='Нажми на клетку для левого верхнего угла фигуры';return true;},hover:h=>renderer.showHover(h),place:makeMove});
document.querySelectorAll<HTMLButtonElement>('[data-theme]').forEach(b=>b.addEventListener('click',()=>equipTheme(b.dataset.theme!)));
$('#rules-open').addEventListener('click',()=>$<HTMLDialogElement>('#rules').showModal());document.querySelectorAll('.dialog-close').forEach(b=>b.addEventListener('click',()=>$<HTMLDialogElement>('#rules').close()));
$('#again').addEventListener('click',()=>{result.close();if(daily){enterDaily();return;}state=newGame();selected=-1;busy=false;renderer.hover=null;update();$('#hint').textContent='Выбери фигуру и клетку или перетащи на поле';});
new ResizeObserver(()=>slots.forEach((b,i)=>drawPiece(b.querySelector('canvas')!,state.hand[i],activeTheme()))).observe($('.tray'));update();

function updateDaily(){
 const today=dailyChallenge(),claimed=meta.dailyClaimed.includes(today.id);
 $('#daily-title').textContent=today.title;
 $('#daily-summary').textContent=today.description;
 $('#daily-timer').textContent=timeToRefresh();
 $('#daily-action').textContent=claimed?'Пройдено ✓':'Играть →';
 $<HTMLButtonElement>('#daily-open').disabled=busy||claimed||!!daily;
 $('#daily-open').classList.toggle('is-claimed',claimed);
 $('.intro').hidden=!!daily;
 $('.sidebar').hidden=!!daily;
 $('.layout').classList.toggle('daily-mode',!!daily);
 $('#daily-objective').hidden=!daily;
 $('#board-title').textContent=daily?'ЕЖЕДНЕВНЫЙ УРОВЕНЬ':'ИГРОВОЕ ПОЛЕ';
 $('#result-exit').hidden=!daily;
 $('#again').textContent=daily?'Попробовать снова':'Сыграть ещё';
 $<HTMLButtonElement>('#daily-exit').disabled=busy;
 if(!daily)return;
 const c=daily.challenge;
 $('#daily-date').textContent=new Date(`${c.id}T12:00:00`).toLocaleDateString('ru-RU',{day:'numeric',month:'long'});
 $('#daily-goal').textContent=c.description;
 $('#daily-help').textContent=c.kind==='blue'?'Синие клетки засчитываются при очистке строк и столбцов.':c.kind==='combo'?'Очищай линии подряд. Три хода без очистки сбрасывают комбо.':'Заполняй линии и наращивай комбо, чтобы получать больше очков.';
 $('#daily-progress').textContent=`${Math.min(daily.progress,c.target)} / ${c.target}${c.kind==='score'?' очков':c.kind==='blue'?' синих блоков':' комбо'}`;
 $('#daily-remaining').textContent=`Осталось ходов: ${Math.max(0,c.limit-state.moves)}`;
 const track=$<HTMLProgressElement>('#daily-track');track.max=c.target;track.value=daily.progress;
}
function enterDaily(){
 if(busy)return;
 const challenge=dailyChallenge();
 if(meta.dailyClaimed.includes(challenge.id)){leaveDaily();return;}
 if(!daily)coreState=state;
 daily=startDaily(challenge);state=daily.state;selected=-1;renderer.hover=null;$('#score-pop').classList.remove('show');
 $('#hint').textContent='Выполни цель и получи редкий сундук';
 update();
 $('#daily-exit').focus({preventScroll:true});
}
function leaveDaily(){
 if(busy||!daily)return;
 result.close();daily=null;state=coreState!;coreState=null;selected=-1;renderer.hover=null;$('#score-pop').classList.remove('show');
 $('#hint').textContent='Выбери фигуру и клетку или перетащи на поле';update();
 $('#rules-open').focus({preventScroll:true});
}
function finishDailyMove(){
 if(!daily||daily.outcome==='playing')return;
 if(daily.outcome==='won'){
  const reward=claimDailyChest(meta,daily);
  if(!reward){leaveDaily();return;}
  meta=reward.state;saveMeta(meta);collections.setMeta(meta);update();
  chests.showReward(reward,'Ежедневный уровень пройден');
 }else{
  $('#result-title').textContent='Ещё одна попытка?';
  $('#result-copy').textContent=state.status==='blocked'?'Для оставшихся фигур нет места. Сегодняшний уровень можно попробовать снова.':'Ходы закончились. Сегодняшний уровень можно попробовать снова.';
  $('#result-score').textContent=state.score.toLocaleString('ru-RU');result.showModal();
 }
}
$('#daily-open').addEventListener('click',enterDaily);
$('#daily-exit').addEventListener('click',leaveDaily);
$('#result-exit').addEventListener('click',leaveDaily);
result.addEventListener('cancel',event=>{if(daily){event.preventDefault();leaveDaily();}});
$('#chest-preview').addEventListener('close',()=>{if(daily?.outcome==='won')leaveDaily();});
window.setInterval(updateDaily,1000);
document.addEventListener('visibilitychange',updateDaily);
window.addEventListener('storage',()=>{meta=loadMeta();theme=THEMES.find(t=>t.id===meta.selectedTheme)!;collections.setMeta(meta);update();});
