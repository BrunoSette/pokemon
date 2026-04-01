import { Move } from '@/data/phase1-moves';

export interface OwnedPokemon {
  pokemonId: number;
  nickname: string | null;
  level: number;
  currentHp: number;
  maxHp: number;
  stats: {
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
  };
  move: Move;
}

export interface GameSaveState {
  player: {
    name: string;
    position: { x: number; y: number; mapId: string };
    party: OwnedPokemon[];
    bag: { pokeballs: number };
  };
  pokedex: {
    seen: number[];
    caught: number[];
  };
}

export function createInitialState(): GameSaveState {
  return {
    player: {
      name: 'RED',
      position: { x: 14, y: 15, mapId: 'pallet-route1' },
      party: [
        {
          pokemonId: 25, // Pikachu
          nickname: null,
          level: 5,
          currentHp: 19,
          maxHp: 19,
          stats: {
            attack: 10,
            defense: 6,
            specialAttack: 10,
            specialDefense: 8,
            speed: 14,
          },
          move: {
            name: 'Thunder Shock',
            type: 'electric',
            power: 40,
            category: 'special',
          },
        },
      ],
      bag: { pokeballs: 20 },
    },
    pokedex: {
      seen: [25],
      caught: [25],
    },
  };
}
