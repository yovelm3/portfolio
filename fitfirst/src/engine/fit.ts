/*
 * FIT ENGINE (moved from prototype v0.2, same behaviour).
 *
 * For each product and size:
 *   1. Start from the base chart mid-point for each body area.
 *   2. Shift it by the brand offset and by buyer reviews ("runs small" pulls the garment smaller, up to 3 cm).
 *   3. The garment "fits" within ±tolerance of that mid-point.
 *   4. Above the band: fabric stretch can absorb some of it (snug), otherwise tight.
 *      Below the band: a little room is fine (more for relaxed fits), then roomy, then loose.
 *   5. Each area gets a risk score 0–3; the garment's score is the worst area.
 * The recommended size is the one with the lowest score (ties: closest overall to the mid-points).
 */
import type { Body, Catalog, Dim, Product, QuickInput, Size } from "./types";

export type FitStatus = "good" | "snug" | "roomy" | "tight" | "loose";

export interface FitLevel {
  name: string;
  cls: "ok" | "warn" | "risk";
  sym: string;
  /** Estimated chance this item goes back. */
  returnChance: number;
}

/** Index = risk score (0 best … 3 worst). */
export const LEVELS: readonly FitLevel[] = [
  { name: "Great fit", cls: "ok", sym: "✓", returnChance: 0.07 },
  { name: "Good fit", cls: "ok", sym: "✓", returnChance: 0.12 },
  { name: "Check the fit", cls: "warn", sym: "!", returnChance: 0.25 },
  { name: "Likely return", cls: "risk", sym: "✕", returnChance: 0.55 },
];

export interface DimFit {
  dim: Dim;
  body: number;
  min: number;
  max: number;
  status: FitStatus;
  /** How far outside the band, in cm (after stretch for "tight"). */
  amount: number;
  score: number;
}

export interface FitResult {
  dims: DimFit[];
  score: number;
  /** Sum of |body − mid-point|, used to break ties between sizes. */
  deviation: number;
  level: FitLevel;
}

/** Reviews shift the chart: +3 cm means "acts 3 cm smaller". */
export function reviewBias(p: Product): number {
  return ((p.reviews.runsSmallPct - p.reviews.runsLargePct) / 100) * 3;
}

export function dimsFor(catalog: Catalog, p: Product): Dim[] {
  const slot = catalog.slots.find((s) => s.category === p.category);
  if (!slot) throw new Error(`No slot for category ${p.category}`);
  return slot.dims;
}

export function fitFor(catalog: Catalog, p: Product, size: Size, body: Body): FitResult {
  const brand = catalog.brands[p.brand];
  if (!brand) throw new Error(`Unknown brand ${p.brand}`);
  const { chart, toleranceCm } = catalog.sizeChart;
  const shift = brand.offsetCm - reviewBias(p);
  const okRoom = p.relaxed ? 6 : 2; // cm of looseness that still counts as a good fit
  let score = 0;
  let deviation = 0;

  const dims = dimsFor(catalog, p).map((dim): DimFit => {
    const mid = chart[size][dim] + shift;
    const min = mid - toleranceCm;
    const max = mid + toleranceCm;
    const b = body[dim];
    let status: FitStatus = "good";
    let amount = 0;
    let s = 0;

    if (b > max) {
      const over = b - max;
      if (over <= p.stretchCm) {
        status = "snug";
        amount = over;
        s = 1;
      } else {
        status = "tight";
        amount = over - p.stretchCm;
        s = 3;
      }
    } else if (b < min) {
      const under = min - b;
      if (under <= okRoom) {
        // still a good fit
      } else if (under <= okRoom + 3) {
        status = "roomy";
        amount = under;
        s = 1;
      } else if (under <= okRoom + 5) {
        status = "loose";
        amount = under;
        s = 2;
      } else {
        status = "loose";
        amount = under;
        s = 3;
      }
    }
    score = Math.max(score, s);
    deviation += Math.abs(b - mid);
    return { dim, body: b, min, max, status, amount, score: s };
  });

  return { dims, score, deviation, level: LEVELS[score] };
}

export interface Recommendation {
  size: Size;
  fit: FitResult;
}

export function recommend(catalog: Catalog, p: Product, body: Body): Recommendation {
  let best: Recommendation | null = null;
  for (const size of catalog.sizeChart.sizes) {
    const fit = fitFor(catalog, p, size, body);
    if (!best || fit.score < best.fit.score || (fit.score === best.fit.score && fit.deviation < best.fit.deviation)) {
      best = { size, fit };
    }
  }
  if (!best) throw new Error("Size chart has no sizes");
  return best;
}

/** Quick path: estimate all measurements from height, usual size and body shape. */
export function estimateBody(catalog: Catalog, q: QuickInput): Body {
  const base = catalog.sizeChart.chart[q.usual];
  const adj = catalog.shapes[q.shape].adjustCm;
  const bust = base.bust + adj.bust;
  return {
    height: q.height,
    bust,
    underbust: Math.round(bust - 15),
    waist: base.waist + adj.waist,
    hips: base.hips + adj.hips,
    inseam: Math.round(q.height * 0.46),
  };
}

/** Chance that at least one item of the look goes back (items treated as independent). */
export function lookReturnChance(catalog: Catalog, items: { product: Product; size: Size }[], body: Body): number {
  let keepAll = 1;
  for (const it of items) keepAll *= 1 - fitFor(catalog, it.product, it.size, body).level.returnChance;
  return 1 - keepAll;
}

/** Plain-English text for one body area. */
export function verdict(d: DimFit): string {
  const a = d.amount.toFixed(1);
  switch (d.status) {
    case "good":
      return "Fits well";
    case "snug":
      return "Snug, the stretch covers it";
    case "roomy":
      return `A little roomy (+${a} cm)`;
    case "tight":
      return `Too tight by ${a} cm`;
    case "loose":
      return `Too loose by ${a} cm`;
  }
}

/** Colour class for one body area. */
export function dimClass(d: DimFit): "ok" | "warn" | "risk" {
  return d.score >= 3 ? "risk" : d.score >= 1 ? "warn" : "ok";
}
