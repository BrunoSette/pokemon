"use client";

import { useGameStore } from "@/stores/gameStore";
import { getCachedPokemon, PokemonData } from "@/data/pokeapi";
import { PHASE1_POKEMON_IDS } from "@/data/phase1-pokemon";
import { SpriteLoader } from "@/engine/SpriteLoader";
import Link from "next/link";
import { useEffect, useState } from "react";

const TYPE_COLORS: Record<string, string> = {
  normal: "#a8a878",
  fire: "#f08030",
  water: "#6890f0",
  grass: "#78c850",
  electric: "#f8d030",
  ice: "#98d8d8",
  fighting: "#c03028",
  poison: "#a040a0",
  ground: "#e0c068",
  flying: "#a890f0",
  psychic: "#f85888",
  bug: "#a8b820",
  rock: "#b8a038",
  ghost: "#705898",
  dragon: "#7038f8",
  dark: "#705848",
  steel: "#b8b8d0",
  fairy: "#ee99ac",
};

function PokemonCard({
  id,
  seen,
  caught,
}: {
  id: number;
  seen: boolean;
  caught: boolean;
}) {
  const data = getCachedPokemon(id);
  const spriteUrl = SpriteLoader.frontSprite(id);

  if (!data) {
    return (
      <div className="bg-[#1a2030] rounded-lg p-4 border border-gray-700/30 flex flex-col items-center">
        <div className="w-16 h-16 bg-gray-800 rounded-full mb-2" />
        <p className="font-[family-name:var(--font-pixel)] text-[10px] text-gray-600">
          #{String(id).padStart(3, "0")}
        </p>
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg p-4 border flex flex-col items-center transition-all ${
        caught
          ? "bg-[#1a2030] border-[#f8d030]/30 hover:border-[#f8d030]/60"
          : seen
          ? "bg-[#1a2030] border-gray-600/30"
          : "bg-[#0d1520] border-gray-800/30"
      }`}
    >
      <div className="relative w-16 h-16 mb-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={spriteUrl}
          alt={data.name}
          className="w-full h-full"
          style={{
            imageRendering: "pixelated",
            filter: caught ? "none" : seen ? "grayscale(1)" : "brightness(0)",
          }}
        />
      </div>

      <p className="font-[family-name:var(--font-pixel)] text-[10px] text-gray-500 mb-1">
        #{String(id).padStart(3, "0")}
      </p>

      <p
        className={`font-[family-name:var(--font-pixel)] text-[10px] ${
          caught ? "text-white" : seen ? "text-gray-500" : "text-gray-700"
        }`}
      >
        {seen ? data.name.toUpperCase() : "???"}
      </p>

      {caught && (
        <div className="flex gap-1 mt-2">
          {data.types.map((type) => (
            <span
              key={type}
              className="font-[family-name:var(--font-pixel)] text-[8px] text-white px-1.5 py-0.5 rounded"
              style={{ backgroundColor: TYPE_COLORS[type] ?? "#888" }}
            >
              {type.toUpperCase()}
            </span>
          ))}
        </div>
      )}

      {caught && <div className="text-[10px] mt-1">🔴</div>}
    </div>
  );
}

export default function PokedexPage() {
  const seen = useGameStore((s) => s.pokedex.seen);
  const caught = useGameStore((s) => s.pokedex.caught);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Check if data is cached (loaded during game)
    const hasData = PHASE1_POKEMON_IDS.some((id) => getCachedPokemon(id));
    if (hasData) {
      setReady(true);
    } else {
      // Load data if coming directly to pokedex
      import("@/data/pokeapi").then(({ preloadAllPhase1 }) => {
        preloadAllPhase1().then(() => setReady(true));
      });
    }
  }, []);

  return (
    <main className="flex-1 flex flex-col bg-[#0a0a1a] p-4">
      {/* Header */}
      <div className="max-w-3xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/game"
            className="font-[family-name:var(--font-pixel)] text-xs text-[#f8d030] hover:text-[#f0e060]"
          >
            ← GAME
          </Link>
          <h1 className="font-[family-name:var(--font-pixel)] text-lg text-[#f8d030]">
            POKéDEX
          </h1>
          <Link
            href="/"
            className="font-[family-name:var(--font-pixel)] text-xs text-[#f8d030] hover:text-[#f0e060]"
          >
            MENU →
          </Link>
        </div>

        {/* Stats bar */}
        <div className="bg-[#1a2030] rounded-lg p-4 mb-6 border border-[#f8d030]/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-[family-name:var(--font-pixel)] text-[10px] text-gray-400">
                CAUGHT
              </p>
              <p className="font-[family-name:var(--font-pixel)] text-xl text-[#f8d030]">
                {caught.length}
                <span className="text-sm text-gray-500">
                  /{PHASE1_POKEMON_IDS.length}
                </span>
              </p>
            </div>
            <div>
              <p className="font-[family-name:var(--font-pixel)] text-[10px] text-gray-400">
                SEEN
              </p>
              <p className="font-[family-name:var(--font-pixel)] text-xl text-gray-300">
                {seen.length}
              </p>
            </div>
            <div className="w-48 bg-gray-800 rounded-full h-3">
              <div
                className="bg-[#f8d030] h-3 rounded-full transition-all"
                style={{
                  width: `${(caught.length / PHASE1_POKEMON_IDS.length) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Pokemon grid */}
        {!ready ? (
          <div className="flex items-center justify-center py-20">
            <p className="font-[family-name:var(--font-pixel)] text-sm text-[#f8d030] animate-pulse">
              Loading Pokédex...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {PHASE1_POKEMON_IDS.map((id) => (
              <PokemonCard
                key={id}
                id={id}
                seen={seen.includes(id)}
                caught={caught.includes(id)}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
