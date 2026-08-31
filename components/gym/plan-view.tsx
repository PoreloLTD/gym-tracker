"use client";

import * as React from "react";
import { ChevronDown, Home, TrendingUp, Zap } from "lucide-react";

import {
  GYM_DAYS,
  HOME_MINIMUM,
  HOME_ROUTINE,
  type GymDay,
} from "@/lib/gym/plan";

function DayCard({ day }: { day: GymDay }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 p-4 text-left"
        aria-expanded={open}
      >
        <div>
          <h3 className="font-bold text-zinc-50">
            {["", "Mon", "Tue", "Wed", "Thu"][day.weekday]} — {day.title}
          </h3>
          <p className="text-sm text-zinc-400">
            {day.subtitle} · {day.duration}
          </p>
        </div>
        <ChevronDown
          className={`size-5 shrink-0 text-zinc-500 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="border-t border-zinc-800 p-4 pt-3">
          <table className="w-full text-sm">
            <tbody>
              {day.exercises.map((ex) => (
                <tr key={ex.id} className="border-b border-zinc-800/60 last:border-0">
                  <td className="py-2 pr-2 text-zinc-200">
                    {ex.name}
                    {ex.swap && (
                      <span className="block text-xs text-zinc-500">
                        swap: {ex.swap}
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap py-2 text-right font-mono text-zinc-400">
                    {ex.sets} ×{" "}
                    {ex.repMin === ex.repMax
                      ? ex.repMin
                      : `${ex.repMin}–${ex.repMax}`}
                    {ex.loadType === "time" ? " s" : ""}
                    {ex.perSide ? " /s" : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function PlanView() {
  const [homeOpen, setHomeOpen] = React.useState(false);
  return (
    <div className="space-y-4">
      <section className="space-y-2">
        <h2 className="px-1 text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Gym days (Mon–Thu)
        </h2>
        {GYM_DAYS.map((day) => (
          <DayCard key={day.id} day={day} />
        ))}
      </section>

      <section className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
        <button
          type="button"
          onClick={() => setHomeOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-2 p-4 text-left"
          aria-expanded={homeOpen}
        >
          <div>
            <h2 className="flex items-center gap-2 font-bold text-zinc-50">
              <Home className="size-4 text-emerald-400" /> Fri–Sun — shift-day
              home routine
            </h2>
            <p className="text-sm text-zinc-400">
              ~30 min after a nap. No lifting — nothing here should leave you
              sore. Sunday: handstand block at two-thirds.
            </p>
          </div>
          <ChevronDown
            className={`size-5 shrink-0 text-zinc-500 transition-transform ${homeOpen ? "rotate-180" : ""}`}
          />
        </button>
        {homeOpen && (
          <div className="space-y-3 border-t border-zinc-800 p-4 pt-3">
            {HOME_ROUTINE.map((block) => (
              <div key={block.title}>
                <p className="text-sm font-semibold text-zinc-200">
                  {block.title}{" "}
                  <span className="font-normal text-zinc-500">
                    · {block.duration}
                  </span>
                </p>
                <ul className="mt-1 space-y-0.5 text-sm text-zinc-400">
                  {block.items.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="text-emerald-500">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/[0.06] p-3">
              <p className="flex items-center gap-1.5 text-sm font-semibold text-amber-300">
                <Zap className="size-4" /> 8-minute minimum (bad days)
              </p>
              <ul className="mt-1 space-y-0.5 text-sm text-zinc-400">
                {HOME_MINIMUM.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-amber-500">•</span>
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-1.5 text-xs text-zinc-500">
                That still counts. Never skip entirely.
              </p>
            </div>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
        <h2 className="flex items-center gap-2 font-bold text-zinc-50">
          <TrendingUp className="size-4 text-emerald-400" /> How progression
          works
        </h2>
        <ul className="mt-2 space-y-1.5 text-sm text-zinc-400">
          <li>
            <strong className="text-zinc-200">Double progression:</strong> pick
            a load that lands at the bottom of the rep range on all sets with
            1–2 reps in reserve. Top of the range on every set → add weight
            next session (Smith/bar +2.5–5 kg, DBs next pair, bodyweight a rep
            then weight).
          </li>
          <li>
            <strong className="text-zinc-200">Stalled twice in a row?</strong>{" "}
            Keep the weight and add a set, or swap to the alternative for 4
            weeks.
          </li>
          <li>
            <strong className="text-zinc-200">Weeks 1–2:</strong> everything at
            RPE 6–7 — learn the movements, find the loads.
          </li>
          <li>
            <strong className="text-zinc-200">Deloads:</strong> weeks 6 and 12
            — half the sets, 80% of the load. Skills and home routine as
            normal.
          </li>
          <li>
            <strong className="text-zinc-200">Week 12 is test week:</strong>{" "}
            pull-up max, handstand hold, HSPU level, a couple of rep PRs.
          </li>
          <li>
            <strong className="text-zinc-200">Injury rules:</strong> stop 1–3
            reps short of failure · 2–3 s lowering · pain above 3/10 or worse
            next morning → swap the exercise · the left shoulder sets
            unilateral loads.
          </li>
        </ul>
      </section>
    </div>
  );
}
