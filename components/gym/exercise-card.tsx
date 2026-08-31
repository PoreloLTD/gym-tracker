"use client";

import * as React from "react";
import { ChevronDown, Minus, Plus, Repeat, X } from "lucide-react";

import type { PlanExercise } from "@/lib/gym/plan";
import {
  bestSet,
  deloadLoad,
  formatKg,
  formatSeconds,
  progressionHint,
  totalTonnage,
  totalReps,
  workScore,
  type LoggedSet,
} from "@/lib/gym/progression";

interface ExerciseCardProps {
  exercise: PlanExercise;
  loggedSets: LoggedSet[];
  /** Sets from the most recent comparable (non-deload) session of this day. */
  lastSets: LoggedSet[];
  /** Current-stage drills shown instead of the generic note (skill blocks). */
  skillDrills?: string[];
  /** Session is in a deload week: hints replaced by 80%-load guidance. */
  deload?: boolean;
  onLog: (set: LoggedSet) => void;
  onRemove: (index: number) => void;
}

const hintStyle: Record<string, string> = {
  increase: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  "add-reps": "border-sky-500/40 bg-sky-500/10 text-sky-300",
  hold: "border-amber-500/40 bg-amber-500/10 text-amber-300",
};

function Stepper({
  label,
  value,
  step,
  min = 0,
  onChange,
}: {
  label: string;
  value: number;
  step: number;
  min?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex-1">
      <p className="mb-1 text-center text-[0.65rem] font-medium uppercase tracking-wider text-zinc-500">
        {label}
      </p>
      <div className="flex items-center overflow-hidden rounded-xl border border-zinc-700 bg-zinc-950">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, Math.round((value - step) * 10) / 10))}
          className="flex h-11 w-10 shrink-0 items-center justify-center text-zinc-400 hover:bg-zinc-800 active:bg-zinc-700"
          aria-label={`Decrease ${label}`}
        >
          <Minus className="size-4" />
        </button>
        <input
          type="text"
          inputMode="decimal"
          value={String(value)}
          onChange={(e) => {
            const parsed = Number(e.target.value.replace(",", "."));
            if (Number.isFinite(parsed)) onChange(Math.max(min, parsed));
            else if (e.target.value === "") onChange(min);
          }}
          className="h-11 w-full min-w-0 bg-transparent text-center font-mono text-lg font-semibold text-zinc-50 outline-none"
          aria-label={label}
        />
        <button
          type="button"
          onClick={() => onChange(Math.round((value + step) * 10) / 10)}
          className="flex h-11 w-10 shrink-0 items-center justify-center text-zinc-400 hover:bg-zinc-800 active:bg-zinc-700"
          aria-label={`Increase ${label}`}
        >
          <Plus className="size-4" />
        </button>
      </div>
    </div>
  );
}

export function ExerciseCard({
  exercise,
  loggedSets,
  lastSets,
  skillDrills,
  deload = false,
  onLog,
  onRemove,
}: ExerciseCardProps) {
  const isTime = exercise.loadType === "time";
  const showWeight = exercise.loadType === "weight" || exercise.increment > 0;

  // Inputs default to the matching set from last session (or the last set
  // logged today) until the user edits them, so re-logging a load takes one tap.
  const lastSame = lastSets[Math.min(loggedSets.length, lastSets.length - 1)];
  const prevLogged = loggedSets[loggedSets.length - 1];
  const defaultWeight = prevLogged?.weight ?? lastSame?.weight ?? 0;
  const defaultReps = prevLogged?.reps ?? lastSame?.reps ?? exercise.repMin;

  const [weightOverride, setWeightOverride] = React.useState<number | null>(null);
  const [repsOverride, setRepsOverride] = React.useState<number | null>(null);
  const [showNote, setShowNote] = React.useState(false);

  const weight = weightOverride ?? defaultWeight;
  const reps = repsOverride ?? defaultReps;
  const setWeight = setWeightOverride;
  const setReps = setRepsOverride;

  // Deloads (wk 6/12): half the sets at 80% load, but skill work runs as
  // normal — so hints pause and an 80% target replaces them, except on skills.
  const deloadApplies = deload && exercise.section !== "skill";
  const hint = deloadApplies ? null : progressionHint(exercise, lastSets);
  const lastBest = bestSet(lastSets);
  const deloadSets = Math.max(1, Math.ceil(exercise.sets / 2));
  const deloadText = !deloadApplies
    ? null
    : exercise.loadType === "weight" && lastBest && lastBest.weight > 0
      ? `Deload — try ${deloadLoad(lastBest.weight, exercise.increment)} kg for ${deloadSets} sets`
      : `Deload — ${deloadSets} sets, well short of failure`;
  const targetSets = deloadApplies ? deloadSets : exercise.sets;
  const done = loggedSets.length >= targetSets;

  const targetLabel = `${exercise.sets} × ${
    exercise.repMin === exercise.repMax
      ? exercise.repMin
      : `${exercise.repMin}–${exercise.repMax}`
  }${isTime ? " s" : ""}${exercise.perSide ? " /side" : ""}`;

  const lastSummary = React.useMemo(() => {
    if (lastSets.length === 0) return null;
    const best = bestSet(lastSets);
    if (!best) return null;
    if (exercise.loadType === "weight") {
      return `${formatKg(best.weight)} × ${lastSets
        .map((s) => s.reps)
        .join("·")} — ${formatKg(totalTonnage(lastSets, "weight"))}`;
    }
    if (exercise.loadType === "bodyweight") {
      const added = best.weight > 0 ? ` (+${best.weight} kg)` : "";
      return `${totalReps(lastSets)} reps${added}`;
    }
    return lastSets.map((s) => formatSeconds(s.reps)).join(" · ");
  }, [lastSets, exercise.loadType]);

  const todayScore = workScore(loggedSets, exercise.loadType);
  const lastScore = workScore(lastSets, exercise.loadType);
  const scoreUnit =
    exercise.loadType === "weight" ? "kg" : isTime ? "s" : "reps";

  return (
    <div
      className={`rounded-2xl border p-4 transition-colors ${
        done
          ? "border-emerald-500/30 bg-emerald-500/[0.04]"
          : "border-zinc-800 bg-zinc-900"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold leading-snug text-zinc-50">
            {exercise.name}
          </h3>
          <p className="mt-0.5 text-sm text-zinc-400">
            Target {targetLabel}
            {exercise.supersetWithId && (
              <span className="ml-2 inline-flex items-center gap-1 rounded-full border border-violet-500/40 bg-violet-500/10 px-2 py-0.5 text-xs text-violet-300">
                <Repeat className="size-3" /> superset
              </span>
            )}
          </p>
        </div>
        {!skillDrills && (exercise.note || exercise.swap || exercise.perSide) && (
          <button
            type="button"
            onClick={() => setShowNote((v) => !v)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
            aria-expanded={showNote}
            aria-label="Toggle exercise notes"
          >
            <ChevronDown
              className={`size-4 transition-transform ${showNote ? "rotate-180" : ""}`}
            />
          </button>
        )}
      </div>

      {skillDrills && (
        <ul className="mt-2 space-y-1 rounded-xl bg-zinc-950/60 p-3 text-sm text-zinc-400">
          {skillDrills.map((drill) => (
            <li key={drill} className="flex gap-2">
              <span className="text-emerald-500">•</span>
              {drill}
            </li>
          ))}
        </ul>
      )}

      {showNote && !skillDrills && (
        <div className="mt-2 space-y-1 rounded-xl bg-zinc-950/60 p-3 text-sm text-zinc-400">
          {exercise.perSide && (
            <p>
              Both sides use what the weak side can do — log each set once at
              that load.
            </p>
          )}
          {exercise.note && <p>{exercise.note}</p>}
          {exercise.swap && (
            <p>
              <span className="text-zinc-500">No kit?</span> {exercise.swap}
            </p>
          )}
        </div>
      )}

      {(lastSummary || hint || deloadText) && (
        <div className="mt-3 space-y-1.5">
          {lastSummary && (
            <p className="text-sm text-zinc-400">
              <span className="text-zinc-500">Last time:</span> {lastSummary}
            </p>
          )}
          {deloadText && (
            <p className="inline-block rounded-lg border border-amber-500/40 bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-300">
              {deloadText}
            </p>
          )}
          {hint && (
            <p
              className={`inline-block rounded-lg border px-2 py-1 text-xs font-medium ${hintStyle[hint.action]}`}
            >
              {hint.text}
            </p>
          )}
        </div>
      )}

      {loggedSets.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {loggedSets.map((s, i) => (
            <span
              key={`${s.ts}-${i}`}
              className="inline-flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1 font-mono text-sm text-zinc-200"
            >
              {exercise.loadType === "weight" && `${s.weight}×${s.reps}`}
              {exercise.loadType === "bodyweight" &&
                `${s.reps}${s.weight > 0 ? ` +${s.weight}kg` : ""}`}
              {isTime &&
                `${formatSeconds(s.reps)}${s.weight > 0 ? ` @${s.weight}kg` : ""}`}
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="text-zinc-500 hover:text-red-400"
                aria-label={`Remove set ${i + 1}`}
              >
                <X className="size-3.5" />
              </button>
            </span>
          ))}
          <span className="ml-auto font-mono text-sm text-emerald-300">
            {Math.round(todayScore * 10) / 10} {scoreUnit}
            {lastScore > 0 && (
              <span
                className={
                  todayScore >= lastScore ? "text-emerald-400" : "text-zinc-500"
                }
              >
                {" "}
                / {Math.round(lastScore * 10) / 10}
              </span>
            )}
          </span>
        </div>
      )}

      <div className="mt-3 flex items-end gap-2">
        {showWeight && (
          <Stepper
            label={exercise.loadType === "weight" ? "kg" : "+kg"}
            value={weight}
            step={exercise.loadType === "weight" ? exercise.increment || 2.5 : 1.25}
            onChange={setWeight}
          />
        )}
        <Stepper
          label={isTime ? "seconds" : "reps"}
          value={reps}
          step={isTime ? 5 : 1}
          onChange={setReps}
        />
        <button
          type="button"
          onClick={() => onLog({ weight, reps, ts: Date.now() })}
          disabled={reps <= 0}
          className="h-11 shrink-0 rounded-xl bg-emerald-500 px-4 font-semibold text-emerald-950 transition-colors hover:bg-emerald-400 active:bg-emerald-300 disabled:opacity-40"
        >
          Log set
        </button>
      </div>

      <p className="mt-2 text-right text-xs text-zinc-500">
        Set {Math.min(loggedSets.length + 1, targetSets)} of {targetSets}
        {done && " — all done ✓"}
      </p>
    </div>
  );
}
