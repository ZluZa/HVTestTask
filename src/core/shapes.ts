export type Cell = readonly [number, number];
export interface Shape { id: string; name: string; cells: Cell[]; width: number; height: number }
const seeds: [string, string, Cell[]][] = [
 ['single','Одна клетка',[[0,0]]],
 ...[2,3,4,5].map(n => [`line${n}`,`Линия ${n}`,Array.from({length:n},(_,x)=>[x,0] as Cell)] as [string,string,Cell[]]),
 ['square2','Квадрат 2×2',[[0,0],[1,0],[0,1],[1,1]]],
 ['corner','Уголок',[[0,0],[0,1],[1,1]]],
 ['L','Фигура L',[[0,0],[0,1],[0,2],[1,2]]],
 ['J','Фигура J',[[1,0],[1,1],[1,2],[0,2]]],
 ['T','Фигура T',[[0,0],[1,0],[2,0],[1,1]]],
 ['S','Фигура S',[[1,0],[2,0],[0,1],[1,1]]],
 ['Z','Фигура Z',[[0,0],[1,0],[1,1],[2,1]]],
 ['rect','Прямоугольник 3×2',[[0,0],[1,0],[2,0],[0,1],[1,1],[2,1]]],
 ['square3','Квадрат 3×3',Array.from({length:9},(_,i)=>[i%3,Math.floor(i/3)] as Cell)]
];
function normalize(cells:Cell[]):Cell[] { const mx=Math.min(...cells.map(c=>c[0])),my=Math.min(...cells.map(c=>c[1])); return cells.map(([x,y])=>[x-mx,y-my] as Cell).sort((a,b)=>a[1]-b[1]||a[0]-b[0]); }
export const SHAPES: Shape[] = seeds.flatMap(([id,name,seed])=>{
 const found=new Set<string>(), result:Shape[]=[]; let cells=seed;
 for(let r=0;r<4;r++){ cells=normalize(cells); const key=JSON.stringify(cells); if(!found.has(key)){found.add(key);result.push({id:`${id}-${r}`,name,cells,width:Math.max(...cells.map(c=>c[0]))+1,height:Math.max(...cells.map(c=>c[1]))+1});} cells=cells.map(([x,y])=>[-y,x]); }
 return result;
});
export const shapeById=(id:string)=>SHAPES.find(s=>s.id===id)!;
