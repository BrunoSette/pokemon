import { EncounterTable, EncounterEntry } from '@/data/phase1-pokemon';
import { TileMapData } from '@/data/maps/pallet-route1';

export interface WildEncounter {
  pokemonId: number;
  level: number;
}

export class EncounterSystem {
  private stepsSinceLastEncounter = 0;

  check(map: TileMapData): WildEncounter | null {
    if (!map.encounters) return null;

    this.stepsSinceLastEncounter++;

    // Minimum 3 steps between encounters
    if (this.stepsSinceLastEncounter < 3) return null;

    if (Math.random() > map.encounters.rate) return null;

    this.stepsSinceLastEncounter = 0;
    const entry = this.weightedRandom(map.encounters.entries);
    const level = this.randomInRange(entry.levelRange);

    return { pokemonId: entry.pokemonId, level };
  }

  private weightedRandom(entries: EncounterEntry[]): EncounterEntry {
    const totalWeight = entries.reduce((sum, e) => sum + e.weight, 0);
    let roll = Math.random() * totalWeight;
    for (const entry of entries) {
      roll -= entry.weight;
      if (roll <= 0) return entry;
    }
    return entries[entries.length - 1];
  }

  private randomInRange(range: [number, number]): number {
    return Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];
  }
}
