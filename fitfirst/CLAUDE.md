# FitFirst (working name)

Mobile-first web app. Women who train (gym, Pilates) build a workout look on a mannequin that has
their own proportions, mixing several brands. The app tells them which size to order in each brand
and product, warns when a size is likely to be returned, and finds the best final price for the
whole look across stores. Shoppers buy at the store; our links are affiliate links.

Flagship promise: "The right size, the first time" — fewer returns for shoppers and stores.

## Who you are working with
- Solo founder, Industrial Engineering & Management student, new to building software with Claude.
- Talk to him in Hebrew. Explain each step simply: what you did, why, and how to check it.
- Keep code, comments, commit messages and file names in English.
- Product UI language: English (first market is English-speaking).

## Decisions already made (ask before changing)
- Privacy: body measurements and photos stay on the user's device (localStorage / IndexedDB).
  Never send body data to a server.
- Wording: "we search for the best final deal". Never promise or guarantee the lowest price.
- No numeric accuracy claims (no "99.99% fit"). Show an accuracy meter: Quick = good estimate, Precise = precise.
- Two onboarding paths: Quick (height, usual size, body shape) and Precise (6 tape measurements).
- Wardrobe UI: one swipe row per slot (top layer, sports bra, bottoms); mannequin updates live.
- Affiliate disclosure must be visible on the site.
- First audience: women who train in gyms and Pilates studios.

## Current state
- Phase A is built (v0.3): Vite + React + TypeScript app in this folder. See README.md for the file map.
  Engines are pure functions in `src/engine/`; demo data in `data/demo/*.json`.
  Tests check the engines match the prototype exactly (`src/engine/__fixtures__/prototype-golden.json`).
- The project lives in the `fitfirst/` folder of the founder's `portfolio` repository.
  Deploy: GitHub Pages via `.github/workflows/pages.yml` at the repo root (no extra account needed).
- `prototype/index.html` is the original single-file prototype (v0.2) with INVENTED demo data. Keep it as the reference.
- `docs/` holds the product brief, the research summary and the roadmap.
- `survey/` holds the validation survey (Google Apps Script that builds a Google Form, and a page with
  research-based answers). These are not part of the app.

## Stack (confirmed)
- Vite + React + TypeScript, plain CSS with design tokens (light and dark).
- Data in `data/*.json` (brands, size charts, products, offers). Schema validation comes in Phase B.
- Vitest unit tests for the fit engine and the price engine.
- Fonts are bundled (@fontsource), no third-party font server.
- Deploy on GitHub Pages through GitHub Actions (free).

## Rules for data
- Never invent real brand size charts, prices or reviews. Real data must come from the brand's official
  size-chart page or an affiliate product feed, and each record stores its source URL and the date checked.
- Demo data must stay clearly labelled as demo in the UI.

## How to work
- Small steps. After each step run it, show the result, and explain in Hebrew what changed.
- Ask before adding any paid service, account, or anything that sends data off the device.
- Read `docs/roadmap.md` to see which phase we are in.
