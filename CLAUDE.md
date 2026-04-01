# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun run dev      # Start dev server (Next.js 16 + Turbopack) on localhost:3000
bun run build    # Production build
bun run lint     # ESLint
```

## Architecture

Pokémon Yellow-inspired browser game built with Next.js 16 (App Router) and a custom canvas-based game engine. No external game framework — rendering, input, and state management are all hand-rolled.

### Game Engine (`src/engine/`)

The engine follows a **state machine** pattern. `GameEngine` orchestrates everything:

1. **Init phase**: Fetches Pokémon data from PokeAPI, preloads sprites, registers game states
2. **Runtime**: `GameLoop` drives update/render cycle via requestAnimationFrame

**State machine** (`StateMachine.ts`): States are `overworld` | `battle` | `transition`. Each implements `StateHandler` (enter/update/render/exit). Transitions pass context (e.g., `WildEncounter` data to battle).

**Key subsystems**:
- `InputManager` — keyboard input with per-frame tick (WASD/arrows + Enter/Space)
- `SpriteLoader` — loads and caches PNG sprites from `/public/sprites/` (local files, not external URLs)
- `OverworldState` — tile-based map rendering, player movement, encounter checks on tall grass tiles (collision value `2`)
- `BattleState` → `BattleRenderer`, `BattlePokemon`, `CaptureSystem`, `damage.ts`
- `Camera` — follows player, clamps to map bounds
- `TileMapRenderer` + `TileColors` — renders layered tile maps (ground/objects/collision)

### Data (`src/data/`)

- `pokeapi.ts` — fetches and caches Pokémon stats/sprites from PokeAPI at runtime
- `phase1-pokemon.ts` — encounter tables, available Pokémon IDs for Phase 1: `[1, 4, 7, 10, 13, 16, 19, 25, 56, 133]`
- `phase1-moves.ts` — move definitions
- `maps/pallet-route1.ts` — 30x30 tile map with 3 layers (ground, objects, collision). Collision legend: `0`=walkable, `1`=blocked, `2`=tallGrass, `3`=water

### Game State (`src/stores/gameStore.ts`)

Custom external store using `useSyncExternalStore` (no Redux/Zustand). Manages party, pokédex (caught/seen), bag (pokéballs). Mutates in-place with manual listener notification.

### Pages (`src/app/`)

- `/` — main menu (New Game, Pokédex links)
- `/game` — canvas-based game (768x576), mounts `GameEngine`
- `/pokedex` — shows caught/seen Pokémon from `gameStore`

### Sprites

Pokémon sprites are stored locally in `public/sprites/` (front) and `public/sprites/back/` (back). Referenced as `/sprites/{id}.png`. The `SpriteLoader` loads them sequentially with delays to avoid Turbopack dev server rate-limiting (429s).

## Path Alias

`@/*` maps to `./src/*` (configured in tsconfig.json).
