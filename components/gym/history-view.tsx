"use client";

import * as React from "react";
import { format } from "date-fns";
import { ChevronDown, Copy, Ruler, Scale, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { rateVerdict, weeklyRate, BULK_RATE_KG_PER_WEEK } from "@/lib/gym/body";
import { GYM_DAYS, getDay } from "@/lib/gym/plan";
import {
  formatKg,
  formatSeconds,
  sessionTonnage,
  workScore,
} from "@/lib/gym/progression";
import { useGymStore, type WorkoutSession } from "@/lib/gym/store";

function BodySection() {
  const bodyLog = useGymStore((s) => s.bodyLog);
  const logBody = useGymStore((s) => s.logBody);
  const removeBodyEntry = useGymStore((s) => s.removeBodyEntry);

  const [weight, setWeight] = React.useState("");
  const [showTape, setShowTape] = React.useState(false);
  const [chest, setChest] = React.useState("");
  const [arm, setArm] = React.useState("");
  const [waist, setWaist] = React.useState("");

  const rate = weeklyRate(bodyLog);
  const verdict = rate === null ? null : rateVerdict(rate);
  const newest = [...bodyLog].reverse();

  const parse = (v: string) => {
    const n = Number(v.replace(",", "."));
    return Number.isFinite(n) && n > 0 ? n : undefined;
  };

  const save = () => {
    const weightKg = parse(weight);
    if (!weightKg) {
      toast.error("Enter your bodyweight in kg first");
      return;
    }
    logBody({
      dateISO: new Date().toISOString().slice(0, 10),
      weightKg,
      chestCm: parse(chest),
      armCm: parse(arm),
      waistCm: parse(waist),
    });
    setWeight("");
    setChest("");
    setArm("");
    setWaist("");
    toast.success("Body log updated");
  };

  const inputClass =
    "h-11 w-full min-w-0 rounded-xl border border-zinc-700 bg-zinc-950 px-3 text-center font-mono text-zinc-50 outline-none placeholder:text-zinc-600";

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
      <h2 className="flex items-center gap-2 font-bold text-zinc-50">
        <Scale className="size-4 text-emerald-400" /> Bodyweight
      </h2>
      <p className="mt-1 text-sm text-zinc-400">
        The bulk works if this climbs {BULK_RATE_KG_PER_WEEK.min}–
        {BULK_RATE_KG_PER_WEEK.max} kg a week. Weigh in weekly; tape chest, arm
        and waist at weeks 0, 6 and 12.
      </p>

      {rate !== null && (
        <p
          className={`mt-2 inline-block rounded-lg border px-2 py-1 text-xs font-medium ${
            verdict === "on-target"
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
              : "border-amber-500/40 bg-amber-500/10 text-amber-300"
          }`}
        >
          {rate >= 0 ? "▲" : "▼"} {Math.abs(rate).toFixed(2)} kg/week —{" "}
          {verdict === "on-target"
            ? "on target"
            : verdict === "too-slow"
              ? "scale's not moving — the plan isn't the problem, eat more"
              : "quicker than 0.5 kg/wk — ease the surplus a touch"}
        </p>
      )}

      <div className="mt-3 flex items-center gap-2">
        <input
          type="text"
          inputMode="decimal"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder="kg today"
          aria-label="Bodyweight in kg"
          className={inputClass}
        />
        <button
          type="button"
          onClick={() => setShowTape((v) => !v)}
          aria-expanded={showTape}
          className={`flex h-11 w-12 shrink-0 items-center justify-center rounded-xl border ${
            showTape
              ? "border-emerald-500/50 text-emerald-300"
              : "border-zinc-700 text-zinc-400"
          } hover:bg-zinc-800`}
          aria-label="Add tape measurements"
        >
          <Ruler className="size-4" />
        </button>
        <button
          type="button"
          onClick={save}
          className="h-11 shrink-0 rounded-xl bg-emerald-500 px-4 font-semibold text-emerald-950 hover:bg-emerald-400"
        >
          Log
        </button>
      </div>

      {showTape && (
        <div className="mt-2 grid grid-cols-3 gap-2">
          {(
            [
              ["Chest cm", chest, setChest],
              ["Arm cm", arm, setArm],
              ["Waist cm", waist, setWaist],
            ] as const
          ).map(([label, value, setter]) => (
            <input
              key={label}
              type="text"
              inputMode="decimal"
              value={value}
              onChange={(e) => setter(e.target.value)}
              placeholder={label}
              aria-label={label}
              className={inputClass}
            />
          ))}
        </div>
      )}

      {newest.length > 0 && (
        <ul className="mt-3 space-y-1 text-sm">
          {newest.slice(0, 6).map((entry) => (
            <li
              key={entry.dateISO}
              className="flex items-center justify-between gap-3"
            >
              <span className="text-zinc-400">
                {format(new Date(`${entry.dateISO}T00:00:00`), "EEE d MMM")}
              </span>
              <span className="flex items-center gap-2 font-mono text-zinc-200">
                {entry.weightKg} kg
                {entry.chestCm && (
                  <span className="text-xs text-zinc-500">
                    C{entry.chestCm} A{entry.armCm ?? "–"} W{entry.waistCm ?? "–"}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeBodyEntry(entry.dateISO)}
                  className="text-zinc-600 hover:text-red-400"
                  aria-label={`Delete entry for ${entry.dateISO}`}
                >
                  <Trash2 className="size-3.5" />
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function SessionRow({ session }: { session: WorkoutSession }) {
  const deleteSession = useGymStore((s) => s.deleteSession);
  const [open, setOpen] = React.useState(false);
  const [confirming, setConfirming] = React.useState(false);
  const day = getDay(session.dayId);
  const tonnage = sessionTonnage(session.sets, day.exercises);

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 p-3 text-left"
        aria-expanded={open}
      >
        <div>
          <p className="font-semibold text-zinc-100">
            {day.title}{" "}
            <span className="font-normal text-zinc-500">
              · {format(session.startedAt, "EEE d MMM")}
            </span>
            {session.isDeload && (
              <span className="ml-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-300">
                deload
              </span>
            )}
          </p>
          <p className="text-xs text-zinc-500">
            {Object.values(session.sets).reduce((n, s) => n + s.length, 0)} sets
            {tonnage > 0 ? ` · ${formatKg(tonnage)}` : ""}
          </p>
        </div>
        <ChevronDown
          className={`size-4 shrink-0 text-zinc-500 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="border-t border-zinc-800 p-3 pt-2">
          <ul className="space-y-1 text-sm">
            {day.exercises
              .filter((ex) => (session.sets[ex.id] ?? []).length > 0)
              .map((ex) => {
                const sets = session.sets[ex.id] ?? [];
                return (
                  <li key={ex.id} className="flex justify-between gap-3">
                    <span className="min-w-0 truncate text-zinc-300">
                      {ex.name}
                    </span>
                    <span className="shrink-0 font-mono text-zinc-400">
                      {ex.loadType === "time"
                        ? sets.map((s) => formatSeconds(s.reps)).join(" ")
                        : sets
                            .map((s) =>
                              ex.loadType === "weight"
                                ? `${s.weight}×${s.reps}`
                                : `${s.reps}${s.weight > 0 ? `+${s.weight}` : ""}`,
                            )
                            .join(" ")}
                    </span>
                  </li>
                );
              })}
          </ul>
          {confirming ? (
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => deleteSession(session.id)}
                className="h-9 flex-1 rounded-lg bg-red-500/90 text-sm font-medium text-white hover:bg-red-400"
              >
                Delete session
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="h-9 flex-1 rounded-lg border border-zinc-700 text-sm text-zinc-300"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="mt-2 flex items-center gap-1.5 text-xs text-zinc-500 hover:text-red-400"
            >
              <Trash2 className="size-3.5" /> Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function HistoryView() {
  const sessions = useGymStore((s) => s.sessions);
  const bodyLog = useGymStore((s) => s.bodyLog);
  const finished = React.useMemo(
    () =>
      sessions
        .filter((s) => s.finishedAt)
        .sort((a, b) => b.startedAt - a.startedAt),
    [sessions],
  );

  const allExercises = GYM_DAYS.flatMap((day) =>
    day.exercises.map((ex) => ({ day, ex })),
  );
  const [selectedId, setSelectedId] = React.useState(allExercises[0]?.ex.id ?? "");
  const selected = allExercises.find((e) => e.ex.id === selectedId);

  // Deload sessions are excluded so the trend reflects real working loads.
  const exerciseHistory = React.useMemo(() => {
    if (!selected) return [];
    return finished
      .filter(
        (s) =>
          s.dayId === selected.day.id &&
          !s.isDeload &&
          (s.sets[selected.ex.id] ?? []).length > 0,
      )
      .map((s) => ({
        session: s,
        sets: s.sets[selected.ex.id] ?? [],
        score: workScore(s.sets[selected.ex.id] ?? [], selected.ex.loadType),
      }))
      .reverse(); // oldest → newest for the chart
  }, [finished, selected]);

  const exportData = async () => {
    try {
      await navigator.clipboard.writeText(
        JSON.stringify(
          { exportedAt: new Date().toISOString(), sessions, bodyLog },
          null,
          2,
        ),
      );
      toast.success("Workout + body log copied to clipboard as JSON");
    } catch {
      toast.error("Couldn't copy — your browser blocked clipboard access");
    }
  };

  const maxScore = Math.max(...exerciseHistory.map((h) => h.score), 1);
  const scoreUnit = selected
    ? selected.ex.loadType === "weight"
      ? "kg tonnage"
      : selected.ex.loadType === "time"
        ? "seconds"
        : "reps"
    : "";

  return (
    <div className="space-y-4">
      <BodySection />

      {finished.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-800 p-8 text-center">
          <p className="font-semibold text-zinc-300">No sessions logged yet</p>
          <p className="mt-1 text-sm text-zinc-500">
            Finish your first session and your progress — tonnage, best sets
            and week-on-week overload — shows up here.
          </p>
        </div>
      ) : (
        <>
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
            <h2 className="font-bold text-zinc-50">Exercise progress</h2>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-200"
              aria-label="Choose exercise"
            >
              {GYM_DAYS.map((day) => (
                <optgroup key={day.id} label={day.title}>
                  {day.exercises.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>

            {exerciseHistory.length === 0 ? (
              <p className="mt-3 text-sm text-zinc-500">
                Nothing logged for this exercise yet.
              </p>
            ) : (
              <>
                <div className="mt-3 flex h-24 items-end gap-1.5" aria-hidden>
                  {exerciseHistory.slice(-14).map((h, i, arr) => {
                    const prev = arr[i - 1];
                    const up = !prev || h.score >= prev.score;
                    return (
                      <div
                        key={h.session.id}
                        className={`min-w-0 flex-1 rounded-t-md ${up ? "bg-emerald-500/80" : "bg-amber-500/70"}`}
                        style={{
                          height: `${Math.max(8, (h.score / maxScore) * 100)}%`,
                        }}
                        title={`${format(h.session.startedAt, "d MMM")}: ${Math.round(h.score)}`}
                      />
                    );
                  })}
                </div>
                <p className="mt-1 text-right text-[0.65rem] uppercase tracking-wider text-zinc-500">
                  {scoreUnit} per session (deloads excluded)
                </p>
                <ul className="mt-2 space-y-1 text-sm">
                  {[...exerciseHistory].reverse().map((h, i, arr) => {
                    const prev = arr[i + 1];
                    const diff = prev ? h.score - prev.score : 0;
                    return (
                      <li
                        key={h.session.id}
                        className="flex justify-between gap-3"
                      >
                        <span className="text-zinc-400">
                          {format(h.session.startedAt, "EEE d MMM")}
                        </span>
                        <span className="font-mono text-zinc-200">
                          {Math.round(h.score * 10) / 10}
                          {prev && (
                            <span
                              className={
                                diff >= 0
                                  ? "text-emerald-400"
                                  : "text-amber-400"
                              }
                            >
                              {" "}
                              {diff >= 0 ? "▲" : "▼"}
                              {Math.abs(Math.round(diff * 10) / 10)}
                            </span>
                          )}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </section>

          <section className="space-y-2">
            <h2 className="px-1 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              All sessions ({finished.length})
            </h2>
            {finished.map((session) => (
              <SessionRow key={session.id} session={session} />
            ))}
          </section>
        </>
      )}

      <button
        type="button"
        onClick={exportData}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-zinc-700 text-sm text-zinc-300 hover:bg-zinc-800"
      >
        <Copy className="size-4" /> Copy full log as JSON (backup)
      </button>
    </div>
  );
}
