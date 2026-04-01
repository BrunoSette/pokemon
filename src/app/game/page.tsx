"use client";

import { useRef, useEffect, useState } from "react";
import { GameEngine } from "@/engine/GameEngine";
import Link from "next/link";

export default function GamePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingText, setLoadingText] = useState("Loading Pokémon data...");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || engineRef.current) return;

    canvas.width = 768;
    canvas.height = 576;

    const engine = new GameEngine(canvas);
    engineRef.current = engine;

    setLoadingText("Loading Pokémon data...");

    engine
      .init()
      .then(() => {
        setLoadingText("Starting game...");
        setLoading(false);
        engine.start();
      })
      .catch((err) => {
        console.error("Failed to initialize game:", err);
        setLoadingText("Failed to load. Please refresh.");
      });

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  return (
    <main className="flex-1 flex flex-col items-center justify-center bg-[#0a0a1a] p-4">
      {/* Top bar */}
      <div className="w-full max-w-[768px] flex items-center justify-between mb-3">
        <Link
          href="/"
          className="font-[family-name:var(--font-pixel)] text-xs text-[#f8d030] hover:text-[#f0e060] transition-colors"
        >
          ← MENU
        </Link>
        <h1 className="font-[family-name:var(--font-pixel)] text-xs text-[#f8d030]">
          POKéMON YELLOW COLLECTOR
        </h1>
        <Link
          href="/pokedex"
          className="font-[family-name:var(--font-pixel)] text-xs text-[#f8d030] hover:text-[#f0e060] transition-colors"
        >
          POKéDEX →
        </Link>
      </div>

      {/* Game container */}
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0a1a] z-10 rounded-lg">
            <div className="text-4xl mb-4 animate-bounce">⚡</div>
            <p className="font-[family-name:var(--font-pixel)] text-sm text-[#f8d030] animate-pulse">
              {loadingText}
            </p>
          </div>
        )}
        <canvas
          ref={canvasRef}
          className="border-4 border-[#f8d030]/30 rounded-lg shadow-[0_0_30px_rgba(248,208,48,0.15)]"
          style={{ imageRendering: "pixelated" }}
          tabIndex={0}
        />
      </div>

      {/* Controls hint */}
      <div className="mt-3 flex gap-6">
        <span className="font-[family-name:var(--font-pixel)] text-[10px] text-gray-500">
          WASD/ARROWS: Move
        </span>
        <span className="font-[family-name:var(--font-pixel)] text-[10px] text-gray-500">
          ENTER/SPACE: Confirm
        </span>
      </div>
    </main>
  );
}
