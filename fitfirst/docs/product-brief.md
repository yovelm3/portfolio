# FitFirst — product brief

## Idea
Mobile-first web app where women who train build a workout look on a mannequin with their own
body proportions, mixing brands, and get the right size in each brand plus the best final price.

## Flagship promise
Cut returns for both sides. The same size label differs between brands (one brand's M can be
another brand's L), so the app recommends a size per brand and per product.

## Decisions
- Market: English-speaking first. UI in English.
- Customer: women training in gyms and Pilates studios.
- Money: affiliate links; the shopper pays the store directly.
- Wording: "we search for the best final deal", no lowest-price guarantee.
- Privacy: measurements and photos stay on the device.
- Mannequin built from measurements is the emotional hook; on-device photo scan comes later.
- Quick and Precise paths, accuracy meter instead of a percentage claim.

## Fit logic (prototype)
For each product: brand size-chart offset + buyer-review bias ("runs small / large", up to 3 cm)
+ fabric stretch (cm the fabric can go past the chart). Each body area gets a status: good, snug,
roomy, tight, loose. The best size is the one with the lowest risk score; a return chance is
estimated from the worst area. Relaxed-fit items tolerate more looseness.

## Price logic (prototype)
Tries every combination of stores for the look. Shipping is charged per store unless the store's
free-shipping threshold is reached. Picks the lowest final total and compares it with buying each
item at the brand's own store.

## Affiliate programs checked (Nov 2026; rates vary by network and region)
- Gymshark: roughly 4–10%; not all sites accepted.
- Alo Yoga: up to ~16% on some networks; listed as closed on others.
- Lululemon: ~5–20% depending on network; individual approval.
