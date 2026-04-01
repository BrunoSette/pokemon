export interface Move {
  name: string;
  type: string;
  power: number;
  category: 'physical' | 'special';
}

export const PHASE1_MOVES: Record<number, Move> = {
  1:   { name: 'Tackle',        type: 'normal',   power: 40, category: 'physical' },
  4:   { name: 'Scratch',       type: 'normal',   power: 40, category: 'physical' },
  7:   { name: 'Tackle',        type: 'normal',   power: 40, category: 'physical' },
  10:  { name: 'Tackle',        type: 'normal',   power: 40, category: 'physical' },
  13:  { name: 'Poison Sting',  type: 'poison',   power: 15, category: 'physical' },
  16:  { name: 'Tackle',        type: 'normal',   power: 40, category: 'physical' },
  19:  { name: 'Tackle',        type: 'normal',   power: 40, category: 'physical' },
  25:  { name: 'Thunder Shock', type: 'electric', power: 40, category: 'special' },
  56:  { name: 'Scratch',       type: 'normal',   power: 40, category: 'physical' },
  133: { name: 'Tackle',        type: 'normal',   power: 40, category: 'physical' },
};

export function getMoveForPokemon(pokemonId: number): Move {
  return PHASE1_MOVES[pokemonId] ?? { name: 'Tackle', type: 'normal', power: 40, category: 'physical' };
}
