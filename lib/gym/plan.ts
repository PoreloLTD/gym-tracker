// Michal's 12-week bulk programme — Upper/Lower ×2 (Mon–Thu gym) plus a
// Fri–Sun shift-day home routine. Seeded from the written plan so the
// tracker works offline with zero setup.

export type LoadType = "weight" | "bodyweight" | "time";

export type DayId = "upper-a" | "lower-a" | "upper-b" | "lower-b";

export type Section = "skill" | "main" | "core";

export interface PlanExercise {
  id: string;
  name: string;
  /** Alternative from the plan's swap table. */
  swap?: string;
  sets: number;
  /** Rep range; for `time` exercises this is seconds per set. */
  repMin: number;
  repMax: number;
  loadType: LoadType;
  perSide?: boolean;
  /** Rest after each set, seconds. 0 = superset straight into the next exercise. */
  restSeconds: number;
  /** Set when this exercise is the first half of a superset pair. */
  supersetWithId?: string;
  note?: string;
  /** Suggested load jump (kg) when the top of the rep range is hit on all sets. */
  increment: number;
  section: Section;
}

export interface GymDay {
  id: DayId;
  /** 1 = Monday … 4 = Thursday. */
  weekday: 1 | 2 | 3 | 4;
  title: string;
  subtitle: string;
  duration: string;
  warmup: string[];
  exercises: PlanExercise[];
}

export const GYM_DAYS: GymDay[] = [
  {
    id: "upper-a",
    weekday: 1,
    title: "Upper A",
    subtitle: "Press emphasis + handstand",
    duration: "65–75 min",
    warmup: [
      "3 min bike or rower",
      "Band pull-aparts 2×15",
      "Band external rotations 2×15 per side",
      "Scap push-ups 2×10",
      "Wall slides 2×10",
      "Wrist prep 2 min (circles, floor presses, fingertip holds)",
      "2–3 ramp sets on the first lift",
    ],
    exercises: [
      {
        id: "handstand-skill",
        name: "Handstand skill block",
        sets: 4,
        repMin: 20,
        repMax: 40,
        loadType: "time",
        restSeconds: 90,
        increment: 0,
        section: "skill",
        note: "10 min fresh, before the lifting. Log hold time per set. Wk 1–3: pike holds + wall walk-ups. Wk 4–7: chest-to-wall holds + toe pulls. Wk 8–12: kick-ups + 40–60 s holds. Left shoulder must feel stable upside down — any pinch, drop back a stage.",
      },
      {
        id: "smith-incline-press",
        name: "Smith incline press (30°)",
        sets: 4,
        repMin: 6,
        repMax: 8,
        loadType: "weight",
        restSeconds: 180,
        increment: 2.5,
        section: "main",
        note: "Elbows ~45° from torso, bar to upper chest, safeties set. Stop 1–3 reps short of failure.",
      },
      {
        id: "lat-pulldown",
        name: "Lat pulldown",
        swap: "Band-assisted pull-up",
        sets: 3,
        repMin: 8,
        repMax: 10,
        loadType: "weight",
        restSeconds: 120,
        increment: 2.5,
        section: "main",
        note: "Full stretch at top, elbows to hips. Heavy pull-ups live on Wednesday.",
      },
      {
        id: "landmine-press",
        name: "Landmine press → Smith seated OHP (wk 5+)",
        sets: 3,
        repMin: 8,
        repMax: 10,
        loadType: "weight",
        perSide: true,
        restSeconds: 120,
        increment: 2.5,
        section: "main",
        note: "Wk 1–4 landmine: half-kneeling, one arm at a time, the left shoulder sets the load. Move to Smith seated OHP from week 5 if the shoulder is pain-free.",
      },
      {
        id: "chest-supported-row",
        name: "Chest-supported DB row",
        sets: 3,
        repMin: 10,
        repMax: 12,
        loadType: "weight",
        restSeconds: 90,
        increment: 2,
        section: "main",
        note: "Incline bench. Squeeze at the top, zero low-back involvement.",
      },
      {
        id: "lateral-raise",
        name: "Cable or DB lateral raise",
        sets: 3,
        repMin: 12,
        repMax: 15,
        loadType: "weight",
        restSeconds: 0,
        supersetWithId: "face-pull",
        increment: 1,
        section: "main",
      },
      {
        id: "face-pull",
        name: "Face pull",
        swap: "Band face pull",
        sets: 3,
        repMin: 15,
        repMax: 20,
        loadType: "weight",
        restSeconds: 90,
        increment: 2.5,
        section: "main",
        note: "Rope to forehead, thumbs back, pause. Superset with lateral raises.",
      },
      {
        id: "overhead-triceps",
        name: "Overhead cable triceps extension",
        sets: 3,
        repMin: 10,
        repMax: 12,
        loadType: "weight",
        restSeconds: 90,
        increment: 2.5,
        section: "main",
        note: "Lockout strength for the HSPU.",
      },
      {
        id: "hollow-hold",
        name: "Hollow body hold",
        sets: 3,
        repMin: 20,
        repMax: 30,
        loadType: "time",
        restSeconds: 60,
        increment: 0,
        section: "core",
        note: "Bend the knees to make it doable — this is the handstand shape.",
      },
      {
        id: "ab-wheel-a",
        name: "Kneeling ab-wheel rollout",
        swap: "Plank walk-outs",
        sets: 3,
        repMin: 8,
        repMax: 12,
        loadType: "bodyweight",
        restSeconds: 60,
        increment: 0,
        section: "core",
      },
    ],
  },
  {
    id: "lower-a",
    weekday: 2,
    title: "Lower A",
    subtitle: "Squat emphasis + core",
    duration: "~60 min",
    warmup: [
      "3 min bike",
      "Cat-cow ×10",
      "Dead bug 2×8 per side",
      "Bird dog 2×8 per side",
      "Hip hinge with a dowel ×10",
      "Bodyweight squats ×15",
      "2–3 ramp sets on the first lift",
    ],
    exercises: [
      {
        id: "smith-squat",
        name: "Smith machine squat",
        sets: 4,
        repMin: 6,
        repMax: 8,
        loadType: "weight",
        restSeconds: 180,
        increment: 2.5,
        section: "main",
        note: "Feet slightly forward of the bar, sit straight down, safeties just below your bottom position.",
      },
      {
        id: "db-rdl",
        name: "DB Romanian deadlift",
        sets: 3,
        repMin: 8,
        repMax: 10,
        loadType: "weight",
        restSeconds: 120,
        increment: 2,
        section: "main",
        note: "Light and controlled. Hamstring stretch, not low back. Heavy hinge is Thursday.",
      },
      {
        id: "bulgarian-split-squat",
        name: "DB Bulgarian split squat",
        sets: 3,
        repMin: 8,
        repMax: 10,
        loadType: "weight",
        perSide: true,
        restSeconds: 90,
        increment: 2,
        section: "main",
        note: "Best leg builder with almost no spinal load. Start bodyweight (log 0 kg).",
      },
      {
        id: "leg-curl",
        name: "Lying or seated leg curl",
        swap: "Stability-ball curl, or Nordic negatives ×5",
        sets: 3,
        repMin: 10,
        repMax: 12,
        loadType: "weight",
        restSeconds: 90,
        increment: 2.5,
        section: "main",
      },
      {
        id: "smith-calf-raise",
        name: "Smith standing calf raise",
        sets: 4,
        repMin: 10,
        repMax: 15,
        loadType: "weight",
        restSeconds: 60,
        increment: 2.5,
        section: "main",
        note: "Full stretch, 2 s pause at the bottom.",
      },
      {
        id: "hanging-knee-raise",
        name: "Hanging knee raise → straight-leg raise",
        sets: 3,
        repMin: 8,
        repMax: 12,
        loadType: "bodyweight",
        restSeconds: 60,
        increment: 0,
        section: "core",
        note: "Also builds grip and hanging tolerance for muscle-ups.",
      },
      {
        id: "pallof-press",
        name: "Pallof press",
        swap: "Band Pallof press",
        sets: 3,
        repMin: 10,
        repMax: 12,
        loadType: "weight",
        perSide: true,
        restSeconds: 45,
        increment: 2.5,
        section: "core",
      },
      {
        id: "side-plank-a",
        name: "Side plank",
        sets: 2,
        repMin: 30,
        repMax: 45,
        loadType: "time",
        perSide: true,
        restSeconds: 30,
        increment: 0,
        section: "core",
      },
    ],
  },
  {
    id: "upper-b",
    weekday: 3,
    title: "Upper B",
    subtitle: "Pull emphasis + muscle-up",
    duration: "65–75 min",
    warmup: [
      "3 min bike or rower",
      "Band pull-aparts 2×15",
      "Band external rotations 2×15 per side",
      "Scap push-ups 2×10",
      "Wall slides 2×10",
      "Wrist prep 2 min",
      "2–3 ramp sets on the first lift",
    ],
    exercises: [
      {
        id: "muscle-up-skill",
        name: "Muscle-up skill block",
        sets: 3,
        repMin: 3,
        repMax: 5,
        loadType: "bodyweight",
        restSeconds: 90,
        increment: 0,
        section: "skill",
        note: "10 min fresh. Phase 1 (under 8 strict pull-ups): low-bar transitions on the Smith, 3×5 slow. Phase 2: explosive pull-ups 4×3–5, chest-to-bar 3×5, jumping muscle-ups. Phase 3: band-assisted muscle-ups 4×3 + negatives 3×3.",
      },
      {
        id: "pull-ups",
        name: "Pull-ups",
        swap: "Band-assisted if under 5 strict reps",
        sets: 4,
        repMin: 5,
        repMax: 8,
        loadType: "bodyweight",
        restSeconds: 180,
        increment: 2.5,
        section: "main",
        note: "The muscle-up engine. Chest to bar as it gets stronger. Add weight once 4×8 is easy — log added kg.",
      },
      {
        id: "bench-press",
        name: "Smith flat bench or DB bench",
        sets: 4,
        repMin: 8,
        repMax: 10,
        loadType: "weight",
        restSeconds: 150,
        increment: 2.5,
        section: "main",
        note: "DBs are kinder to the left shoulder — try both.",
      },
      {
        id: "single-arm-row",
        name: "Single-arm DB row",
        sets: 3,
        repMin: 10,
        repMax: 12,
        loadType: "weight",
        perSide: true,
        restSeconds: 90,
        increment: 2,
        section: "main",
        note: "Hand on bench. Go chest-supported if the low back grumbles.",
      },
      {
        id: "dips",
        name: "Parallel-bar dips (partial ROM)",
        swap: "Neutral-grip DB shoulder press (not bench dips)",
        sets: 3,
        repMin: 8,
        repMax: 12,
        loadType: "bodyweight",
        restSeconds: 120,
        increment: 2.5,
        section: "main",
        note: "Only as deep as the shoulder feels stable; bench-assisted if needed. Feeds the muscle-up transition and HSPU.",
      },
      {
        id: "rear-delt-fly",
        name: "Rear-delt DB fly",
        sets: 3,
        repMin: 15,
        repMax: 15,
        loadType: "weight",
        restSeconds: 0,
        supersetWithId: "band-pull-apart",
        increment: 1,
        section: "main",
      },
      {
        id: "band-pull-apart",
        name: "Band pull-apart",
        sets: 3,
        repMin: 20,
        repMax: 20,
        loadType: "bodyweight",
        restSeconds: 60,
        increment: 0,
        section: "main",
        note: "Superset with rear-delt flys.",
      },
      {
        id: "incline-curl",
        name: "Incline DB curl",
        sets: 3,
        repMin: 10,
        repMax: 12,
        loadType: "weight",
        restSeconds: 0,
        supersetWithId: "rope-pushdown",
        increment: 2,
        section: "main",
      },
      {
        id: "rope-pushdown",
        name: "Rope triceps pushdown",
        sets: 3,
        repMin: 12,
        repMax: 15,
        loadType: "weight",
        restSeconds: 60,
        increment: 2.5,
        section: "main",
        note: "Superset with incline curls.",
      },
      {
        id: "hollow-rocks",
        name: "Hollow rocks",
        sets: 3,
        repMin: 10,
        repMax: 15,
        loadType: "bodyweight",
        restSeconds: 60,
        increment: 0,
        section: "core",
      },
      {
        id: "bird-dog",
        name: "Bird dog (slow, 3 s hold)",
        sets: 2,
        repMin: 8,
        repMax: 8,
        loadType: "bodyweight",
        perSide: true,
        restSeconds: 30,
        increment: 0,
        section: "core",
      },
    ],
  },
  {
    id: "lower-b",
    weekday: 4,
    title: "Lower B",
    subtitle: "Hinge emphasis + core + light pulls",
    duration: "~60 min",
    warmup: [
      "3 min bike",
      "Cat-cow ×10",
      "Dead bug 2×8 per side",
      "Bird dog 2×8 per side",
      "Hip hinge with a dowel ×10",
      "Bodyweight squats ×15",
      "2–3 ramp sets on the first lift",
    ],
    exercises: [
      {
        id: "smith-rdl",
        name: "Smith machine RDL",
        sets: 4,
        repMin: 8,
        repMax: 10,
        loadType: "weight",
        restSeconds: 180,
        increment: 2.5,
        section: "main",
        note: "Push hips back, soft knees, bar brushes the thighs. Stop when the hamstrings say so, not when the back rounds. Start at ~50% of what you think you can do.",
      },
      {
        id: "smith-hip-thrust",
        name: "Smith machine hip thrust",
        sets: 3,
        repMin: 10,
        repMax: 12,
        loadType: "weight",
        restSeconds: 120,
        increment: 2.5,
        section: "main",
        note: "Pad on the bar, chin tucked, 2 s squeeze at the top.",
      },
      {
        id: "goblet-squat",
        name: "Goblet squat or leg press",
        sets: 3,
        repMin: 12,
        repMax: 15,
        loadType: "weight",
        restSeconds: 90,
        increment: 2,
        section: "main",
        note: "Higher-rep quad work.",
      },
      {
        id: "back-extension",
        name: "45° back extension",
        swap: "Bench reverse hyper, or superman holds",
        sets: 3,
        repMin: 12,
        repMax: 15,
        loadType: "bodyweight",
        restSeconds: 90,
        increment: 2.5,
        section: "main",
        note: "Bodyweight for 4 weeks, then hold a plate (log the plate as added kg). This is the low-back builder.",
      },
      {
        id: "single-leg-calf-raise",
        name: "Single-leg DB calf raise",
        sets: 3,
        repMin: 12,
        repMax: 15,
        loadType: "weight",
        perSide: true,
        restSeconds: 60,
        increment: 2,
        section: "main",
      },
      {
        id: "scap-pull-ups",
        name: "Scap pull-ups or light lat pulldown",
        sets: 3,
        repMin: 10,
        repMax: 12,
        loadType: "bodyweight",
        restSeconds: 60,
        increment: 0,
        section: "main",
        note: "Extra pulling volume for the muscle-up without wrecking Wednesday.",
      },
      {
        id: "ab-wheel-b",
        name: "Ab-wheel rollout",
        swap: "Plank walk-outs",
        sets: 3,
        repMin: 8,
        repMax: 12,
        loadType: "bodyweight",
        restSeconds: 60,
        increment: 0,
        section: "core",
      },
      {
        id: "farmers-carry",
        name: "Farmer's carry (walking)",
        sets: 3,
        repMin: 30,
        repMax: 40,
        loadType: "time",
        restSeconds: 60,
        increment: 2,
        section: "core",
        note: "Heavy DBs — grip for the bar, bracing for the back. Log seconds and the total kg carried.",
      },
      {
        id: "dead-bug",
        name: "Dead bug",
        sets: 2,
        repMin: 10,
        repMax: 10,
        loadType: "bodyweight",
        perSide: true,
        restSeconds: 30,
        increment: 0,
        section: "core",
      },
    ],
  },
];

export function getDay(id: DayId): GymDay {
  const day = GYM_DAYS.find((d) => d.id === id);
  if (!day) throw new Error(`Unknown gym day: ${id}`);
  return day;
}

export function getExercise(dayId: DayId, exerciseId: string): PlanExercise | undefined {
  return getDay(dayId).exercises.find((e) => e.id === exerciseId);
}

/** Suggested gym day for a JS weekday (0 = Sun). Fri–Sun are home days → null. */
export function dayForWeekday(jsWeekday: number): GymDay | null {
  return GYM_DAYS.find((d) => d.weekday === jsWeekday) ?? null;
}

export interface HomeBlock {
  title: string;
  duration: string;
  items: string[];
}

export const HOME_ROUTINE: HomeBlock[] = [
  {
    title: "Block 1 — Prep",
    duration: "5 min",
    items: [
      "Wrist circles 30 s each direction",
      "Palm-down floor presses ×10, palm-up ×10",
      "Fingertip push-up position holds 3×10 s",
      "Band pull-aparts ×15",
      "Band external rotations ×15 per side",
      "Wall slides ×10 · Scap push-ups ×10 · Cat-cow ×10",
    ],
  },
  {
    title: "Block 2 — Handstand",
    duration: "8–10 min",
    items: [
      "Wk 1–3: pike hold (feet on chair) 3×20 s · wall walk-up to ~45° 3×15–20 s",
      "Wk 4–7: chest-to-wall handstand 4×20–40 s · toe pulls 2×5 per side",
      "Wk 8–12: back-to-wall kick-ups 5–8 attempts · chest-to-wall 2×40–60 s",
      "Sunday: drop one set from everything — Monday is Upper A",
    ],
  },
  {
    title: "Block 3 — Muscle-up bits",
    duration: "4 min",
    items: [
      "With bar: dead hang 2×20–30 s · scap pull-ups 2×8 · band muscle-up pull 2×8",
      "Without bar: band straight-arm pulldown 2×15 · band row 2×15",
    ],
  },
  {
    title: "Block 4 — Core",
    duration: "5 min",
    items: [
      "Hollow body hold 3×20–30 s",
      "Dead bug 2×8 per side, slow",
      "Side plank 2×30 s per side",
      "Bird dog 2×8 per side, 3 s hold",
    ],
  },
  {
    title: "Block 5 — Mobility & stretching",
    duration: "10–12 min",
    items: [
      "Hips: couch stretch · hamstring (heel on chair) · figure-4 · calves — 40–45 s per side",
      "Upper: open-book ×8 per side · doorway pec · lat stretch",
      "Low back: child's pose 60 s · knee-to-chest twist",
      "Wrists: flexor + extensor stretch 30 s each",
      "Finish: 2 min on your back — in for 4, out for 6",
    ],
  },
];

/** Gym-session handstand drills per stage (§7 of the plan). */
export const HANDSTAND_STAGE_DRILLS: Record<1 | 2 | 3 | 4, string[]> = {
  1: [
    "Pike hold, feet on a box, hips over hands — 3 × 20 s",
    "Wall walk-up to ~45°, chest to wall — 3 × 15–20 s",
    "Pike push-ups 3 × 8–12 (the HSPU line starts here)",
  ],
  2: [
    "Chest-to-wall handstand, only toes touching — 4–5 × 20–40 s",
    "Toe pulls: lift one foot off the wall 1–2 s each",
    "Feet-elevated pike push-ups (box) 3 × 8–12",
  ],
  3: [
    "Back-to-wall kick-ups — 5–8 attempts, wall as spotter",
    "Chest-to-wall holds building to 45–60 s — 3 sets",
    "HSPU negatives (3–5 s down to a pad) 3 × 3–5 — only once 3 × 40 s chest-to-wall is clean and the left shoulder is pain-free",
  ],
  4: [
    "Partial-ROM wall HSPU to a stack of pads — remove a pad every 1–2 weeks",
  ],
};

/** Phase 2 unlocks at 8 strict pull-ups (the plan's prerequisite). */
export function muscleUpPhase(bestStrictPullUps: number): 1 | 2 {
  return bestStrictPullUps >= 8 ? 2 : 1;
}

export const MUSCLE_UP_PHASE_DRILLS: Record<1 | 2, string[]> = {
  1: [
    "Low-bar transitions on the Smith (bar at chest height) — 3 × 5 slow",
    "Straight-arm cable pulldown 2 × 12",
    "Keep grinding Wednesday pull-ups — phase 2 unlocks at 8 strict reps",
  ],
  2: [
    "Explosive pull-ups, bar towards the hips, aim for sternum — 4 × 3–5",
    "Chest-to-bar pull-ups 3 × 5",
    "Straight-bar dips (Smith locked high) 3 × 6–10",
    "Jumping muscle-ups on a lower bar 3 × 3–5",
    "Phase 3 (band-assisted MUs + slow negatives) once you have a chest-to-bar pull-up and ~10 dips",
  ],
};

export const HOME_MINIMUM: string[] = [
  "Wrist circles + floor presses — 1 min",
  "Band external rotations ×15 per side + pull-aparts ×15 — 2 min",
  "Wall handstand, your stage, 3×20 s — 3 min",
  "Couch stretch, child's pose, doorway pec — 45 s each — 2 min",
];
