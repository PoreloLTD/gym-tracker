"use client";

import * as React from "react";
import { Minus, Plus, X } from "lucide-react";

import { useGymStore } from "@/lib/gym/store";

function beep() {
  try {
    const Ctx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    [0, 0.22, 0.44].forEach((offset, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = i === 2 ? 1320 : 880;
      osc.type = "sine";
      gain.gain.setValueAtTime(0.001, ctx.currentTime + offset);
      gain.gain.exponentialRampToValueAtTime(0.4, ctx.currentTime + offset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + offset + 0.18);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + offset);
      osc.stop(ctx.currentTime + offset + 0.2);
    });
    window.setTimeout(() => void ctx.close(), 1200);
  } catch {
    // Audio is a nicety — never let it break a workout.
  }
}

/**
 * Sticky rest countdown shown above the bottom nav while resting between
 * sets. Runs on wall-clock time so it stays accurate if the phone locks.
 */
export function RestTimer() {
  const restTimer = useGymStore((s) => s.restTimer);
  const soundOn = useGymStore((s) => s.soundOn);
  const adjustRest = useGymStore((s) => s.adjustRest);
  const stopRest = useGymStore((s) => s.stopRest);

  const [now, setNow] = React.useState(() => Date.now());
  const firedForRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (!restTimer) return;
    const id = window.setInterval(() => setNow(Date.now()), 200);
    return () => window.clearInterval(id);
  }, [restTimer]);

  const remainingMs = restTimer ? restTimer.endsAt - now : 0;
  const done = restTimer !== null && remainingMs <= 0;

  React.useEffect(() => {
    if (!restTimer || !done) return;
    if (firedForRef.current === restTimer.endsAt) return;
    firedForRef.current = restTimer.endsAt;
    if (soundOn) beep();
    if ("vibrate" in navigator) navigator.vibrate?.([200, 100, 200, 100, 400]);
    const id = window.setTimeout(stopRest, 5000);
    return () => window.clearTimeout(id);
  }, [restTimer, done, soundOn, stopRest]);

  if (!restTimer) return null;

  const remaining = Math.max(0, Math.ceil(remainingMs / 1000));
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const progress = Math.min(
    1,
    Math.max(0, 1 - remainingMs / (restTimer.totalSeconds * 1000)),
  );

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(4.25rem+env(safe-area-inset-bottom))] z-40 px-3">
      <div
        className={`pointer-events-auto mx-auto max-w-md overflow-hidden rounded-2xl border shadow-lg backdrop-blur ${
          done
            ? "border-emerald-500/60 bg-emerald-950/95"
            : "border-zinc-700 bg-zinc-900/95"
        }`}
        role="timer"
        aria-live="polite"
      >
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-zinc-400">
              {done ? "Rest over — next set" : `Resting · ${restTimer.exerciseName}`}
            </p>
            <p
              className={`font-mono text-2xl font-bold tabular-nums ${
                done ? "text-emerald-300" : "text-zinc-50"
              }`}
            >
              {done ? "GO" : `${mins}:${String(secs).padStart(2, "0")}`}
            </p>
          </div>
          {!done && (
            <>
              <button
                type="button"
                onClick={() => adjustRest(-15)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                aria-label="Shorten rest by 15 seconds"
              >
                <Minus className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => adjustRest(15)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                aria-label="Extend rest by 15 seconds"
              >
                <Plus className="size-4" />
              </button>
            </>
          )}
          <button
            type="button"
            onClick={stopRest}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            aria-label="Skip rest"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="h-1 w-full bg-zinc-800">
          <div
            className={`h-full transition-[width] duration-200 ${
              done ? "bg-emerald-400" : "bg-emerald-500"
            }`}
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
