# FitFirst

Sportswear look builder with per-brand size advice: build a workout look on a mannequin with your own shape,
get the right size in every brand, and see the best final price for the whole look.

- Project context for Claude Code: `CLAUDE.md`. Plans: `docs/`.
- The original single-file prototype (v0.2) is kept in `prototype/index.html` as the reference.

## Run it

Needs Node 22+.

```bash
npm install      # once
npm run dev      # local dev server with live reload, open the URL it prints
npm test         # fit engine + price engine + data tests
npm run build    # type-check and build the site into dist/
```

## Where things are

| Path | What |
|---|---|
| `src/engine/fit.ts` | Fit engine: size recommendation, fit per body area, return chance |
| `src/engine/price.ts` | Price engine: cheapest store combination, shipping included |
| `src/engine/*.test.ts` | Tests. They also check the engines give exactly the prototype's answers |
| `data/demo/*.json` | Invented demo brands, size chart, products, stores (marked `"demo": true`) |
| `src/data/catalog.ts` | Loads the data for the engines (Phase B swaps in real data here) |
| `src/screens/` | Start, Quick, Precise, Wardrobe |
| `src/mannequin/` | Mannequin drawing from body measurements |
| `src/state.ts` | Saved details. Stored only in the browser (localStorage) |
| `scripts/make-golden.mjs` | Recorded the prototype's answers for the parity tests |

Deploy: `.github/workflows/pages.yml` at the repository root tests, builds and publishes to GitHub Pages
(`/fitfirst/`) on every push to `main`.
