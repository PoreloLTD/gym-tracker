# Overload — gym tracker

Personal workout tracker for a 12-week Upper/Lower bulk block (Mon–Thu gym,
Fri–Sun shift-day home routine). Fully client-side: sessions, bodyweight log
and settings live in the browser's localStorage — no backend, no accounts.

- Per-set logging (kg × reps, bodyweight + added kg, or seconds)
- Session/exercise tonnage with "vs last session" deltas and
  double-progression hints (top of the rep range on every set → add weight)
- Wall-clock rest timer with per-exercise defaults, beep and vibration
- Deload-aware weeks 6/12, stage-aware handstand and muscle-up skill blocks
- Warm-up checklist, bodyweight/measurement trend, JSON export

## Develop

```bash
npm install
npm run dev    # http://localhost:3000
npm test
npm run build
```

Deployed on Vercel; pushes to `main` auto-deploy.

