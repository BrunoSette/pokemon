import { useSyncExternalStore } from 'react';
import {
  GameSaveState,
  OwnedPokemon,
  createInitialState,
} from '@/engine/state/GameSaveState';

type Listener = () => void;

const SAVE_KEY = 'pokemon-yellow-save';

function loadState(): GameSaveState {
  if (typeof window === 'undefined') return createInitialState();
  try {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* corrupted save, start fresh */ }
  return createInitialState();
}

function persistState(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch { /* storage full, ignore */ }
}

let state: GameSaveState = loadState();
const listeners = new Set<Listener>();

function notify(): void {
  listeners.forEach((l) => l());
  persistState();
}

export const gameStore = {
  getState(): GameSaveState {
    return state;
  },

  addToParty(pokemon: OwnedPokemon): void {
    if (state.player.party.length < 6) {
      state.player.party = [...state.player.party, pokemon];
    }
    if (!state.pokedex.caught.includes(pokemon.pokemonId)) {
      state.pokedex.caught = [...state.pokedex.caught, pokemon.pokemonId];
    }
    if (!state.pokedex.seen.includes(pokemon.pokemonId)) {
      state.pokedex.seen = [...state.pokedex.seen, pokemon.pokemonId];
    }
    notify();
  },

  markSeen(pokemonId: number): void {
    if (!state.pokedex.seen.includes(pokemonId)) {
      state.pokedex.seen = [...state.pokedex.seen, pokemonId];
      notify();
    }
  },

  usePokeball(): boolean {
    if (state.player.bag.pokeballs <= 0) return false;
    state.player.bag = {
      ...state.player.bag,
      pokeballs: state.player.bag.pokeballs - 1,
    };
    notify();
    return true;
  },

  updatePartyPokemon(index: number, updates: Partial<OwnedPokemon>): void {
    state.player.party = state.player.party.map((p, i) =>
      i === index ? { ...p, ...updates } : p
    );
    notify();
  },

  healParty(): void {
    state.player.party = state.player.party.map((p) => ({
      ...p,
      currentHp: p.maxHp,
    }));
    notify();
  },

  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

export function useGameStore<T>(selector: (s: GameSaveState) => T): T {
  return useSyncExternalStore(
    gameStore.subscribe,
    () => selector(gameStore.getState()),
    () => selector(gameStore.getState())
  );
}
