# Aza UI Redesign — Deploy Notes

## 1. Extract this zip over your repo

Extract so files land under `artifacts/aza/src/...` in your existing checkout,
overwriting the matching paths.

## 2. Delete two superseded files (zip extraction won't do this for you)

```
rm artifacts/aza/src/pages/home.tsx
rm artifacts/aza/src/pages/results.tsx
```

`home.tsx` is replaced by `profile-wizard.tsx`. `results.tsx` is replaced by
`opportunities-list.tsx`. Old routes to them no longer exist in `App.tsx`.

## 3. Commit and push as normal

```
git add -A
git commit -m "UI redesign: black/green dashboard shell, wizard, real eligibility panel"
git push
```

Nothing about your Vercel config, `vercel.json`, Root Directory setting, or the
backend build process needed to change for this. Frontend-only diff.

## What's real vs. what's a flagged stub

**Real, wired to your actual engine — verified live against the running backend:**
- Marketing homepage (`/`)
- 4-step profile wizard (`/profile`) → calls `POST /api/opportunities/analyze` for real
- Dashboard (`/dashboard`) — real eligible/potential/ineligible counts, real top-3 matches
- Opportunities list + filters (`/opportunities`) — filters your real 8 opportunities client-side
- Opportunity detail + eligibility panel (`/opportunities/:id`) — match score ring and
  reasons checklist are your engine's real `eligibleReasons` / `concernReasons` /
  `missingRequirements` / `nextActions`, not mock text
- Apply flow — unchanged from before: honestly tells the user this is demo data and
  won't fake-redirect anywhere; offers a copy-able prep checklist instead

**UI shell only, explicitly flagged in-app with an orange "not built yet" notice —
do not mistake these for done:**
- `/saved` — nothing persists, no database
- `/applications` — no tracking logic exists
- `/ai-match` — static chat mockup, no LLM call, input does nothing
- `/resources` — no content behind it
- `/settings` — no accounts to manage

## Known gaps I did not solve, on purpose

- **Hero image**: the reference has a photo of a person with a laptop. I left an
  explicitly-labeled gray placeholder ("Hero photo placeholder — no licensed image
  sourced yet") rather than pulling a random stock photo with unclear licensing, or
  faking it with a gradient. You'll want to either commission/license a real photo or
  tell me to search stock sites you already have rights to.
- **Date of birth vs. age**: the reference mockup shows a DOB picker
  (`16 / 05 / 2009`). Your actual `ProfileInput` schema only has `age: number`. I kept
  the real `age` field rather than faking a DOB input that doesn't map to anything —
  changing this for real means changing the API contract, which is backend work I
  didn't touch this session.
- **Colors**: sampled directly from your reference image's pixels (not eyeballed),
  but I could not get a hardware color picker onto the actual reference file, so
  treat these as a very close match rather than a guaranteed exact hex match. Sampled
  values: sidebar `hsl(201 100% 3%)`, button green `hsl(120 48% 26%)`, accent/headline
  green `hsl(126 51% 36%)`.
- **Mobile-specific screens**: out of scope this pass per your instruction — web only.

## What I verified end-to-end (not just visually)

Ran the actual Express backend locally (`PORT=5050`) alongside the Vite dev server,
drove the full wizard with Playwright using your "Try a demo profile" preset, and
confirmed:
- The real `/api/opportunities/analyze` call returns 200
- Dashboard shows the correct real counts (3 eligible / 1 potential / 4 ineligible
  out of 8 total, for the demo profile)
- Filtering to "Eligible" on the opportunities list correctly narrows 8 → 3, matching
  the dashboard count
- Opportunity detail renders real, distinct eligibility reasoning per opportunity
- The apply modal's "demo data" disclosure renders correctly and never sends anyone
  to a placeholder external URL

## Next conversation

You said after the UI direction was locked, we'd talk through what "real"
functionality it requires — real opportunity data (beyond the 8 hardcoded ones), real
persistence for Saved/Applications, a real apply flow, possibly real accounts. That
conversation hasn't happened yet. This zip is UI only.
