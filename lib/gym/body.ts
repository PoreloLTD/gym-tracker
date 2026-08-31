// Bodyweight + measurement log helpers. The plan's success criterion is the
// scale moving 0.25–0.5 kg per week on the bulk, with chest/arm/waist
// measurements at weeks 0, 6 and 12.

export interface BodyEntry {
  /** yyyy-mm-dd */
  dateISO: string;
  weightKg: number;
  chestCm?: number;
  armCm?: number;
  waistCm?: number;
}

export const BULK_RATE_KG_PER_WEEK = { min: 0.25, max: 0.5 };

/**
 * Rate of change in kg/week between the two most recent entries
 * (sorted by date). Null with fewer than two entries on distinct days.
 */
export function weeklyRate(entries: BodyEntry[]): number | null {
  if (entries.length < 2) return null;
  const sorted = [...entries].sort((a, b) => a.dateISO.localeCompare(b.dateISO));
  const last = sorted[sorted.length - 1];
  const prev = sorted[sorted.length - 2];
  const days =
    (new Date(`${last.dateISO}T00:00:00`).getTime() -
      new Date(`${prev.dateISO}T00:00:00`).getTime()) /
    (24 * 60 * 60 * 1000);
  if (days <= 0) return null;
  return ((last.weightKg - prev.weightKg) / days) * 7;
}

export type RateVerdict = "on-target" | "too-slow" | "too-fast";

export function rateVerdict(kgPerWeek: number): RateVerdict {
  if (kgPerWeek < BULK_RATE_KG_PER_WEEK.min) return "too-slow";
  if (kgPerWeek > BULK_RATE_KG_PER_WEEK.max) return "too-fast";
  return "on-target";
}
