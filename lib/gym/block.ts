// 12-week block position: week number, deloads (wk 6 & 12) and the
// handstand stage that goes with the current week.

export interface BlockPosition {
  /** 1-based week of the block; keeps counting past 12. */
  week: number;
  isDeload: boolean;
  isTestWeek: boolean;
  handstandStage: 1 | 2 | 3 | 4;
  stageLabel: string;
}

const STAGE_LABELS: Record<1 | 2 | 3 | 4, string> = {
  1: "Stage 1 — build the shape (pike holds, wall walk-ups)",
  2: "Stage 2 — chest-to-wall handstand",
  3: "Stage 3 — freestanding + HSPU negatives",
  4: "Stage 4 — partial-ROM wall HSPU",
};

export function blockPosition(startISO: string, now: Date): BlockPosition {
  const start = new Date(`${startISO}T00:00:00`);
  // Snap to the Monday of the start week so block weeks always run Mon–Sun
  // (the plan's structure), whatever day the first session lands on.
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  const msPerDay = 24 * 60 * 60 * 1000;
  const days = Math.floor((now.getTime() - start.getTime()) / msPerDay);
  const week = Math.max(1, Math.floor(days / 7) + 1);

  const handstandStage: 1 | 2 | 3 | 4 =
    week <= 3 ? 1 : week <= 7 ? 2 : week <= 12 ? 3 : 4;

  return {
    week,
    isDeload: week === 6 || week === 12,
    isTestWeek: week === 12,
    handstandStage,
    stageLabel: STAGE_LABELS[handstandStage],
  };
}
