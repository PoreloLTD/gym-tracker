"use client";

import * as React from "react";
import { format, formatDistanceToNow } from "date-fns";
import { Check, ChevronDown, Flag, Moon, Trash2 } from "lucide-react";

import { ExerciseCard } from "@/components/gym/exercise-card";
import { blockPosition } from "@/lib/gym/block";
import {
  HANDSTAND_STAGE_DRILLS,
  MUSCLE_UP_PHASE_DRILLS,
  getDay,
  muscleUpPhase,
  type PlanExercise,
  type Section,
} from "@/lib/gym/plan";
import { delta, formatKg, sessionTonnage } from "@/lib/gym/progression";
import {
  lastComparableSession,
  useGymStore,
  type WorkoutSession,
} from "@/lib/gym/store";

const SECTION_TITLES: Record<Section, string> = {
  skill: "Skill block — do this fresh",
  main: "Main lifts",
  core: "Core finisher",
};

const STALE_SESSION_MS = 8 * 60 * 60 * 1000;

/** Current-stage drills for the two skill blocks; null for everything else. */
function skillDrillsFor(
  exercise: PlanExercise,
  blockStartISO: string | null,
  sessions: WorkoutSession[],
): string[] | undefined {
  if (exercise.id === "handstand-skill") {
    const stage = blockStartISO
      ? blockPosition(blockStartISO, new Date()).handstandStage
      : 1;
    return HANDSTAND_STAGE_DRILLS[stage];
  }
  if (exercise.id === "muscle-up-skill") {
    const bestPullUps = sessions
      .filter((s) => s.finishedAt)
      .flatMap((s) => s.sets["pull-ups"] ?? [])
      .reduce((best, set) => Math.max(best, set.reps), 0);
    return MUSCLE_UP_PHASE_DRILLS[muscleUpPhase(bestPullUps)];
  }
  return undefined;
}

export function SessionView({ session }: { session: WorkoutSession }) {
  const day = getDay(session.dayId);
  const sessions = useGymStore((s) => s.sessions);
  const blockStartISO = useGymStore((s) => s.blockStartISO);
  const logSet = useGymStore((s) => s.logSet);
  const removeSet = useGymStore((s) => s.removeSet);
  const finishSession = useGymStore((s) => s.finishSession);
  const discardSession = useGymStore((s) => s.discardSession);
  const startRest = useGymStore((s) => s.startRest);
  const toggleWarmupItem = useGymStore((s) => s.toggleWarmupItem);

  const [showWarmup, setShowWarmup] = React.useState(false);
  const [confirming, setConfirming] = React.useState<"finish" | "discard" | null>(
    null,
  );

  const lastSession = lastComparableSession(sessions, session.dayId, session.id);
  // Once-per-mount timestamp: staleness only needs to be judged when the
  // view opens, and a lazy initializer keeps the render pure.
  const [openedAt] = React.useState(() => Date.now());
  const isStale = openedAt - session.startedAt > STALE_SESSION_MS;
  const warmupDone = session.warmupDone ?? [];

  const tonnageNow = sessionTonnage(session.sets, day.exercises);
  const tonnageLast = lastSession
    ? sessionTonnage(lastSession.sets, day.exercises)
    : 0;
  const d = delta(tonnageNow, tonnageLast);

  const setsLogged = Object.values(session.sets).reduce(
    (n, sets) => n + sets.length,
    0,
  );

  const sections: Section[] = ["skill", "main", "core"];

  return (
    <div className="space-y-4">
      {isStale && (
        <div className="rounded-2xl border border-amber-500/40 bg-amber-500/[0.07] p-4">
          <p className="text-sm font-semibold text-amber-300">
            This session was started{" "}
            {formatDistanceToNow(session.startedAt, { addSuffix: true })}
          </p>
          <p className="mt-0.5 text-sm text-zinc-400">
            Finish it to save it to your history, or discard it to start fresh.
          </p>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={finishSession}
              className="h-10 flex-1 rounded-xl bg-emerald-500 text-sm font-semibold text-emerald-950 hover:bg-emerald-400"
            >
              Finish now
            </button>
            <button
              type="button"
              onClick={() => setConfirming("discard")}
              className="h-10 flex-1 rounded-xl border border-zinc-700 text-sm text-zinc-300 hover:bg-zinc-800"
            >
              Discard…
            </button>
          </div>
        </div>
      )}

      {session.isDeload && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-amber-500/40 bg-amber-500/[0.07] p-4">
          <Moon className="mt-0.5 size-4 shrink-0 text-amber-300" />
          <p className="text-sm text-zinc-300">
            <span className="font-semibold text-amber-300">Deload week.</span>{" "}
            Half the sets at 80% of the load — each lift shows its target.
            Skill work and the home routine run as normal. This session
            won&apos;t count against your progression comparisons.
          </p>
        </div>
      )}

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
        <div className="flex items-baseline justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-zinc-50">{day.title}</h2>
            <p className="text-sm text-zinc-400">{day.subtitle}</p>
          </div>
          <p className="text-right text-xs text-zinc-500">
            Started {format(session.startedAt, "HH:mm")}
          </p>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-zinc-950/60 p-2">
            <p className="font-mono text-lg font-bold text-emerald-300">
              {formatKg(tonnageNow)}
            </p>
            <p className="text-[0.65rem] uppercase tracking-wider text-zinc-500">
              Tonnage
            </p>
          </div>
          <div className="rounded-xl bg-zinc-950/60 p-2">
            <p
              className={`font-mono text-lg font-bold ${
                tonnageLast === 0 || setsLogged === 0
                  ? "text-zinc-400"
                  : d.diff >= 0
                    ? "text-emerald-300"
                    : "text-amber-300"
              }`}
            >
              {tonnageLast === 0 || setsLogged === 0
                ? "—"
                : `${d.diff >= 0 ? "+" : ""}${Math.round(d.diff)}`}
            </p>
            <p className="text-[0.65rem] uppercase tracking-wider text-zinc-500">
              vs last {tonnageLast > 0 ? `(${formatKg(tonnageLast)})` : ""}
            </p>
          </div>
          <div className="rounded-xl bg-zinc-950/60 p-2">
            <p className="font-mono text-lg font-bold text-zinc-100">
              {setsLogged}
            </p>
            <p className="text-[0.65rem] uppercase tracking-wider text-zinc-500">
              Sets logged
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowWarmup((v) => !v)}
          className="mt-3 flex w-full items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm text-zinc-300"
          aria-expanded={showWarmup}
        >
          <span>
            Warm-up (8–10 min — not optional)
            <span
              className={`ml-2 font-mono text-xs ${
                warmupDone.length === day.warmup.length
                  ? "text-emerald-400"
                  : "text-zinc-500"
              }`}
            >
              {warmupDone.length}/{day.warmup.length}
            </span>
          </span>
          <ChevronDown
            className={`size-4 transition-transform ${showWarmup ? "rotate-180" : ""}`}
          />
        </button>
        {showWarmup && (
          <ul className="mt-2 space-y-1">
            {day.warmup.map((step) => {
              const checked = warmupDone.includes(step);
              return (
                <li key={step}>
                  <button
                    type="button"
                    onClick={() => toggleWarmupItem(step)}
                    aria-pressed={checked}
                    className="flex w-full items-start gap-2.5 rounded-lg px-1 py-1.5 text-left text-sm hover:bg-zinc-800/60"
                  >
                    <span
                      className={`mt-0.5 flex size-4.5 shrink-0 items-center justify-center rounded-md border ${
                        checked
                          ? "border-emerald-500 bg-emerald-500 text-emerald-950"
                          : "border-zinc-600"
                      }`}
                    >
                      {checked && <Check className="size-3.5" />}
                    </span>
                    <span
                      className={
                        checked ? "text-zinc-500 line-through" : "text-zinc-300"
                      }
                    >
                      {step}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {sections.map((section) => {
        const exercises = day.exercises.filter((e) => e.section === section);
        if (exercises.length === 0) return null;
        return (
          <section key={section} className="space-y-3">
            <h3 className="px-1 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              {SECTION_TITLES[section]}
            </h3>
            {exercises.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                loggedSets={session.sets[exercise.id] ?? []}
                lastSets={lastSession?.sets[exercise.id] ?? []}
                skillDrills={skillDrillsFor(exercise, blockStartISO, sessions)}
                deload={session.isDeload}
                onLog={(loggedSet) => {
                  logSet(exercise.id, loggedSet);
                  if (exercise.restSeconds > 0) {
                    startRest(exercise.restSeconds, exercise.name);
                  }
                }}
                onRemove={(index) => removeSet(exercise.id, index)}
              />
            ))}
          </section>
        );
      })}

      <div className="space-y-2 pb-4">
        {confirming === "finish" ? (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={finishSession}
              className="h-12 flex-1 rounded-xl bg-emerald-500 font-semibold text-emerald-950 hover:bg-emerald-400"
            >
              Confirm finish
            </button>
            <button
              type="button"
              onClick={() => setConfirming(null)}
              className="h-12 flex-1 rounded-xl border border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              Keep training
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming("finish")}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 font-semibold text-emerald-950 hover:bg-emerald-400"
          >
            <Flag className="size-4" /> Finish session
          </button>
        )}
        {confirming === "discard" ? (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={discardSession}
              className="h-11 flex-1 rounded-xl bg-red-500/90 font-medium text-white hover:bg-red-400"
            >
              Discard — lose this log
            </button>
            <button
              type="button"
              onClick={() => setConfirming(null)}
              className="h-11 flex-1 rounded-xl border border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming("discard")}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm text-zinc-500 hover:text-red-400"
          >
            <Trash2 className="size-4" /> Discard session
          </button>
        )}
      </div>
    </div>
  );
}
