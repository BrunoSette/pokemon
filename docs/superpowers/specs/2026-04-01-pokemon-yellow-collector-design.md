# Pokémon Yellow Collector — Game Design Spec

## Overview

A web-based Pokémon collection game inspired by HeartGold/SoulSilver visual style. Players explore top-down tile maps, encounter wild Pokémon in tall grass, battle them in a turn-based system, and capture them to complete their Pokédex. Covers Gen 1 + Gen 2 (251 Pokémon) across Kanto and Johto regions.

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js 15 (App Router) | Routing, SSR, API |
| Rendering | HTML5 Canvas 2D | Game map, battles, sprites |
| UI | Tailwind CSS | Menus, Pokédex, overlays |
| Database | Convex | Auth, game saves, real-time sync |
| Pokémon Data | PokéAPI v2 | Sprites, stats, types, moves, evolutions |
| Audio | HGSS Sound Assets | Music and SFX from HeartGold/SoulSilver |
| Deploy | Vercel | Hosting |
| Package Manager | bun | Per user preference |

## Visual Style

**Reference:** HeartGold/SoulSilver + Platinum (Nintendo DS era)
- Top-down overworld with detailed 2D tile sprites
- Rich color palette (DS capabilities)
- Character sprites with walk animations (4 directions × 3 frames)
- Battle screen with Pokémon sprites (front/back), HP bars, move selection
- PokéAPI sprites: `https://pokeapi.co/api/v2/pokemon/{id}` provides multiple sprite styles

## Core Game Loop

```
Explore Map → Tall Grass Encounter → Turn-Based Battle → Capture → Pokédex → Explore Map
```

## Game Systems

### 1. Map & Movement
- Tile-based top-down map rendered on Canvas 2D
- Player moves with arrow keys / WASD
- Tile types: walkable, blocked (walls/water), tall grass (encounters), buildings
- Camera follows player with smooth scrolling
- Map data stored as 2D arrays (tile IDs)
- Collision detection per tile
- Map transitions between routes/towns

### 2. Encounter System
- Walking on tall grass tiles triggers random encounters
- Encounter rate: ~15% per step on grass tiles
- Each route has a Pokémon encounter table with:
  - Species available
  - Level range
  - Rarity (common/uncommon/rare)
- Battle transition animation (screen flash/swirl)

### 3. Battle System (Turn-Based)
- 1v1: player's active Pokémon vs wild Pokémon
- Each turn: player chooses action → both Pokémon act (speed determines order)
- **Actions:**
  - **Fight** — choose from up to 4 moves
  - **Bag** — use items (Potions, Pokéballs)
  - **Pokémon** — switch active Pokémon
  - **Run** — escape (success based on speed comparison)
- **Damage formula:** Simplified Gen 2 formula
  - `damage = (((2 * level / 5 + 2) * power * atk / def) / 50 + 2) * modifier`
  - modifier = STAB × type effectiveness × random(0.85-1.0)
- **Type effectiveness:** Full Gen 2 type chart (17 types)
- HP bars with animated drain
- Battle log text box at bottom

### 4. Capture System
- Use Pokéball during battle (from Bag)
- Capture rate based on:
  - Pokémon's remaining HP (lower = easier)
  - Pokéball type (Pokéball, Great Ball, Ultra Ball, Master Ball)
  - Species catch rate (from PokéAPI)
- Shake animation (1-3 shakes + capture or break free)
- Captured Pokémon added to party (max 6) or PC storage

### 5. Pokémon Party & PC
- Party: up to 6 Pokémon carried with the player
- PC: unlimited storage for excess Pokémon
- Each Pokémon has: species, nickname, level, XP, HP, moves, stats
- Stats calculated from base stats + level (simplified, no IVs/EVs for MVP)

### 6. XP & Level Up
- XP gained from defeating/catching wild Pokémon
- XP formula: `base_xp * enemy_level / 5`
- Level up: stat increases, potential new moves
- Moves learned from PokéAPI learnset data

### 7. Evolution
- Level-based evolution (e.g., Charmander → Charmeleon at Lv16)
- Item-based evolution (e.g., Pikachu + Thunder Stone → Raichu)
- Evolution animation with sprite transition
- Evolution data from PokéAPI

### 8. Items & Bag
- **Pokéballs:** Pokéball, Great Ball, Ultra Ball, Master Ball
- **Medicine:** Potion, Super Potion, Hyper Potion, Revive
- **Evolution stones:** Fire Stone, Water Stone, Thunder Stone, Leaf Stone, Moon Stone
- **Key items:** Town Map
- Items obtained by: purchasing (towns have shops), finding on map
- Bag organized by category

### 9. Pokédex
- Visual catalog of all 251 Pokémon
- States: unseen (silhouette), seen (sprite), caught (full data)
- Filter by: type, region (Kanto/Johto), caught status
- Search by name/number
- Detail view: sprite, types, stats, description, evolution chain
- Progress counter: "Caught 47/251"

### 10. World Map & Regions

**Kanto (Gen 1 — 151 Pokémon):**
- Pallet Town (start), Route 1, Viridian City, Route 2, Viridian Forest...
- Simplified: ~10 routes + ~5 towns for MVP

**Johto (Gen 2 — 100 Pokémon):**
- New Bark Town, Route 29, Cherrygrove City...
- Simplified: ~10 routes + ~5 towns for MVP

Each route has unique encounter tables matching the original games.

### 11. HM System
- **Fly:** Open world map, teleport to any visited town
- **Cut:** Remove small trees blocking paths to new areas
- **Surf:** Travel on water tiles (access water routes)
- HMs taught to Pokémon as moves
- Usable from party menu when facing the right obstacle

### 12. Audio
- **Source:** HeartGold/SoulSilver soundtrack and SFX
- Town music, route music, battle music, victory fanfare
- SFX: menu select, damage, capture shake, level up
- Volume control in settings
- Web Audio API for playback

## Data Architecture (Convex)

### Tables

```
users
  - id, email, createdAt

game_saves
  - userId, playerName, position (x, y, mapId)
  - party (Pokémon[6]), pc (Pokémon[]), bag (items[])
  - pokedex (seen[], caught[]), badges
  - playTime, createdAt, updatedAt

pokemon (cached from PokéAPI)
  - pokedexNumber, name, types, baseStats
  - moves, evolutionChain, catchRate, baseXp
  - sprites (front, back, shiny)
```

### Auth
- Convex Auth with email/password and social login (Google, GitHub)
- Auto-save on key events (capture, battle end, map transition)

## Pages / Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page — title screen with "New Game" / "Continue" |
| `/game` | Main game canvas (map exploration + battles) |
| `/pokedex` | Full Pokédex view (React + Tailwind, not canvas) |
| `/settings` | Volume, controls, account management |

## MVP Phases

### Phase 1 — Foundation
- Next.js + Canvas 2D + Convex setup
- Tile map engine with one test map
- Player movement (WASD/arrows) with collision
- Tall grass encounters (random Pokémon)
- Battle screen: Fight (1 move), Run
- Capture with Pokéball
- Basic Pokédex list
- 10 Pokémon available (starters + route 1 common)

### Phase 2 — Progression
- Full battle system (4 moves, type effectiveness, items)
- XP, level up, stat growth
- Evolution (level + stones)
- Multiple routes with different encounters
- Bag with items
- Party management (6 Pokémon + PC)
- Expand to ~50 Pokémon

### Phase 3 — World & Persistence
- Kanto + Johto maps (all routes/towns)
- All 251 Pokémon
- HMs: Fly, Cut, Surf
- World map with Fly navigation
- Convex auth + cloud saves
- Full Pokédex with filters/search
- HGSS music and SFX
- Settings page

## Verification Plan

1. **Phase 1 complete when:** Player can walk on map, enter tall grass, battle a wild Pokémon, capture it, and see it in Pokédex
2. **Phase 2 complete when:** Player can level up Pokémon, evolve them, use items in battle, navigate between routes
3. **Phase 3 complete when:** Player can login, save/load game, fly between towns, hear music, and the full 251 Pokémon are available
4. **Run locally:** `bun dev` → open `http://localhost:3000`
5. **Deploy:** `vercel deploy` → verify on preview URL
