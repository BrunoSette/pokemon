export interface EncounterEntry {
  pokemonId: number;
  levelRange: [number, number];
  weight: number;
}

export interface EncounterTable {
  entries: EncounterEntry[];
  rate: number;
}

export const ROUTE1_ENCOUNTERS: EncounterTable = {
  rate: 0.15,
  entries: [
    { pokemonId: 16, levelRange: [2, 5], weight: 40 },  // Pidgey
    { pokemonId: 19, levelRange: [2, 4], weight: 35 },  // Rattata
    { pokemonId: 10, levelRange: [3, 5], weight: 10 },  // Caterpie
    { pokemonId: 13, levelRange: [3, 5], weight: 10 },  // Weedle
    { pokemonId: 25, levelRange: [3, 5], weight: 5 },   // Pikachu
  ],
};

export const PHASE1_POKEMON_IDS = [1, 4, 7, 10, 13, 16, 19, 25, 56, 133];
