import { COLLECTIONS, CHEST_NAMES, type ChestRarity } from '../meta/catalog';
import type { MetaState } from '../meta/store';
import type { CollectionAward } from '../meta/economy';

export function chestSvg(rarity: ChestRarity): string {
  const colors = {
    common: ['#937151', '#bd9870', '#d9c79b', '#483d35'],
    rare: ['#42678d', '#719ecc', '#bedcff', '#203c5a'],
    legendary: ['#af7b34', '#e5b65c', '#fff0b0', '#795322'],
  }[rarity];
  return `<svg class="chest-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 64" aria-hidden="true">
    ${rarity === 'legendary' ? `<path d="M16 40 3 26 6 46 21 52M64 40l13-14-3 20-15 6" fill="${colors[1]}"/><path d="m26 14-3-10 11 5 6-8 6 8 11-5-3 10" fill="${colors[2]}"/>` : ''}
    <ellipse cx="40" cy="58" rx="29" ry="4" fill="#081c25" opacity=".3"/>
    <rect x="14" y="29" width="52" height="27" rx="5" fill="${colors[0]}" stroke="${colors[3]}" stroke-width="2"/>
    <path d="M14 31V24q0-13 13-13h26q13 0 13 13v7Z" fill="${colors[1]}" stroke="${colors[3]}" stroke-width="2"/>
    <path d="M15 31h50M24 14v39M56 14v39" stroke="${colors[2]}" stroke-width="4"/>
    <path d="M29 18h22" stroke="#ffffff50" stroke-width="2" stroke-linecap="round"/>
    ${rarity === 'common' ? `<rect x="34" y="26" width="12" height="15" rx="3" fill="${colors[2]}"/><circle cx="40" cy="32" r="2" fill="${colors[3]}"/><path d="M40 33v4" stroke="${colors[3]}" stroke-width="2"/>` : `<path d="m40 24 10 10-10 11-10-11Z" fill="${colors[2]}"/><path d="m40 28 6 6-6 7-6-7Z" fill="${rarity === 'rare' ? '#90dafa' : '#fff8cc'}"/><path d="M40 28v13l6-7Z" fill="#ffffff60"/>`}
  </svg>`;
}

export function collectionMarkup(): string {
  return COLLECTIONS.map((c, i) => `<article class="collection-card ${i === 0 ? 'featured' : ''}" data-collection="${c.id}" style="--collection-color:${c.color}">
    <div class="art-wrap">
      <img class="art-base" src="${c.art}" alt="${c.title}: собираемая картинка здания">
      <img class="art-reveal" src="${c.art}" alt="" aria-hidden="true">
      <div class="art-grid" aria-hidden="true"></div>
      <span class="art-number">0${i + 1}</span>
      <span class="collection-lock"><svg viewBox="0 0 16 18" aria-hidden="true"><path d="M4 7V5a4 4 0 0 1 8 0v2M3 7h10v9H3z" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="8" cy="11" r="1" fill="currentColor"/></svg><span>Закрыто</span></span>
      <span class="art-label">${i === 0 ? 'БОТАНИЧЕСКАЯ КОЛЛЕКЦИЯ' : i === 1 ? 'ТИШИНА ПОБЕРЕЖЬЯ' : 'ГОРОДСКИЕ ИСТОРИИ'}</span>
      <span class="arrival-amount" aria-hidden="true"></span>
    </div>
    <div class="collection-info"><div><h3>${c.title}</h3><p>${c.subtitle}</p></div><span class="parts"><i>◆</i><b>0</b><span> / 100</span></span></div>
    <div class="collection-reward"><div class="progress-column"><div class="progress-caption"><span>Частички картинки</span><span class="drop-chance">${c.dropWeight}% выпадения</span></div><div class="collection-progress" role="progressbar" aria-label="${c.title}: собрано частичек" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i></i></div></div><span class="chest-marker ${c.rarity}" role="img" aria-label="${CHEST_NAMES[c.rarity]} сундук">${chestSvg(c.rarity)}</span></div>
    <div class="collection-actions"><span class="rarity-label ${c.rarity}">${CHEST_NAMES[c.rarity]} сундук</span><span class="reserve" hidden></span><button class="claim-button" hidden>Забрать</button></div>
  </article>`).join('');
}

const revealOrder = Array.from({ length: 100 }, (_, i) => ({
  x: i % 10, y: Math.floor(i / 10),
})).sort((a, b) => {
  const distance = (c: { x: number; y: number }) => Math.abs(c.x - 4.5) + Math.abs(c.y - 4.5);
  return distance(a) - distance(b) || (a.x * 17 + a.y * 31) % 101 - (b.x * 17 + b.y * 31) % 101;
});

function revealMask(amount: number): string {
  const rects = revealOrder.slice(0, amount).map(c => `<rect x="${c.x * 10}" y="${c.y * 10}" width="10.1" height="10.1" fill="white"/>`).join('');
  return `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">${rects}</svg>`)}")`;
}

export class CollectionView {
  private pending: Record<string, number> = {};
  private dock: HTMLDivElement;
  private reduced = matchMedia('(prefers-reduced-motion: reduce)');
  constructor(private root: HTMLElement, private meta: MetaState, private onClaim: (id: string) => void) {
    this.dock = document.createElement('div');
    this.dock.className = 'collection-receipts';
    this.dock.setAttribute('aria-hidden', 'true');
    document.body.append(this.dock);
    for (const c of COLLECTIONS) {
      this.card(c.id).querySelector<HTMLButtonElement>('.claim-button')!.addEventListener('click', () => this.onClaim(c.id));
    }
    this.render();
  }

  private card(id: string): HTMLElement { return this.root.querySelector(`[data-collection="${id}"]`)!; }

  private render(): void {
    let complete = 0;
    for (const c of COLLECTIONS) {
      const balance = Math.max(0, this.meta.collectionBalances[c.id] - (this.pending[c.id] || 0));
      const progress = Math.min(c.partCount, balance);
      const ready = progress === c.partCount;
      const assembled = ready || this.meta.completedCollections.includes(c.id);
      const imageProgress = assembled ? 100 : progress;
      if (assembled) complete++;
      const card = this.card(c.id);
      card.dataset.progress = String(progress);
      card.classList.toggle('is-complete', assembled);
      card.classList.toggle('chest-ready', ready);
      card.querySelector('.progress-caption > span')!.textContent = this.meta.completedCollections.includes(c.id) ? 'До следующего сундука' : 'Частички картинки';
      card.querySelector('.parts b')!.textContent = String(progress);
      card.querySelector('.collection-lock span')!.textContent = assembled ? 'Собрано' : progress ? 'Собирается' : 'Закрыто';
      const reveal = card.querySelector<HTMLElement>('.art-reveal')!;
      reveal.style.maskImage = revealMask(imageProgress);
      reveal.style.webkitMaskImage = revealMask(imageProgress);
      const bar = card.querySelector<HTMLElement>('.collection-progress')!;
      bar.setAttribute('aria-valuenow', String(progress));
      bar.querySelector<HTMLElement>('i')!.style.width = `${progress}%`;
      card.querySelector<HTMLButtonElement>('.claim-button')!.hidden = !ready;
      const reserve = card.querySelector<HTMLElement>('.reserve')!;
      reserve.hidden = balance <= c.partCount;
      reserve.textContent = `В запасе: ${balance - c.partCount}`;
    }
    this.root.querySelector('.counter')!.textContent = `${complete} / 3`;
  }

  award(meta: MetaState, awards: CollectionAward[], origin: { x: number; y: number }, delay: number): void {
    this.meta = meta;
    for (const award of awards) this.pending[award.collectionId] = (this.pending[award.collectionId] || 0) + award.amount;
    this.render();
    const summary = awards.map(a => `${COLLECTIONS.find(c => c.id === a.collectionId)!.title}: +${a.amount}`).join(' · ');
    document.querySelector('#collection-announcement')!.textContent = summary;
    awards.forEach((award, index) => {
      if (this.reduced.matches) this.arrive(award);
      else setTimeout(() => this.fly(award, origin), delay + index * 85);
    });
  }

  private arrive(award: CollectionAward): void {
    this.pending[award.collectionId] = Math.max(0, (this.pending[award.collectionId] || 0) - award.amount);
    this.render();
    const card = this.card(award.collectionId);
    const pop = card.querySelector<HTMLElement>('.arrival-amount')!;
    pop.textContent = `+${award.amount} ◆`;
    if (!this.reduced.matches) {
      pop.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, offset: .2 }, { opacity: 1, offset: .65 }, { opacity: 0, transform: 'translateY(-15px)' }], { duration: 950 });
      card.animate([{ borderColor: COLLECTIONS.find(c => c.id === award.collectionId)!.color }, { borderColor: '#344c4d' }], { duration: 700 });
    }
  }

  private fly(award: CollectionAward, origin: { x: number; y: number }): void {
    const collection = COLLECTIONS.find(c => c.id === award.collectionId)!;
    const art = this.card(award.collectionId).querySelector<HTMLElement>('.art-wrap')!;
    const r = art.getBoundingClientRect();
    const list = this.root.querySelector('.collection-scroll')!.getBoundingClientRect();
    const top = Math.max(0, r.top, list.top), bottom = Math.min(innerHeight, r.bottom, list.bottom);
    let target = { x: r.left + r.width / 2, y: (top + bottom) / 2 };
    let receipt: HTMLElement | null = null;
    // Keep the board still on mobile: an offscreen collection receives a thumbnail receipt.
    if (bottom - top < 36 || r.right < 0 || r.left > innerWidth) {
      receipt = document.createElement('div');
      receipt.className = 'collection-receipt';
      receipt.style.setProperty('--collection-color', collection.color);
      receipt.innerHTML = `<img src="${collection.art}" alt=""><div><strong>${collection.title}</strong><span>Частички: +${award.amount}</span></div><b>◆</b>`;
      this.dock.append(receipt);
      const thumb = receipt.querySelector('img')!.getBoundingClientRect();
      target = { x: thumb.left + thumb.width / 2, y: thumb.top + thumb.height / 2 };
    }
    const token = document.createElement('div');
    token.className = 'flying-part';
    token.dataset.collection = collection.id;
    token.style.color = collection.color;
    token.innerHTML = `<span>◆</span><b>+${award.amount}</b>`;
    document.body.append(token);
    const start = { x: Math.max(24, Math.min(innerWidth - 24, origin.x)), y: Math.max(24, Math.min(innerHeight - 24, origin.y)) };
    const flight = token.animate([
      { transform: `translate(${start.x}px,${start.y}px) scale(.6)`, opacity: 0 },
      { transform: `translate(${start.x + (target.x-start.x)*.2}px,${start.y-45}px) scale(1.15)`, opacity: 1, offset: .2 },
      { transform: `translate(${(start.x+target.x)/2}px,${Math.min(start.y,target.y)-65}px) scale(1)`, opacity: 1, offset: .55 },
      { transform: `translate(${target.x}px,${target.y}px) scale(.4)`, opacity: .7 },
    ], { duration: 640, easing: 'cubic-bezier(.25,.65,.4,1)', fill: 'forwards' });
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      token.remove();
      this.arrive(award);
      if (receipt) setTimeout(() => receipt!.remove(), 1200);
    };
    flight.finished.then(finish, finish);
  }

  setMeta(meta: MetaState): void {
    this.meta = meta;
    this.render();
  }
}
