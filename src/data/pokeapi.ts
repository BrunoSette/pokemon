export interface PokemonData {
  id: number;
  name: string;
  types: string[];
  baseStats: {
    hp: number;
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
  };
  sprites: {
    front: string;
    back: string;
  };
  catchRate: number;
  baseXp: number;
}

const cache = new Map<number, PokemonData>();

export async function getPokemon(id: number): Promise<PokemonData> {
  const cached = cache.get(id);
  if (cached) return cached;

  const [pokemonRes, speciesRes] = await Promise.all([
    fetch(`https://pokeapi.co/api/v2/pokemon/${id}`),
    fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`),
  ]);

  const data = await pokemonRes.json();
  const species = await speciesRes.json();

  const pokemon: PokemonData = {
    id: data.id,
    name: data.name,
    types: data.types.map((t: { type: { name: string } }) => t.type.name),
    baseStats: {
      hp: data.stats[0].base_stat,
      attack: data.stats[1].base_stat,
      defense: data.stats[2].base_stat,
      specialAttack: data.stats[3].base_stat,
      specialDefense: data.stats[4].base_stat,
      speed: data.stats[5].base_stat,
    },
    sprites: {
      front: `/sprites/${id}.png`,
      back: `/sprites/back/${id}.png`,
    },
    catchRate: species.capture_rate,
    baseXp: data.base_experience ?? 50,
  };

  cache.set(id, pokemon);
  return pokemon;
}

export async function preloadAllPhase1(): Promise<Map<number, PokemonData>> {
  const ids = [1, 4, 7, 10, 13, 16, 19, 25, 56, 133];
  await Promise.all(ids.map((id) => getPokemon(id)));
  return cache;
}

export function getCachedPokemon(id: number): PokemonData | undefined {
  return cache.get(id);
}
