# Roadmap

Validation runs in parallel: send the Google Form (survey/create-survey-form.gs) to 30+ women who
train at least twice a week. Go/no-go criteria: 60% returned or gave up because of size,
50% rate the problem 4–5 out of 5, 40% leave an email.

## Phase A — real project from the prototype (built, v0.3)
1. Scaffold Vite + React + TypeScript.
2. Move the fit engine and price engine from prototype/index.html into `src/engine/` as pure functions.
3. Unit tests for both engines (Vitest), using the prototype's demo data as fixtures.
4. Rebuild the screens: Start, Quick, Precise, Wardrobe. Same behaviour and look as the prototype.
5. Deploy a preview link. (GitHub Pages workflow ready; goes live once merged to main and Pages is enabled.)

## Phase B — real size data (next)
1. JSON schema for brands, size charts (per product type), products and offers.
2. Collect official size charts for 5 brands: Nike, Lululemon, Alo Yoga, Adidas, Gymshark —
   sports bras, leggings, tops. Store source URL and date for every chart.
3. Replace demo brands, keep a "demo" flag where data is still invented.

## Phase C — products and prices
1. Start with ~30 hand-picked products with links and prices (checked date shown).
2. Apply to affiliate networks once the site is live (Awin, Rakuten / Partnerize, FlexOffers, CJ, Skimlinks).
3. Switch to product feeds when approved.

## Phase D — launch basics
Domain, landing page with waitlist, privacy policy, terms, affiliate disclosure, simple analytics.

## Phase E — later
3D mannequin (three.js; check body-model licences for commercial use), on-device photo
measurement (MediaPipe), review analysis per product.
