# Pokémon Yellow Collector

A web-based Pokémon game inspired by the classic Game Boy era. Explore a tile-based overworld, encounter wild Pokémon in tall grass, battle them in a turn-based system, and capture them to fill your Pokédex.

## Play

```bash
bun install
bun run dev
```

Open http://localhost:3000 and click **New Game**.

## Controls

| Key | Action |
|-----|--------|
| WASD / Arrow keys | Move |
| Enter / Space | Confirm |

## How It Works

You start in **Pallet Town** with a level 5 Pikachu and 20 Pokéballs. Walk out of town through the fence openings and find **tall grass** patches (darker green tiles) on the routes. Each step on tall grass has a 15% chance of triggering a wild Pokémon encounter.

In battle you can **Fight** (attack with your Pokémon's move) or **Catch** (throw a Pokéball). Weaken wild Pokémon first to increase your catch rate. Caught Pokémon appear in your Pokédex.

### Available Wild Pokémon

| Pokémon | Rarity |
|---------|--------|
| Pidgey | Common |
| Rattata | Common |
| Caterpie | Uncommon |
| Weedle | Uncommon |
| Pikachu | Rare |

## Tech Stack

- **Next.js 16** (App Router + Turbopack)
- **HTML5 Canvas 2D** — custom game engine (no external game framework)
- **Tailwind CSS** — menus and UI overlays
- **PokéAPI v2** — Pokémon stats and data
- **localStorage** — game save persistence

## Project Structure

```
src/
  app/            # Next.js pages (menu, game, pokédex)
  engine/         # Game engine (state machine, rendering, input, battles)
  data/           # Pokémon data, moves, map definitions
  stores/         # Game state management
public/sprites/   # Local Pokémon sprite PNGs
```

## License

This is a fan project for educational purposes. Pokémon is a trademark of Nintendo/Game Freak/Creatures Inc.
