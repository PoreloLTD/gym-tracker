"use client";

// Client-only zustand store for the gym tracker. Everything persists to
// localStorage — the tracker is a personal, offline tool with no backend.

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { blockPosition } from "@/lib/gym/block";
import type { BodyEntry } from "@/lib/gym/body";
import type { DayId } from "@/lib/gym/plan";
import type { LoggedSet } from "@/lib/gym/progression";

export interface WorkoutSession {
  id: string;
  dayId: DayId;
  startedAt: number;
  finishedAt?: number;
  /** Started during a deload week (6/12) — excluded from comparisons. */
  isDeload?: boolean;
  /** Warm-up items ticked off this session. */
  warmupDone?: string[];
  /** exerciseId → logged sets, in order. */
  sets: Record<string, LoggedSet[]>;
}

export interface RestTimerState {
  /** Epoch ms when the rest ends. */
  endsAt: number;
  totalSeconds: number;
  exerciseName: string;
}

interface GymState {
  sessions: WorkoutSession[];
  activeSessionId: string | null;
  /** ISO date (yyyy-mm-dd) of week 1, day 1 of the block. */
  blockStartISO: string | null;
  bodyLog: BodyEntry[];
  restTimer: RestTimerState | null;
  soundOn: boolean;
  hasHydrated: boolean;

  startSession: (dayId: DayId) => void;
  finishSession: () => void;
  discardSession: () => void;
  logSet: (exerciseId: string, set: LoggedSet) => void;
  removeSet: (exerciseId: string, index: number) => void;
  deleteSession: (sessionId: string) => void;
  toggleWarmupItem: (item: string) => void;
  logBody: (entry: BodyEntry) => void;
  removeBodyEntry: (dateISO: string) => void;
  setBlockStart: (iso: string) => void;
  startRest: (seconds: number, exerciseName: string) => void;
  adjustRest: (deltaSeconds: number) => void;
  stopRest: () => void;
  toggleSound: () => void;
  setHasHydrated: (v: boolean) => void;
}

function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export const useGymStore = create<GymState>()(
  persist(
    (set, get) => ({
      sessions: [],
      activeSessionId: null,
      blockStartISO: null,
      bodyLog: [],
      restTimer: null,
      soundOn: true,
      hasHydrated: false,

      startSession: (dayId) => {
        const { blockStartISO } = get();
        const session: WorkoutSession = {
          id: newId(),
          dayId,
          startedAt: Date.now(),
          isDeload: blockStartISO
            ? blockPosition(blockStartISO, new Date()).isDeload
            : false,
          sets: {},
        };
        set((state) => ({
          sessions: [...state.sessions, session],
          activeSessionId: session.id,
          // First ever session anchors week 1 of the block.
          blockStartISO:
            state.blockStartISO ?? new Date().toISOString().slice(0, 10),
        }));
      },

      finishSession: () => {
        const { activeSessionId } = get();
        if (!activeSessionId) return;
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === activeSessionId ? { ...s, finishedAt: Date.now() } : s,
          ),
          activeSessionId: null,
          restTimer: null,
        }));
      },

      discardSession: () => {
        const { activeSessionId } = get();
        if (!activeSessionId) return;
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== activeSessionId),
          activeSessionId: null,
          restTimer: null,
        }));
      },

      logSet: (exerciseId, loggedSet) => {
        const { activeSessionId } = get();
        if (!activeSessionId) return;
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === activeSessionId
              ? {
                  ...s,
                  sets: {
                    ...s.sets,
                    [exerciseId]: [...(s.sets[exerciseId] ?? []), loggedSet],
                  },
                }
              : s,
          ),
        }));
      },

      removeSet: (exerciseId, index) => {
        const { activeSessionId } = get();
        if (!activeSessionId) return;
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === activeSessionId
              ? {
                  ...s,
                  sets: {
                    ...s.sets,
                    [exerciseId]: (s.sets[exerciseId] ?? []).filter(
                      (_, i) => i !== index,
                    ),
                  },
                }
              : s,
          ),
        }));
      },

      toggleWarmupItem: (item) => {
        const { activeSessionId } = get();
        if (!activeSessionId) return;
        set((state) => ({
          sessions: state.sessions.map((s) => {
            if (s.id !== activeSessionId) return s;
            const done = s.warmupDone ?? [];
            return {
              ...s,
              warmupDone: done.includes(item)
                ? done.filter((i) => i !== item)
                : [...done, item],
            };
          }),
        }));
      },

      logBody: (entry) =>
        set((state) => ({
          bodyLog: [
            ...state.bodyLog.filter((e) => e.dateISO !== entry.dateISO),
            entry,
          ].sort((a, b) => a.dateISO.localeCompare(b.dateISO)),
        })),

      removeBodyEntry: (dateISO) =>
        set((state) => ({
          bodyLog: state.bodyLog.filter((e) => e.dateISO !== dateISO),
        })),

      deleteSession: (sessionId) =>
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== sessionId),
          activeSessionId:
            state.activeSessionId === sessionId ? null : state.activeSessionId,
        })),

      setBlockStart: (iso) => set({ blockStartISO: iso }),

      startRest: (seconds, exerciseName) =>
        set({
          restTimer: {
            endsAt: Date.now() + seconds * 1000,
            totalSeconds: seconds,
            exerciseName,
          },
        }),

      adjustRest: (deltaSeconds) => {
        const { restTimer } = get();
        if (!restTimer) return;
        set({
          restTimer: {
            ...restTimer,
            endsAt: Math.max(Date.now(), restTimer.endsAt + deltaSeconds * 1000),
            totalSeconds: Math.max(1, restTimer.totalSeconds + deltaSeconds),
          },
        });
      },

      stopRest: () => set({ restTimer: null }),

      toggleSound: () => set((state) => ({ soundOn: !state.soundOn })),

      setHasHydrated: (v) => set({ hasHydrated: v }),
    }),
    {
      name: "porelo-gym-tracker-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: ({
        sessions,
        activeSessionId,
        blockStartISO,
        bodyLog,
        soundOn,
      }) => ({
        sessions,
        activeSessionId,
        blockStartISO,
        bodyLog,
        soundOn,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

/** Finished sessions for a day, newest first. */
export function previousSessions(
  sessions: WorkoutSession[],
  dayId: DayId,
  excludeId?: string,
): WorkoutSession[] {
  return sessions
    .filter((s) => s.dayId === dayId && s.finishedAt && s.id !== excludeId)
    .sort((a, b) => b.startedAt - a.startedAt);
}

/**
 * The most recent finished, non-deload session of a day — the baseline for
 * "last time" comparisons and progression hints (deload numbers would poison
 * both).
 */
export function lastComparableSession(
  sessions: WorkoutSession[],
  dayId: DayId,
  excludeId?: string,
): WorkoutSession | undefined {
  return previousSessions(sessions, dayId, excludeId).find((s) => !s.isDeload);
}
