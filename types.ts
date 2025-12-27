export enum PetType {
  DOG = 'DOG',
  CAT = 'CAT',
  FISH = 'FISH'
}

export enum TileType {
  EMPTY = 0,
  // Structural
  DIRT = 1,
  GRASS = 2,
  STONE = 3,
  WOOD = 4,
  WATER = 5,
  GLASS = 8,
  SAND = 9,
  
  // Furniture / Needs
  BED = 6,
  FOOD_BOWL = 7,
  
  // Toys / Specifics
  TOY_BALL = 10,
  TOY_YARN = 11,
  ALGAE = 12,
  DECOR = 13
}

export interface Coordinates {
  x: number;
  y: number;
}

export interface PetStats {
  hunger: number; // 0-100 (100 is full)
  happiness: number; // 0-100 (100 is happy)
  energy: number; // 0-100 (100 is fully rested)
}

export interface GameState {
  selectedPet: PetType | null;
  petName: string;
  petPosition: Coordinates;
  petStats: PetStats;
  world: TileType[][];
  inventory: TileType[];
  mode: 'PLAY' | 'BUILD';
  selectedTile: TileType;
  messages: ChatMessage[];
}

export interface ChatMessage {
  sender: 'user' | 'pet';
  text: string;
  timestamp: number;
}

export type SpriteFrame = string[]; // Array of hex strings representing rows
export type SpriteSheet = {
  idle: SpriteFrame[];
  move: SpriteFrame[];
  sleep: SpriteFrame[];
}