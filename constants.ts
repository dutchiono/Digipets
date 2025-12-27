import { PetType, TileType } from './types';

export const WORLD_SIZE = 12;
export const TICK_RATE = 1000; // Game loop tick in ms

export const INITIAL_STATS = {
  hunger: 80,
  happiness: 80,
  energy: 100
};

// --- PHYSICS & INTERACTION ---

// Tiles that cannot be walked on/through
export const SOLID_TILES = [
  TileType.STONE, 
  TileType.WOOD, 
  TileType.GLASS
];

// Map interaction types to tiles
export const INTERACTABLES = {
  FEED: [TileType.FOOD_BOWL],
  SLEEP: [TileType.BED],
  PLAY: [TileType.TOY_BALL, TileType.TOY_YARN, TileType.DECOR, TileType.ALGAE]
};

// --- PALETTES & SPRITES ---

// Color shortcuts
const c = {
  tr: 'transparent',
  bk: '#000000',
  wh: '#ffffff',
  // Pet Colors
  d1: '#8d6e63', d2: '#5d4037', // Dog
  c1: '#fb923c', c2: '#ea580c', // Cat
  f1: '#f97316', f2: '#c2410c', f3: '#fbbf24', // Fish
  
  // Tile Colors
  dirt1: '#5d4037', dirt2: '#4e342e',
  grass1: '#4caf50', grass2: '#388e3c',
  stone1: '#9e9e9e', stone2: '#757575',
  wood1: '#795548', wood2: '#5d4037',
  water1: '#2196f3', water2: '#1976d2',
  sand1: '#fdd835', sand2: '#fbc02d',
  glass1: '#e0f7fa', glass2: '#80deea',
  
  // Items
  bed1: '#ef5350', bed2: '#c62828',
  bowl1: '#ff9800', bowl2: '#e65100', food: '#795548',
  ball1: '#ef4444', ball2: '#b71c1c',
  yarn1: '#9c27b0', yarn2: '#7b1fa2',
  algae1: '#4caf50', algae2: '#2e7d32',
  castle1: '#ec407a', castle2: '#880e4f', stone3: '#616161'
};

// Pet Sprites
const PET_PALETTES: Record<string, Record<string, string>> = {
  DOG:   { '.': c.tr, '#': c.d1, 'o': c.d2, 'w': c.wh, 'b': c.bk },
  CAT:   { '.': c.tr, '#': c.c1, 'o': c.c2, 'w': c.wh, 'b': c.bk },
  FISH:  { '.': c.tr, '#': c.f1, 'o': c.f2, 'w': c.wh, 'b': c.bk, 'f': c.f3 }
};

const PET_SPRITES: Record<PetType, { raw: any, palette: any }> = {
  [PetType.DOG]: {
    palette: PET_PALETTES.DOG,
    raw: {
      idle:  ['........', '........', '..#..#..', '.######.', '.#b##b#.', '.##o###.', '.######.', '.#....#.'],
      move:  ['........', '........', '..#..#..', '.######.', '.#b##b#.', '.##o###.', '.######.', '..#..#..'],
      sleep: ['........', '........', '........', '........', '.######.', '########', '########', '........']
    }
  },
  [PetType.CAT]: {
    palette: PET_PALETTES.CAT,
    raw: {
      idle:  ['........', '#......#', '#......#', '.######.', '.#b##b#.', '.##o###.', '.######.', '.#....#.'],
      move:  ['........', '#......#', '#......#', '.######.', '.#b##b#.', '.##o###.', '.######.', '..#..#..'],
      sleep: ['........', '........', '........', '.######.', '.######.', '.######.', '########', '........']
    }
  },
  [PetType.FISH]: {
    palette: PET_PALETTES.FISH,
    raw: {
      idle:  ['........', '........', '........', '..####..', '.f#b###.', '.######f', '..####..', '........'],
      move:  ['........', '........', '........', '..####..', '.f#b###.', '.######.', '..####f.', '........'],
      sleep: ['........', '........', '........', '........', '..####..', '.f#####.', '.######f', '..####..']
    }
  }
};

// Tile Sprites
const TILE_PATTERNS: Record<number, string[]> = {
  [TileType.EMPTY]: [
    '........', '........', '........', '........', '........', '........', '........', '........'
  ],
  [TileType.DIRT]: [
    '11121111', '12111121', '11112111', '11211111', '11111211', '21111112', '11121111', '11111121'
  ],
  [TileType.GRASS]: [
    '11211121', '11211211', '21111111', '11112111', '11211121', '11111111', '21112111', '11111121'
  ],
  [TileType.STONE]: [
    '11111111', '12222111', '12112111', '12222111', '11111122', '11111121', '11221122', '11111111'
  ],
  [TileType.WOOD]: [
    '12112112', '12112112', '12112112', '12112112', '12112112', '12112112', '12112112', '12112112'
  ],
  [TileType.WATER]: [
    '11111121', '11211111', '11111111', '21111121', '11112111', '11211111', '11111111', '21111121'
  ],
  [TileType.GLASS]: [
    '22222222', '21111112', '21111112', '21111112', '21111112', '21111112', '21111112', '22222222'
  ],
  [TileType.SAND]: [
    '11211111', '11111211', '21111111', '11111121', '11211111', '11111111', '11112111', '12111112'
  ],
  [TileType.BED]: [
    '........', '........', '.222222.', '.211112.', '.211112.', '.211112.', '.222222.', '........'
  ],
  [TileType.FOOD_BOWL]: [
    '........', '........', '........', '..2222..', '.111111.', '.11f111.', '..1111..', '........'
  ],
  [TileType.TOY_BALL]: [
    '........', '...22...', '..2112..', '..2112..', '..2112..', '...22...', '........', '........'
  ],
  [TileType.TOY_YARN]: [
    '........', '...11...', '..1221..', '..1221..', '..2112..', '...22...', '...1....', '........'
  ],
  [TileType.ALGAE]: [
    '........', '.1......', '.1.1....', '.1.1.1..', '.1.1.1..', '.1.1.1..', '.1.1.1..', '.1.1.1..'
  ],
  [TileType.DECOR]: [
    '..1..1..', '.11..11.', '.111111.', '.111111.', '.112211.', '.112211.', '.111111.', '.111111.'
  ]
};

const TILE_PALETTES: Record<number, Record<string, string>> = {
  [TileType.EMPTY]: { '.': c.tr },
  [TileType.DIRT]: { '1': c.dirt1, '2': c.dirt2 },
  [TileType.GRASS]: { '1': c.grass1, '2': c.grass2 },
  [TileType.STONE]: { '1': c.stone1, '2': c.stone2 },
  [TileType.WOOD]: { '1': c.wood1, '2': c.wood2 },
  [TileType.WATER]: { '1': c.water1, '2': c.water2 },
  [TileType.GLASS]: { '1': c.glass1, '2': c.glass2 },
  [TileType.SAND]: { '1': c.sand1, '2': c.sand2 },
  [TileType.BED]: { '.': c.tr, '1': c.wh, '2': c.bed1 },
  [TileType.FOOD_BOWL]: { '.': c.tr, '1': c.bowl1, '2': c.bowl2, 'f': c.food },
  [TileType.TOY_BALL]: { '.': c.tr, '1': c.ball1, '2': c.wh },
  [TileType.TOY_YARN]: { '.': c.tr, '1': c.yarn1, '2': c.yarn2 },
  [TileType.ALGAE]: { '.': c.tr, '1': c.algae1, '2': c.algae2 },
  [TileType.DECOR]: { '.': c.tr, '1': c.stone1, '2': c.castle1 },
};

// --- HELPERS ---

export const getSprite = (type: PetType, action: 'idle' | 'move' | 'sleep'): string[][] => {
  const data = PET_SPRITES[type];
  const template = data.raw[action] || data.raw.idle;
  return template.map((row: string) => row.split('').map((char: string) => data.palette[char] || data.palette['#'] || 'transparent'));
};

export const getTileSprite = (tile: TileType): string[][] => {
  const pattern = TILE_PATTERNS[tile] || TILE_PATTERNS[TileType.EMPTY];
  const palette = TILE_PALETTES[tile] || TILE_PALETTES[TileType.EMPTY];
  return pattern.map(row => row.split('').map(char => palette[char] || c.tr));
};

export const TILE_NAMES: Record<TileType, string> = {
  [TileType.EMPTY]: 'Erase',
  [TileType.DIRT]: 'Dirt',
  [TileType.GRASS]: 'Grass',
  [TileType.STONE]: 'Stone',
  [TileType.WOOD]: 'Wood',
  [TileType.WATER]: 'Water',
  [TileType.GLASS]: 'Glass',
  [TileType.SAND]: 'Sand',
  [TileType.BED]: 'Bed',
  [TileType.FOOD_BOWL]: 'Bowl',
  [TileType.TOY_BALL]: 'Ball',
  [TileType.TOY_YARN]: 'Yarn',
  [TileType.ALGAE]: 'Algae',
  [TileType.DECOR]: 'Castle'
};

export const PET_BUILD_OPTIONS: Record<PetType, TileType[]> = {
  [PetType.DOG]: [
    TileType.GRASS, TileType.DIRT, TileType.STONE, TileType.WOOD, 
    TileType.WATER, TileType.BED, TileType.FOOD_BOWL, TileType.TOY_BALL
  ],
  [PetType.CAT]: [
    TileType.WOOD, TileType.GRASS, TileType.STONE, TileType.SAND,
    TileType.BED, TileType.FOOD_BOWL, TileType.TOY_YARN, TileType.WATER
  ],
  [PetType.FISH]: [
    TileType.WATER, TileType.SAND, TileType.GLASS, TileType.STONE, 
    TileType.ALGAE, TileType.DECOR
  ]
};