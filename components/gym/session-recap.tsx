"use client";

import * as React from "react";
import { format } from "date-fns";
import { ChevronDown, Trophy, TrendingDown, TrendingUp } from "lucide-react";

import {
  compareSessions,
  comparableBefore,
  formatDelta,
  formatScore,
  type SessionComparison,
} from "@/lib/gym/compare";
import { getDay } from "@/lib/gym/plan";
import { formatKg } from "@/lib/gym/progression";
import type { WorkoutSession } from "@/lib/gym/store";

function deltaTone(diff: number, hasBaseline: boolean): string {
  if (!hasBaseline) return "text-zinc-500";
  if (diff > 0) return "text-emerald-400";
  if (diff < 0) return "text-amber-400";
  return "text-zinc-400";
}

/** Per-exercise "last → this time" rows shared by the recap card and history. */
export function ExerciseDeltaList({ comparison }: { comparison: SessionComparison }) {
  return (
    <ul className="space-y-1.5 text-sm">
      {comparison.exercises.map((row) => {
        const hasBaseline = row.previous.length > 0;
        const now = formatScore(row.score.current, row.exercise.loadType);
        const before = hasBaseline
          ? formatScore(row.score.previous, row.exercise.loadType)
          : null;
        return (
          <li key={row.exercise.id} className="flex items-baseline justify-between gap-3">
            <span className="flex min-w-0 items-center gap-1.5 text-zinc-300">
              <span className="min-w-0 truncate">{row.exercise.name}</span>
              {row.isPR && (
                <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-1.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-emerald-300">
                  <Trophy className="size-3" /> PR
                </span>
              )}
            </span>
            <span className="shrink-0 text-right font-mono">
              {before && <span className="text-zinc-500">{before} → </span>}
              <span className="text-zinc-100">{now}</span>
              <span className={`block text-xs ${deltaTone(row.score.diff, hasBaseline)}`}>
                {hasBaseline ? formatDelta(row.score, row.exercise.loadType) : "first time"}
              </span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Post-session recap: total work versus the last comparable session of the
 * same day, with a per-exercise breakdown. Shown on the home screen for the
 * most recent finished session.
 */
export function SessionRecap({
  session,
  sessions,
}: {
  session: WorkoutSession;
  sessions: WorkoutSession[];
}) {
  const [open, setOpen] = React.useState(true);
  const day = getDay(session.dayId);
  const comparison = React.useMemo(
    () => compareSessions(session, comparableBefore(sessions, session), day.exercises),
    [session, sessions, day.exercises],
  );
  const { tonnage, previous } = comparison;
  const up = tonnage.diff > 0;
  const hasBaseline = previous !== undefined && tonnage.previous > 0;

  return (
    <div
      className={`rounded-2xl border p-4 ${
        hasBaseline && up
          ? "border-emerald-500/40 bg-emerald-500/[0.06]"
          : "border-zinc-800 bg-zinc-900"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            Last session · {format(session.startedAt, "EEE d MMM")}
          </p>
          <h2 className="mt-0.5 text-lg font-bold text-zinc-50">{day.title}</h2>
        </div>
        {hasBaseline ? (
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-sm font-semibold ${
              up
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                : tonnage.diff < 0
                  ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
                  : "border-zinc-700 text-zinc-300"
            }`}
          >
            {up ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
            {formatDelta(tonnage, "weight")}
          </span>
        ) : (
          <span className="rounded-full border border-zinc-700 px-2.5 py-1 text-xs text-zinc-400">
            first {day.title} logged
          </span>
        )}
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-zinc-950/60 p-2">
          <p className="font-mono text-lg font-bold text-emerald-300">
            {formatKg(tonnage.current)}
          </p>
          <p className="text-[0.65rem] uppercase tracking-wider text-zinc-500">
            {hasBaseline ? `vs ${formatKg(tonnage.previous)}` : "tonnage"}
          </p>
        </div>
        <div className="rounded-xl bg-zinc-950/60 p-2">
          <p className="font-mono text-lg font-bold text-zinc-100">
            {comparison.improved}
            {hasBaseline && (
              <span className="text-sm text-zinc-500">/{comparison.exercises.filter((r) => r.previous.length > 0).length}</span>
            )}
          </p>
          <p className="text-[0.65rem] uppercase tracking-wider text-zinc-500">
            lifts up
          </p>
        </div>
        <div className="rounded-xl bg-zinc-950/60 p-2">
          <p className="font-mono text-lg font-bold text-zinc-100">
            {comparison.prCount}
          </p>
          <p className="text-[0.65rem] uppercase tracking-wider text-zinc-500">
            PRs
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mt-3 flex w-full items-center justify-between text-xs font-semibold uppercase tracking-wider text-zinc-500"
        aria-expanded={open}
      >
        {hasBaseline ? "Last time → this time, per exercise" : "What you logged"}
        <ChevronDown className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="mt-2">
          <ExerciseDeltaList comparison={comparison} />
        </div>
      )}
    </div>
  );
}
