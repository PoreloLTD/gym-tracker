"use client";

import * as React from "react";
import { ClipboardList, Dumbbell, History, Volume2, VolumeX } from "lucide-react";

import { HistoryView } from "@/components/gym/history-view";
import { PlanView } from "@/components/gym/plan-view";
import { RestTimer } from "@/components/gym/rest-timer";
import { TodayView } from "@/components/gym/today-view";
import { useGymStore } from "@/lib/gym/store";

type Tab = "train" | "plan" | "history";

const TABS: { id: Tab; label: string; icon: typeof Dumbbell }[] = [
  { id: "train", label: "Train", icon: Dumbbell },
  { id: "plan", label: "Plan", icon: ClipboardList },
  { id: "history", label: "Progress", icon: History },
];

export function GymApp() {
  const [tab, setTab] = React.useState<Tab>("train");
  const hasHydrated = useGymStore((s) => s.hasHydrated);
  const soundOn = useGymStore((s) => s.soundOn);
  const toggleSound = useGymStore((s) => s.toggleSound);

  return (
    <div className="min-h-dvh w-full bg-zinc-950 text-zinc-100 [color-scheme:dark]">
      <div className="mx-auto flex min-h-dvh max-w-md flex-col px-3">
        <header className="flex items-center justify-between py-4">
          <h1 className="flex items-center gap-2 text-lg font-bold tracking-tight text-zinc-50">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500 text-emerald-950">
              <Dumbbell className="size-4" />
            </span>
            Overload
            <span className="text-sm font-normal text-zinc-500">
              · 12-week bulk
            </span>
          </h1>
          <button
            type="button"
            onClick={toggleSound}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-800 text-zinc-400 hover:bg-zinc-900"
            aria-label={soundOn ? "Mute rest timer" : "Unmute rest timer"}
          >
            {soundOn ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
          </button>
        </header>

        <main className="flex-1 pb-[calc(6.5rem+env(safe-area-inset-bottom))]">
          {!hasHydrated ? (
            <div className="space-y-3" aria-hidden>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-28 animate-pulse rounded-2xl bg-zinc-900"
                />
              ))}
            </div>
          ) : (
            <>
              {tab === "train" && <TodayView goToPlan={() => setTab("plan")} />}
              {tab === "plan" && <PlanView />}
              {tab === "history" && <HistoryView />}
            </>
          )}
        </main>
      </div>

      <RestTimer />

      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        aria-label="Gym tracker sections"
      >
        <div className="mx-auto flex max-w-md">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              aria-current={tab === id ? "page" : undefined}
              className={`flex h-[4.25rem] flex-1 flex-col items-center justify-center gap-1 text-xs font-medium transition-colors ${
                tab === id ? "text-emerald-400" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Icon className="size-5" />
              {label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
