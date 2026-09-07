import { describe, expect, it } from "vitest";

import { blockPosition } from "@/lib/gym/block";
import { rateVerdict, weeklyRate } from "@/lib/gym/body";
import {
  GYM_DAYS,
  HANDSTAND_STAGE_DRILLS,
  MUSCLE_UP_PHASE_DRILLS,
  getDay,
  getExercise,
  dayForWeekday,
  muscleUpPhase,
} from "@/lib/gym/plan";
import {
  bestSet,
  deloadLoad,
  delta,
  formatKg,
  formatSeconds,
  progressionHint,
  sessionTonnage,
  suggestNextSets,
  totalTonnage,
  totalReps,
  workScore,
  type LoggedSet,
} from "@/lib/gym/progression";

const set = (weight: number, reps: number): LoggedSet => ({
  weight,
  reps,
  ts: 0,
});

describe("workload", () => {
  it("computes tonnage as weight × reps summed", () => {
    expect(totalTonnage([set(60, 8), set(60, 7)], "weight")).toBe(900);
  });

  it("counts only added load for bodyweight sets", () => {
    expect(totalTonnage([set(0, 8), set(5, 6)], "bodyweight")).toBe(30);
  });

  it("gives time work no tonnage", () => {
    expect(totalTonnage([set(20, 30)], "time")).toBe(0);
  });

  it("scores bodyweight work by reps plus added tonnage", () => {
    expect(workScore([set(0, 8), set(2.5, 8)], "bodyweight")).toBe(16 + 20);
  });

  it("scores timed work by total seconds", () => {
    expect(workScore([set(0, 30), set(0, 25)], "time")).toBe(55);
    expect(totalReps([set(0, 30), set(0, 25)])).toBe(55);
  });

  it("picks the heaviest set, breaking ties by reps", () => {
    expect(bestSet([set(60, 8), set(62.5, 5), set(62.5, 6)])).toEqual(
      set(62.5, 6),
    );
    expect(bestSet([])).toBeNull();
  });
});

describe("double progression hints", () => {
  const inclinePress = getExercise("upper-a", "smith-incline-press")!; // 4 × 6–8, +2.5

  it("returns nothing with no history", () => {
    expect(progressionHint(inclinePress, [])).toBeNull();
  });

  it("says add weight when every set hit the top of the range", () => {
    const hint = progressionHint(
      inclinePress,
      [set(60, 8), set(60, 8), set(60, 8), set(60, 8)],
    );
    expect(hint?.action).toBe("increase");
    expect(hint?.text).toContain("+2.5 kg");
  });

  it("does not suggest weight when a set is missing", () => {
    const hint = progressionHint(inclinePress, [
      set(60, 8),
      set(60, 8),
      set(60, 8),
    ]);
    expect(hint?.action).toBe("add-reps");
  });

  it("says push reps while inside the range", () => {
    const hint = progressionHint(
      inclinePress,
      [set(60, 8), set(60, 7), set(60, 6), set(60, 6)],
    );
    expect(hint?.action).toBe("add-reps");
    expect(hint?.text).toContain("8");
  });

  it("says hold when below the bottom of the range", () => {
    const hint = progressionHint(
      inclinePress,
      [set(60, 6), set(60, 5), set(60, 4), set(60, 4)],
    );
    expect(hint?.action).toBe("hold");
  });

  it("suggests a rep or added weight for topped-out bodyweight work", () => {
    const pullUps = getExercise("upper-b", "pull-ups")!; // 4 × 5–8, +2.5
    const hint = progressionHint(
      pullUps,
      [set(0, 8), set(0, 8), set(0, 8), set(0, 8)],
    );
    expect(hint?.action).toBe("increase");
  });

  it("suggests more seconds for topped-out timed work", () => {
    const hollow = getExercise("upper-a", "hollow-hold")!; // 3 × 20–30 s
    const hint = progressionHint(hollow, [set(0, 30), set(0, 32), set(0, 30)]);
    expect(hint?.action).toBe("increase");
    expect(hint?.text).toContain("5 s");
  });
});

describe("delta & formatting", () => {
  it("computes signed difference and percentage", () => {
    const d = delta(1100, 1000);
    expect(d.diff).toBe(100);
    expect(d.pct).toBeCloseTo(10);
    expect(delta(500, 0).pct).toBeNull();
  });

  it("formats kg and seconds", () => {
    expect(formatKg(1412.5)).toBe("1,412.5 kg");
    expect(formatSeconds(95)).toBe("1:35");
    expect(formatSeconds(45)).toBe("45s");
  });
});

describe("plan data integrity", () => {
  it("has four gym days mapped Mon–Thu", () => {
    expect(GYM_DAYS).toHaveLength(4);
    expect(dayForWeekday(1)?.id).toBe("upper-a");
    expect(dayForWeekday(4)?.id).toBe("lower-b");
    expect(dayForWeekday(5)).toBeNull(); // Friday is a shift day
    expect(dayForWeekday(0)).toBeNull();
  });

  it("has unique exercise ids and valid superset references", () => {
    const ids = GYM_DAYS.flatMap((d) => d.exercises.map((e) => e.id));
    expect(new Set(ids).size).toBe(ids.length);
    for (const day of GYM_DAYS) {
      for (const ex of day.exercises) {
        expect(ex.repMin).toBeLessThanOrEqual(ex.repMax);
        expect(ex.sets).toBeGreaterThan(0);
        if (ex.supersetWithId) {
          expect(day.exercises.some((e) => e.id === ex.supersetWithId)).toBe(
            true,
          );
          // First half of a superset rolls straight into its pair.
          expect(ex.restSeconds).toBe(0);
        }
      }
    }
  });

  it("throws on an unknown day", () => {
    expect(() => getDay("nope" as never)).toThrow();
  });
});

describe("block position", () => {
  it("maps dates to weeks, deloads and handstand stages", () => {
    const start = "2026-08-31";
    expect(blockPosition(start, new Date("2026-08-31T10:00:00"))).toMatchObject(
      { week: 1, isDeload: false, handstandStage: 1 },
    );
    expect(blockPosition(start, new Date("2026-09-21T10:00:00")).week).toBe(4);
    expect(
      blockPosition(start, new Date("2026-09-21T10:00:00")).handstandStage,
    ).toBe(2);
    const wk6 = blockPosition(start, new Date("2026-10-06T10:00:00"));
    expect(wk6).toMatchObject({ week: 6, isDeload: true, isTestWeek: false });
    const wk12 = blockPosition(start, new Date("2026-11-17T10:00:00"));
    expect(wk12).toMatchObject({ week: 12, isDeload: true, isTestWeek: true });
    expect(
      blockPosition(start, new Date("2026-11-30T10:00:00")),
    ).toMatchObject({ week: 14, handstandStage: 4 });
  });

  it("clamps a future start date to week 1", () => {
    expect(blockPosition("2026-09-07", new Date("2026-09-01")).week).toBe(1);
  });

  it("snaps the block start to that week's Monday", () => {
    // First session on Wednesday 2 Sep → week 1 runs Mon 31 Aug – Sun 6 Sep.
    expect(blockPosition("2026-09-02", new Date("2026-09-06T10:00:00")).week).toBe(1);
    expect(blockPosition("2026-09-02", new Date("2026-09-07T10:00:00")).week).toBe(2);
    // Identical to starting on the Monday itself.
    expect(blockPosition("2026-09-02", new Date("2026-10-06T10:00:00"))).toEqual(
      blockPosition("2026-08-31", new Date("2026-10-06T10:00:00")),
    );
  });
});

describe("session tonnage", () => {
  it("sums weight tonnage plus added load on bodyweight work across a day", () => {
    const day = getDay("upper-b");
    const total = sessionTonnage(
      {
        "pull-ups": [set(5, 6), set(5, 6)], // bodyweight +5 kg → 60
        "bench-press": [set(50, 10)], // 500
        "hollow-rocks": [set(0, 12)], // 0
        "bird-dog": [set(0, 8)], // 0
      },
      day.exercises,
    );
    expect(total).toBe(560);
  });
});

describe("deload targets", () => {
  it("takes 80% rounded to the exercise's load step", () => {
    expect(deloadLoad(60, 2.5)).toBe(47.5);
    expect(deloadLoad(24, 2)).toBe(20);
    expect(deloadLoad(0, 2.5)).toBe(0);
    expect(deloadLoad(10, 0)).toBe(7.5); // step falls back to 2.5
  });
});

describe("skill stages and phases", () => {
  it("unlocks muscle-up phase 2 at 8 strict pull-ups", () => {
    expect(muscleUpPhase(0)).toBe(1);
    expect(muscleUpPhase(7)).toBe(1);
    expect(muscleUpPhase(8)).toBe(2);
  });

  it("has drills for every handstand stage and muscle-up phase", () => {
    ([1, 2, 3, 4] as const).forEach((stage) =>
      expect(HANDSTAND_STAGE_DRILLS[stage].length).toBeGreaterThan(0),
    );
    ([1, 2] as const).forEach((phase) =>
      expect(MUSCLE_UP_PHASE_DRILLS[phase].length).toBeGreaterThan(0),
    );
  });
});

describe("bodyweight trend", () => {
  it("computes the weekly rate from the last two entries", () => {
    expect(
      weeklyRate([
        { dateISO: "2026-08-01", weightKg: 80 },
        { dateISO: "2026-08-15", weightKg: 81 },
      ]),
    ).toBeCloseTo(0.5);
    expect(weeklyRate([{ dateISO: "2026-08-01", weightKg: 80 }])).toBeNull();
    expect(
      weeklyRate([
        { dateISO: "2026-08-01", weightKg: 80 },
        { dateISO: "2026-08-01", weightKg: 81 },
      ]),
    ).toBeNull();
  });

  it("sorts entries by date before comparing", () => {
    expect(
      weeklyRate([
        { dateISO: "2026-08-15", weightKg: 81 },
        { dateISO: "2026-08-08", weightKg: 80.6 },
        { dateISO: "2026-08-01", weightKg: 80 },
      ]),
    ).toBeCloseTo(0.4);
  });

  it("judges the rate against the plan's 0.25–0.5 kg/week target", () => {
    expect(rateVerdict(0.1)).toBe("too-slow");
    expect(rateVerdict(0.4)).toBe("on-target");
    expect(rateVerdict(0.8)).toBe("too-fast");
  });
});

describe("next-session pre-fill (suggestNextSets)", () => {
  const inclinePress = getExercise("upper-a", "smith-incline-press")!; // 4 × 6–8, +2.5

  it("returns null without history", () => {
    expect(suggestNextSets(inclinePress, [])).toBeNull();
  });

  it("adds the step and resets to the bottom of the range after topping out", () => {
    const next = suggestNextSets(
      inclinePress,
      [set(60, 8), set(60, 8), set(60, 8), set(60, 8)],
    )!;
    expect(next).toHaveLength(4);
    expect(next.every((s) => s.weight === 62.5 && s.reps === 6)).toBe(true);
  });

  it("keeps the load and asks for one more rep per set inside the range", () => {
    const next = suggestNextSets(
      inclinePress,
      [set(60, 8), set(60, 7), set(60, 6), set(60, 6)],
    )!;
    expect(next.map((s) => s.reps)).toEqual([8, 8, 7, 7]);
    expect(next.every((s) => s.weight === 60)).toBe(true);
  });

  it("holds the load and targets the bottom of the range after a miss", () => {
    const next = suggestNextSets(
      inclinePress,
      [set(60, 6), set(60, 5), set(60, 4), set(60, 4)],
    )!;
    expect(next.map((s) => s.reps)).toEqual([6, 6, 6, 6]);
    expect(next[0].weight).toBe(60);
  });

  it("extends the pattern when last time had fewer sets than planned", () => {
    const next = suggestNextSets(inclinePress, [set(60, 7), set(60, 7)])!;
    expect(next).toHaveLength(4);
    expect(next.map((s) => s.reps)).toEqual([8, 8, 8, 8]);
  });

  it("keeps fractional cable loads exact", () => {
    const facePull = getExercise("upper-a", "face-pull")!; // 3 × 15–20, +2.5
    const next = suggestNextSets(facePull, [set(7.25, 20), set(7.25, 20), set(7.25, 20)])!;
    expect(next[0].weight).toBe(9.75);
    expect(next[0].reps).toBe(15);
  });

  it("progresses timed and unloaded bodyweight work by seconds / a rep", () => {
    const hollow = getExercise("upper-a", "hollow-hold")!; // 3 × 20–30 s
    expect(
      suggestNextSets(hollow, [set(0, 30), set(0, 30), set(0, 30)])![0].reps,
    ).toBe(35);
    const abWheel = getExercise("upper-a", "ab-wheel-a")!; // 3 × 8–12, bodyweight, no added load
    expect(
      suggestNextSets(abWheel, [set(0, 12), set(0, 12), set(0, 12)])![0].reps,
    ).toBe(13);
  });

  it("pre-fills 80% load for half the sets on a deload", () => {
    const next = suggestNextSets(
      inclinePress,
      [set(60, 8), set(60, 8), set(60, 8), set(60, 8)],
      { deload: true },
    )!;
    expect(next).toHaveLength(2);
    expect(next[0]).toEqual({ weight: 47.5, reps: 6 });
  });
});
