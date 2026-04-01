import { EncounterTable, ROUTE1_ENCOUNTERS } from '../phase1-pokemon';

export interface TileMapData {
  id: string;
  name: string;
  width: number;
  height: number;
  tileSize: number;
  layers: {
    ground: number[][];
    objects: number[][];
    collision: number[][];
  };
  encounters: EncounterTable;
  spawns: Record<string, { x: number; y: number }>;
}

// Tile legend:
// Ground: 0=grass, 1=path, 2=water, 3=darkGrass, 4=sand, 5=floorTile
// Objects: 0=none, 6=tree, 7=fence, 8=house, 9=sign, 10=flower, 11=rock
// Collision: 0=walkable, 1=blocked, 2=tallGrass, 3=water

const W = 30;
const H = 30;

function fill(value: number): number[][] {
  return Array.from({ length: H }, () => Array(W).fill(value));
}

function buildGround(): number[][] {
  const g = fill(0); // all grass

  // Path running vertically through center (col 14-15)
  for (let y = 0; y < H; y++) {
    g[y][14] = 1;
    g[y][15] = 1;
  }

  // Horizontal path at row 15 (town area)
  for (let x = 5; x < 25; x++) {
    g[15][x] = 1;
  }

  // Town area (rows 12-18, cols 8-22) — floor tiles
  for (let y = 12; y <= 18; y++) {
    for (let x = 8; x <= 22; x++) {
      if (g[y][x] !== 1) g[y][x] = 5;
    }
  }

  // Pond (water area)
  for (let y = 22; y <= 24; y++) {
    for (let x = 3; x <= 6; x++) {
      g[y][x] = 2;
    }
  }

  // Sand near water
  for (let x = 2; x <= 7; x++) {
    g[21][x] = 4;
    g[25][x] = 4;
  }
  for (let y = 21; y <= 25; y++) {
    g[y][2] = 4;
    g[y][7] = 4;
  }

  // Flowers in town
  g[13][10] = 0;
  g[13][11] = 0;
  g[13][20] = 0;
  g[13][21] = 0;

  return g;
}

function buildObjects(): number[][] {
  const o = fill(0);

  // Trees border (top)
  for (let x = 0; x < W; x++) {
    o[0][x] = 6;
    o[1][x] = 6;
  }
  // Trees border (left)
  for (let y = 0; y < H; y++) {
    o[y][0] = 6;
    o[y][1] = 6;
  }
  // Trees border (right)
  for (let y = 0; y < H; y++) {
    o[y][W - 1] = 6;
    o[y][W - 2] = 6;
  }
  // Trees border (bottom, with gap for path)
  for (let x = 0; x < W; x++) {
    if (x !== 14 && x !== 15) {
      o[H - 1][x] = 6;
      o[H - 2][x] = 6;
    }
  }

  // Clear path through top border
  o[0][14] = 0; o[0][15] = 0;
  o[1][14] = 0; o[1][15] = 0;

  // Houses in town
  // House 1 (Professor's lab)
  for (let y = 12; y <= 13; y++) {
    for (let x = 9; x <= 12; x++) {
      o[y][x] = 8;
    }
  }
  // House 2 (Player's house)
  for (let y = 12; y <= 13; y++) {
    for (let x = 17; x <= 20; x++) {
      o[y][x] = 8;
    }
  }

  // Fences around town
  for (let x = 8; x <= 22; x++) {
    o[11][x] = 7;
    o[19][x] = 7;
  }
  // Clear fence for path
  o[11][14] = 0; o[11][15] = 0;
  o[19][14] = 0; o[19][15] = 0;

  // Signs
  o[14][13] = 9; // "PALLET TOWN" sign
  o[20][13] = 9; // "ROUTE 1" sign

  // Flowers
  o[16][10] = 10;
  o[16][11] = 10;
  o[16][20] = 10;
  o[16][21] = 10;

  // Rocks near path
  o[6][12] = 11;
  o[8][17] = 11;
  o[24][18] = 11;

  // Tall grass patches (route area)
  // Left patch
  for (let y = 3; y <= 7; y++) {
    for (let x = 3; x <= 8; x++) {
      if (o[y][x] === 0) o[y][x] = 0; // ground shows grass
    }
  }

  return o;
}

function buildCollision(): number[][] {
  const c = fill(0);

  // Trees = blocked
  for (let x = 0; x < W; x++) {
    c[0][x] = 1; c[1][x] = 1;
  }
  for (let y = 0; y < H; y++) {
    c[y][0] = 1; c[y][1] = 1;
    c[y][W - 1] = 1; c[y][W - 2] = 1;
  }
  for (let x = 0; x < W; x++) {
    if (x !== 14 && x !== 15) {
      c[H - 1][x] = 1; c[H - 2][x] = 1;
    }
  }
  // Clear path through borders
  c[0][14] = 0; c[0][15] = 0;
  c[1][14] = 0; c[1][15] = 0;

  // Houses = blocked
  for (let y = 12; y <= 13; y++) {
    for (let x = 9; x <= 12; x++) c[y][x] = 1;
    for (let x = 17; x <= 20; x++) c[y][x] = 1;
  }

  // Fences = blocked
  for (let x = 8; x <= 22; x++) {
    c[11][x] = 1;
    c[19][x] = 1;
  }
  c[11][14] = 0; c[11][15] = 0;
  c[19][14] = 0; c[19][15] = 0;

  // Rocks = blocked
  c[6][12] = 1;
  c[8][17] = 1;
  c[24][18] = 1;

  // Water = blocked (Phase 1, no Surf)
  for (let y = 22; y <= 24; y++) {
    for (let x = 3; x <= 6; x++) {
      c[y][x] = 3;
    }
  }

  // Tall grass patches
  // Left route patch
  for (let y = 3; y <= 7; y++) {
    for (let x = 3; x <= 8; x++) {
      if (c[y][x] === 0) c[y][x] = 2;
    }
  }
  // Right route patch
  for (let y = 4; y <= 9; y++) {
    for (let x = 18; x <= 24; x++) {
      if (c[y][x] === 0) c[y][x] = 2;
    }
  }
  // South patch
  for (let y = 22; y <= 26; y++) {
    for (let x = 10; x <= 13; x++) {
      if (c[y][x] === 0) c[y][x] = 2;
    }
  }
  // Another patch
  for (let y = 20; y <= 24; y++) {
    for (let x = 20; x <= 25; x++) {
      if (c[y][x] === 0) c[y][x] = 2;
    }
  }

  // Sign = blocked
  c[14][13] = 1;
  c[20][13] = 1;

  return c;
}

export const PALLET_ROUTE1: TileMapData = {
  id: 'pallet-route1',
  name: 'Pallet Town & Route 1',
  width: W,
  height: H,
  tileSize: 16,
  layers: {
    ground: buildGround(),
    objects: buildObjects(),
    collision: buildCollision(),
  },
  encounters: ROUTE1_ENCOUNTERS,
  spawns: {
    start: { x: 14, y: 15 },
    fromNorth: { x: 14, y: 2 },
    fromSouth: { x: 14, y: 27 },
  },
};
