import { PokemonData } from '@/data/pokeapi';
import { Move, getMoveForPokemon } from '@/data/phase1-moves';

export interface BattlePokemonStats {
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
}

export interface BattlePokemon {
  data: PokemonData;
  level: number;
  currentHp: number;
  maxHp: number;
  stats: BattlePokemonStats;
  move: Move;
  isPlayerOwned: boolean;
}

function calcHp(base: number, level: number): number {
  return Math.floor(((2 * base * level) / 100) + level + 10);
}

function calcStat(base: number, level: number): number {
  return Math.floor(((2 * base * level) / 100) + 5);
}

export function createBattlePokemon(
  data: PokemonData,
  level: number,
  isPlayerOwned: boolean,
  currentHp?: number
): BattlePokemon {
  const maxHp = calcHp(data.baseStats.hp, level);
  return {
    data,
    level,
    currentHp: currentHp ?? maxHp,
    maxHp,
    stats: {
      attack: calcStat(data.baseStats.attack, level),
      defense: calcStat(data.baseStats.defense, level),
      specialAttack: calcStat(data.baseStats.specialAttack, level),
      specialDefense: calcStat(data.baseStats.specialDefense, level),
      speed: calcStat(data.baseStats.speed, level),
    },
    move: getMoveForPokemon(data.id),
    isPlayerOwned,
  };
}
