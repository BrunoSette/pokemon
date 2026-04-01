"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function TitleScreen() {
  const [showPress, setShowPress] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => setShowPress((v) => !v), 600);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-[#f8d030] via-[#f0c000] to-[#e8a820] relative overflow-hidden">
      {/* Pokeball background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border-[40px] border-white" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150px] h-[150px] rounded-full border-[20px] border-white bg-transparent" />
        <div className="absolute top-1/2 left-0 right-0 h-[20px] bg-white" />
      </div>

      {/* Title */}
      <div className="relative z-10 text-center">
        <h1 className="font-[family-name:var(--font-pixel)] text-2xl md:text-4xl text-[#2a1a00] mb-2 drop-shadow-[2px_2px_0_rgba(255,255,255,0.5)]">
          POKéMON
        </h1>
        <h2 className="font-[family-name:var(--font-pixel)] text-4xl md:text-6xl text-[#2a1a00] mb-1 drop-shadow-[3px_3px_0_rgba(255,255,255,0.5)]">
          YELLOW
        </h2>
        <p className="font-[family-name:var(--font-pixel)] text-sm md:text-base text-[#705808] mt-2">
          COLLECTOR
        </p>

        {/* Pikachu */}
        <div className="text-8xl my-8">⚡</div>

        {/* Menu */}
        <div className="space-y-4 mt-4">
          <Link
            href="/game"
            className="block font-[family-name:var(--font-pixel)] text-lg bg-[#2a1a00] text-[#f8d030] px-8 py-4 rounded-lg hover:bg-[#4a2a00] transition-colors shadow-lg"
          >
            NEW GAME
          </Link>
          <Link
            href="/pokedex"
            className="block font-[family-name:var(--font-pixel)] text-sm bg-[#2a1a00]/80 text-[#f8d030] px-8 py-3 rounded-lg hover:bg-[#4a2a00] transition-colors shadow-lg"
          >
            POKéDEX
          </Link>
        </div>

        {/* Blinking press start */}
        <p
          className={`font-[family-name:var(--font-pixel)] text-xs text-[#705808] mt-12 transition-opacity ${
            showPress ? "opacity-100" : "opacity-0"
          }`}
        >
          PRESS START
        </p>
      </div>

      {/* Version info */}
      <p className="absolute bottom-4 font-[family-name:var(--font-pixel)] text-[10px] text-[#705808]/60">
        v0.1.0 — Phase 1
      </p>
    </main>
  );
}
