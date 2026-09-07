// Session-over-session comparison: how much more (or less) was done this
// time versus the last comparable session of the same day.

import type { LoadType, PlanExercise } from "@/lib/gym/plan";
import {
  bestSet,
  delta,
  formatKg,
  formatSeconds,
  sessionTonnage,
  workScore,
  type Delta,
  type LoggedSet,
} from "@/lib/gym/progression";
import type { WorkoutSession } from "@/lib/gym/store";

/** The finished, non-deload session of the same day that came before this one. */
export function comparableBefore(
  sessions: WorkoutSession[],
  session: WorkoutSession,
): WorkoutSession | undefined {
  return sessions
    .filter(
      (s) =>
        s.id !== session.id &&
        s.dayId === session.dayId &&
        s.finishedAt &&
        !s.isDeload &&
        s.startedAt < session.startedAt,
    )
    .sort((a, b) => b.startedAt - a.startedAt)[0];
}

/** Best set beat the previous best: heavier, or same load for more reps/seconds. */
export function isPersonalBest(current: LoggedSet[], previous: LoggedSet[]): boolean {
  const now = bestSet(current);
  const before = bestSet(previous);
  if (!now || !before) return false;
  return (
    now.weight > before.weight ||
    (now.weight === before.weight && now.reps > before.reps)
  );
}

export interface ExerciseComparison {
  exercise: PlanExercise;
  current: LoggedSet[];
  previous: LoggedSet[];
  /** workScore delta: tonnage (kg), reps, or seconds depending on load type. */
  score: Delta;
  isPR: boolean;
}

export interface SessionComparison {
  previous: WorkoutSession | undefined;
  tonnage: Delta;
  sets: Delta;
  exercises: ExerciseComparison[];
  /** Exercises whose work score went up. */
  improved: number;
  prCount: number;
}

function countSets(session: WorkoutSession | undefined): number {
  if (!session) return 0;
  return Object.values(session.sets).reduce((n, s) => n + s.length, 0);
}

export function compareSessions(
  current: WorkoutSession,
  previous: WorkoutSession | undefined,
  exercises: PlanExercise[],
): SessionComparison {
  const rows = exercises
    .filter(
      (ex) =>
        (current.sets[ex.id] ?? []).length > 0 ||
        (previous?.sets[ex.id] ?? []).length > 0,
    )
    .map((ex) => {
      const cur = current.sets[ex.id] ?? [];
      const prev = previous?.sets[ex.id] ?? [];
      return {
        exercise: ex,
        current: cur,
        previous: prev,
        score: delta(workScore(cur, ex.loadType), workScore(prev, ex.loadType)),
        isPR: isPersonalBest(cur, prev),
      };
    });

  return {
    previous,
    tonnage: delta(
      sessionTonnage(current.sets, exercises),
      previous ? sessionTonnage(previous.sets, exercises) : 0,
    ),
    sets: delta(countSets(current), countSets(previous)),
    exercises: rows,
    improved: rows.filter((r) => r.previous.length > 0 && r.score.diff > 0).length,
    prCount: rows.filter((r) => r.isPR).length,
  };
}

/** Human form of a work score for the exercise's load type. */
export function formatScore(value: number, loadType: LoadType): string {
  if (loadType === "weight") return formatKg(value);
  if (loadType === "time") return formatSeconds(value);
  return `${Math.round(value * 10) / 10} reps`;
}

/** "+220 kg (+11%)" style label for a delta; empty string when there is no baseline. */
export function formatDelta(d: Delta, loadType: LoadType): string {
  if (d.previous === 0) return "";
  const sign = d.diff > 0 ? "+" : d.diff < 0 ? "−" : "±";
  const abs = Math.abs(d.diff);
  const value =
    loadType === "weight"
      ? formatKg(abs)
      : loadType === "time"
        ? formatSeconds(abs)
        : `${Math.round(abs * 10) / 10}`;
  const pct = d.pct === null ? "" : ` (${sign}${Math.abs(Math.round(d.pct))}%)`;
  return `${sign}${value}${pct}`;
}
