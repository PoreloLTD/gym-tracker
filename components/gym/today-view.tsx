"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarRange, ChevronRight, Home, Play } from "lucide-react";

import { SessionView } from "@/components/gym/session-view";
import { blockPosition } from "@/lib/gym/block";
import { GYM_DAYS, dayForWeekday } from "@/lib/gym/plan";
import { formatKg, sessionTonnage } from "@/lib/gym/progression";
import { previousSessions, useGymStore } from "@/lib/gym/store";

export function TodayView({ goToPlan }: { goToPlan: () => void }) {
  const sessions = useGymStore((s) => s.sessions);
  const activeSessionId = useGymStore((s) => s.activeSessionId);
  const blockStartISO = useGymStore((s) => s.blockStartISO);
  const setBlockStart = useGymStore((s) => s.setBlockStart);
  const startSession = useGymStore((s) => s.startSession);

  const active = sessions.find((s) => s.id === activeSessionId);
  if (active) return <SessionView session={active} />;

  const now = new Date();
  const todayDay = dayForWeekday(now.getDay());
  const block = blockStartISO ? blockPosition(blockStartISO, now) : null;

  // Mon-first index of today, to mark this week's done days.
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() - ((now.getDay() + 6) % 7));
  const doneThisWeek = new Set(
    sessions
      .filter((s) => s.finishedAt && s.startedAt >= monday.getTime())
      .map((s) => s.dayId),
  );

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 font-bold text-zinc-50">
            <CalendarRange className="size-4 text-emerald-400" />
            {block ? `Week ${block.week} of 12` : "12-week bulk block"}
          </h2>
          {block?.isDeload && (
            <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-300">
              {block.isTestWeek ? "Test week" : "Deload — half sets, 80% load"}
            </span>
          )}
        </div>
        {block ? (
          <p className="mt-1 text-sm text-zinc-400">{block.stageLabel}</p>
        ) : (
          <p className="mt-1 text-sm text-zinc-400">
            Week 1 starts with your first session — or set the start date below.
          </p>
        )}
        <label className="mt-3 flex items-center justify-between gap-2 text-xs text-zinc-500">
          Block start date
          <input
            type="date"
            value={blockStartISO ?? ""}
            onChange={(e) => e.target.value && setBlockStart(e.target.value)}
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-sm text-zinc-200 [color-scheme:dark]"
          />
        </label>
      </div>

      {todayDay ? (
        <button
          type="button"
          onClick={() => startSession(todayDay.id)}
          className="flex w-full items-center gap-3 rounded-2xl bg-emerald-500 p-4 text-left shadow-lg shadow-emerald-500/10 transition-colors hover:bg-emerald-400"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-950/20">
            <Play className="size-6 text-emerald-950" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-medium uppercase tracking-wider text-emerald-900">
              Today · {format(now, "EEEE")}
            </span>
            <span className="block truncate text-lg font-bold text-emerald-950">
              Start {todayDay.title} — {todayDay.subtitle}
            </span>
          </span>
          <ChevronRight className="size-5 shrink-0 text-emerald-900" />
        </button>
      ) : (
        <button
          type="button"
          onClick={goToPlan}
          className="flex w-full items-center gap-3 rounded-2xl border border-zinc-700 bg-zinc-900 p-4 text-left transition-colors hover:bg-zinc-800"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-zinc-800">
            <Home className="size-6 text-emerald-400" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-medium uppercase tracking-wider text-zinc-500">
              Today · {format(now, "EEEE")} — shift day
            </span>
            <span className="block text-lg font-bold text-zinc-50">
              Home routine (~30 min)
            </span>
            <span className="block text-sm text-zinc-400">
              No lifting — skills, prehab and stretching. See the plan.
            </span>
          </span>
          <ChevronRight className="size-5 shrink-0 text-zinc-500" />
        </button>
      )}

      <section>
        <h3 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Gym days — start any session
        </h3>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {GYM_DAYS.map((day) => {
            const last = previousSessions(sessions, day.id)[0];
            const lastTonnage = last
              ? sessionTonnage(last.sets, day.exercises)
              : 0;
            const done = doneThisWeek.has(day.id);
            return (
              <button
                key={day.id}
                type="button"
                onClick={() => startSession(day.id)}
                className={`rounded-2xl border p-3 text-left transition-colors hover:bg-zinc-800 ${
                  done
                    ? "border-emerald-500/30 bg-emerald-500/[0.05]"
                    : "border-zinc-800 bg-zinc-900"
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-zinc-50">{day.title}</p>
                  {done && (
                    <span className="text-xs font-medium text-emerald-400">
                      done this week ✓
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-500">{day.subtitle}</p>
                <p className="mt-1.5 text-xs text-zinc-400">
                  {last
                    ? `Last: ${format(last.startedAt, "EEE d MMM")}${
                        lastTonnage > 0 ? ` · ${formatKg(lastTonnage)}` : ""
                      }`
                    : "Not logged yet"}
                </p>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
