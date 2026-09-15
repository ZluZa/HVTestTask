import { COLLECTIONS, CHEST_NAMES, type Theme } from '../meta/catalog';
import { openChest, CHEST_ODDS, type ChestReward } from '../meta/chests';
import type { MetaState } from '../meta/store';
import { chestSvg } from './collections';
import { block } from '../render/canvas';

export const SKIN_RARITY_NAMES = { common: 'Обычный', rare: 'Редкий', legendary: 'Легендарный' };

export function themeMarkup(themes: Theme[]): string {
  return themes.map(t => `<button class="theme-button" data-theme="${t.id}" aria-label="Тема ${t.name}" title="${t.description}">
    <span class="swatches" style="background:${t.board}">${t.colors.slice(0,3).map(c=>`<i style="background:${c}"></i>`).join('')}<span class="theme-lock" aria-hidden="true"><svg viewBox="0 0 16 18"><path d="M4 7V5a4 4 0 0 1 8 0v2M3 7h10v9H3z" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="8" cy="11" r="1" fill="currentColor"/></svg></span></span>
    <span class="theme-name">${t.name}</span><small class="skin-rarity ${t.rarity}">${SKIN_RARITY_NAMES[t.rarity]}</small><b>✓</b>
  </button>`).join('');
}

function previewTheme(canvas: HTMLCanvasElement, theme: Theme): void {
  const width=280, height=158, dpr=Math.min(devicePixelRatio || 1,2);
  canvas.width=width*dpr;canvas.height=height*dpr;
  const ctx=canvas.getContext('2d')!;
  ctx.scale(dpr,dpr);ctx.fillStyle=theme.board;ctx.fillRect(0,0,width,height);
  const size=31, left=16, top=17;
  for(let y=0;y<4;y++)for(let x=0;x<8;x++){
    ctx.fillStyle=theme.cell;ctx.beginPath();ctx.roundRect(left+x*size+2,top+y*size+2,size-4,size-4,4);ctx.fill();
    if(y===3&&x<6 || y===2&&x>2&&x<7 || y===1&&x===3 || y===0&&x===6)
      block(ctx,left+x*size,top+y*size,size,theme.colors[(x+y)%6]);
  }
}

export class ChestView {
  private dialog = document.querySelector<HTMLDialogElement>('#chest-preview')!;
  private timer = 0;
  private reward: ChestReward | null = null;
  private reduced = matchMedia('(prefers-reduced-motion: reduce)');
  constructor(private getMeta: () => MetaState, private commit: (state: MetaState) => void, private equip: (id: string) => void) {
    this.dialog.addEventListener('close', () => { clearTimeout(this.timer);this.dialog.classList.remove('opening'); });
    this.dialog.querySelector('.chest-equip')!.addEventListener('click', () => {
      if(this.reward && !this.reward.duplicate) this.equip(this.reward.theme.id);
      this.dialog.close();
    });
    this.dialog.querySelectorAll('.chest-close').forEach(b => b.addEventListener('click', () => this.dialog.close()));
  }
  open(collectionId: string): void {
    if (this.dialog.open) return;
    const reward = openChest(this.getMeta(), collectionId);
    if (!reward) return;
    // Save the transaction before animation. Reloading cannot reroll or lose an unlock.
    this.commit(reward.state);
    const collection = COLLECTIONS.find(c => c.id === collectionId)!;
    this.showReward(reward,collection.title);
  }
  showReward(reward: ChestReward, source: string): void {
    if(this.dialog.open)return;
    this.reward = reward;
    const odds = CHEST_ODDS[reward.chestRarity];
    this.dialog.dataset.duplicate = String(reward.duplicate);
    this.dialog.dataset.skin = reward.theme.id;
    this.dialog.style.setProperty('--reward-color', reward.theme.accent);
    this.dialog.querySelector('.chest-source')!.textContent = `${CHEST_NAMES[reward.chestRarity]} сундук · ${source}`;
    this.dialog.querySelector('.chest-preview-art')!.innerHTML = chestSvg(reward.chestRarity);
    this.dialog.querySelector('h2')!.textContent = 'Открываем сундук…';
    this.dialog.querySelector('.chest-preview-copy')!.textContent = 'Немного магии для твоего поля';
    this.dialog.querySelector('.chest-odds')!.textContent = `Шансы: обычный ${odds.common}% · редкий ${odds.rare}% · легендарный ${odds.legendary}%`;
    this.dialog.querySelector<HTMLElement>('.skin-reward')!.hidden=true;
    this.dialog.querySelector<HTMLElement>('.chest-actions')!.hidden=true;
    this.dialog.querySelector<HTMLElement>('.chest-preview-art')!.hidden=false;
    this.dialog.classList.add('opening');
    this.dialog.showModal();
    this.timer=window.setTimeout(()=>this.reveal(reward),this.reduced.matches?0:720);
  }
  private reveal(reward: ChestReward): void {
    this.dialog.classList.remove('opening');
    this.dialog.querySelector<HTMLElement>('.chest-preview-art')!.hidden=true;
    this.dialog.querySelector<HTMLElement>('.skin-reward')!.hidden=false;
    this.dialog.querySelector<HTMLElement>('.chest-actions')!.hidden=false;
    this.dialog.querySelector('h2')!.textContent = reward.duplicate ? 'Этот скин уже есть' : 'Новый скин!';
    this.dialog.querySelector('.reward-name')!.textContent = reward.theme.name;
    const rarity=this.dialog.querySelector<HTMLElement>('.reward-rarity')!;
    rarity.textContent=SKIN_RARITY_NAMES[reward.theme.rarity];rarity.className=`reward-rarity skin-rarity ${reward.theme.rarity}`;
    const source=COLLECTIONS.find(c=>c.id===reward.collectionId)!;
    this.dialog.querySelector('.chest-preview-copy')!.textContent=reward.duplicate
      ? `Дубликат → +${reward.refund} частичек для картинки «${source.title}».`
      : 'Скин добавлен в твою коллекцию. Можно применить прямо сейчас.';
    this.dialog.querySelector<HTMLElement>('.chest-equip')!.hidden=reward.duplicate;
    this.dialog.querySelector('.chest-actions .chest-close')!.textContent=reward.duplicate?'Понятно':'Позже';
    previewTheme(this.dialog.querySelector('canvas')!,reward.theme);
  }
}
