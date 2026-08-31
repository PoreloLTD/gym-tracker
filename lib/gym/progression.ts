// Pure workload + double-progression logic for the gym tracker.
// Tonnage (kg lifted) drives the "beat last session" comparisons; the
// progression hint encodes the plan's rule: hit the top of the rep range on
// every set → add weight next session.

import type { LoadType, PlanExercise } from "@/lib/gym/plan";

export interface LoggedSet {
  /** Load in kg. For bodyweight work this is *added* weight (0 = strict BW). */
  weight: number;
  /** Reps — or seconds for `time` exercises. */
  reps: number;
  /** Epoch ms when the set was logged. */
  ts: number;
}

/** Tonnage of one set. Bodyweight/time sets count only their added load. */
export function setTonnage(set: LoggedSet, loadType: LoadType): number {
  if (loadType === "time") return 0;
  return set.weight * set.reps;
}

export function totalTonnage(sets: LoggedSet[], loadType: LoadType): number {
  return sets.reduce((sum, s) => sum + setTonnage(s, loadType), 0);
}

export function totalReps(sets: LoggedSet[]): number {
  return sets.reduce((sum, s) => sum + s.reps, 0);
}

/**
 * Single number used to compare an exercise session-over-session:
 * weighted work → tonnage; bodyweight → total reps (+ tonnage from added kg);
 * timed → total seconds.
 */
export function workScore(sets: LoggedSet[], loadType: LoadType): number {
  if (loadType === "weight") return totalTonnage(sets, loadType);
  if (loadType === "bodyweight")
    return totalReps(sets) + totalTonnage(sets, loadType);
  return totalReps(sets); // seconds
}

/** Best set: heaviest load first, then most reps/seconds at that load. */
export function bestSet(sets: LoggedSet[]): LoggedSet | null {
  if (sets.length === 0) return null;
  return sets.reduce((best, s) =>
    s.weight > best.weight || (s.weight === best.weight && s.reps > best.reps)
      ? s
      : best,
  );
}

/** Total tonnage of one session's logged sets across a day's exercises. */
export function sessionTonnage(
  sets: Record<string, LoggedSet[]>,
  exercises: PlanExercise[],
): number {
  return exercises.reduce(
    (sum, ex) => sum + totalTonnage(sets[ex.id] ?? [], ex.loadType),
    0,
  );
}

/** Deload target: 80% of the last working load, rounded to the exercise's step. */
export function deloadLoad(lastWeight: number, increment: number): number {
  const step = increment > 0 ? increment : 2.5;
  return Math.max(0, Math.round((lastWeight * 0.8) / step) * step);
}

export type ProgressionAction = "increase" | "add-reps" | "hold";

export interface ProgressionHint {
  action: ProgressionAction;
  text: string;
}

/**
 * Double progression, as written in the plan: pick a load that lands at the
 * bottom of the range on all sets; once every set hits the top of the range,
 * add weight next session (+2.5–5 kg bar / next DB pair / a rep then weight
 * for bodyweight). Below the bottom of the range → hold or drop the load.
 */
export function progressionHint(
  exercise: PlanExercise,
  lastSets: LoggedSet[],
): ProgressionHint | null {
  if (lastSets.length === 0) return null;

  const unit = exercise.loadType === "time" ? "s" : " reps";
  const allSetsDone = lastSets.length >= exercise.sets;
  const allAtTop = lastSets.every((s) => s.reps >= exercise.repMax);
  const allInRange = lastSets.every((s) => s.reps >= exercise.repMin);

  if (allSetsDone && allAtTop) {
    if (exercise.loadType === "weight") {
      return {
        action: "increase",
        text: `Topped the range last time — add +${exercise.increment} kg`,
      };
    }
    if (exercise.loadType === "bodyweight") {
      return {
        action: "increase",
        text:
          exercise.increment > 0
            ? `Topped the range — add +${exercise.increment} kg or a rep`
            : "Topped the range — add a rep or slow the tempo",
      };
    }
    return {
      action: "increase",
      text: "Held the top of the range — add ~5 s per set",
    };
  }

  if (allInRange) {
    return {
      action: "add-reps",
      text: `Same load — push each set towards ${exercise.repMax}${unit}`,
    };
  }

  return {
    action: "hold",
    text: `Below ${exercise.repMin}${unit} last time — hold or drop the load`,
  };
}

export interface Delta {
  current: number;
  previous: number;
  diff: number;
  /** Percentage change vs previous; null when previous is 0. */
  pct: number | null;
}

export function delta(current: number, previous: number): Delta {
  return {
    current,
    previous,
    diff: current - previous,
    pct: previous > 0 ? ((current - previous) / previous) * 100 : null,
  };
}

export function formatKg(kg: number): string {
  const rounded = Math.round(kg * 10) / 10;
  return `${rounded.toLocaleString("en-GB")} kg`;
}

export function formatSeconds(total: number): string {
  const m = Math.floor(total / 60);
  const s = Math.round(total % 60);
  return m > 0 ? `${m}:${String(s).padStart(2, "0")}` : `${s}s`;
}
