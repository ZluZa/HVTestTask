export interface Theme { id:string; name:string; board:string; cell:string; colors:string[]; accent:string; description:string; rarity:ChestRarity }
export const THEMES:Theme[]=[
 {id:'lotus',rarity:'common',name:'Лотос',board:'#14262b',cell:'#1d3339',colors:['#68cfb0','#eeaa64','#79b6e9','#aa96df','#e78d9a','#e4cc70'],accent:'#8ce4c2',description:'Мята, тёплый свет и немного тишины'},
 {id:'dusk',rarity:'rare',name:'Сумерки',board:'#252338',cell:'#353249',colors:['#b8a1f0','#efafce','#789ddd','#da9b68','#8ac9cd','#d6c67a'],accent:'#c8b4ff',description:'Мягкие оттенки вечернего города'},
 {id:'sand',rarity:'common',name:'Пески',board:'#302a24',cell:'#413930',colors:['#e4bb7b','#baca9c','#d68d70','#9bbfc9','#d7a5b9','#d5cd9c'],accent:'#ebcd95',description:'Тёплая палитра неспешного дня'},
 {id:'terracotta',rarity:'common',name:'Терракота',board:'#33262a',cell:'#4a3536',colors:['#de896f','#e1b16d','#c98796','#91aa86','#ddb1a0','#b397c6'],accent:'#edb199',description:'Тёплая глина, розовый закат и мягкие травы'},
 {id:'ocean',rarity:'rare',name:'Океан',board:'#10263c',cell:'#193a53',colors:['#54c2d8','#70a2ef','#76d6c0','#b49eee','#f0c681','#e99eae'],accent:'#83e0f0',description:'Глубокая вода и свет на прохладных волнах'},
 {id:'aurora',rarity:'legendary',name:'Аврора',board:'#201d38',cell:'#322b4f',colors:['#77ebc3','#b68aff','#65cdec','#f0b5ec','#edd987','#a5a5ff'],accent:'#d3b4ff',description:'Северное сияние в изумрудных и лиловых оттенках'}
];
export type ChestRarity = 'common' | 'rare' | 'legendary';
export const CHEST_NAMES: Record<ChestRarity,string> = {common:'Обычный',rare:'Редкий',legendary:'Легендарный'};
export interface CollectionDefinition { id:string; title:string; subtitle:string; art:string; partCount:number; dropWeight:number; rarity:ChestRarity; color:string }
export const COLLECTIONS:CollectionDefinition[]=[
 {id:'glasshouse',title:'Оранжерея',subtitle:'Место, где всё начинается',art:`${import.meta.env.BASE_URL}art/greenhouse.svg`,partCount:100,dropWeight:50,rarity:'common',color:'#8ce4c2'},
 {id:'lighthouse',title:'Маяк',subtitle:'Тихий свет на краю берега',art:`${import.meta.env.BASE_URL}art/lighthouse.svg`,partCount:100,dropWeight:40,rarity:'rare',color:'#90c7ff'},
 {id:'townhouse',title:'Дом у парка',subtitle:'Маленький уголок большого города',art:`${import.meta.env.BASE_URL}art/townhouse.svg`,partCount:100,dropWeight:10,rarity:'legendary',color:'#f0cd84'}
];
