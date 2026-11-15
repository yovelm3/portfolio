/*
 * Fit engine tests.
 * 1. Parity: for 135 bodies × 9 products × 5 sizes, the new engine must match the prototype exactly.
 * 2. Readable examples that document the rules.
 */
import { describe, expect, it } from "vitest";
import golden from "./__fixtures__/prototype-golden.json";
import { catalog } from "../data/catalog";
import { estimateBody, fitFor, lookReturnChance, recommend, reviewBias, verdict } from "./fit";
import type { Body, Product } from "./types";

const product = (id: string): Product => {
  const p = catalog.products.find((x) => x.id === id);
  if (!p) throw new Error(id);
  return p;
};

describe("parity with prototype v0.2", () => {
  it.each(golden.fit.map((g, i) => [i, g] as const))("body #%i", (_i, g) => {
    if (g.quick) expect(estimateBody(catalog, g.quick)).toEqual(g.body);
    for (const [id, exp] of Object.entries(g.products)) {
      const p = product(id);
      expect(recommend(catalog, p, g.body as Body).size, `${id} recommended`).toBe(exp.recommended);
      for (const size of catalog.sizeChart.sizes) {
        const f = fitFor(catalog, p, size, g.body as Body);
        expect(f.score, `${id} ${size} score`).toBe((exp.scores as Record<string, number>)[size]);
        expect(f.dims.map((d) => d.status), `${id} ${size} statuses`).toEqual((exp.statuses as Record<string, string[]>)[size]);
      }
    }
  });
});

describe("fit rules", () => {
  const body: Body = { height: 165, bust: 90, underbust: 75, waist: 72, hips: 97, inseam: 76 };

  it("reviews that say 'runs small' make the garment act smaller", () => {
    expect(reviewBias(product("b1"))).toBeCloseTo(((58 - 6) / 100) * 3); // mostly runs small → positive
    expect(reviewBias(product("b3"))).toBeLessThan(0); // mostly runs large
  });

  it("a brand that runs small needs a bigger size than a true-to-size brand", () => {
    const north = recommend(catalog, product("l1"), body).size; // Northline, runs small
    const kora = recommend(catalog, product("l2"), body).size; // Kora, true to size
    const order = catalog.sizeChart.sizes;
    expect(order.indexOf(north)).toBeGreaterThan(order.indexOf(kora));
  });

  it("stretch absorbs a little tightness (snug), beyond it is tight", () => {
    const f = fitFor(catalog, product("l2"), "S", { ...body, hips: 92 + 2.5 + 3 }); // 3 cm over, stretch 4
    expect(f.dims.find((d) => d.dim === "hips")?.status).toBe("snug");
    const g = fitFor(catalog, product("l2"), "S", { ...body, hips: 92 + 2.5 + 6 }); // 6 cm over
    const hips = g.dims.find((d) => d.dim === "hips")!;
    expect(hips.status).toBe("tight");
    expect(verdict(hips)).toMatch(/^Too tight by/);
    expect(g.level.name).toBe("Likely return");
  });

  it("relaxed fits tolerate more room", () => {
    const loose: Body = { ...body, bust: 85 - 2.5 - 5, waist: 67 - 2.5 - 5 }; // 5 cm under size S band
    const relaxed = product("t2"); // Kora, offset 0, relaxed
    const fitted = { ...relaxed, relaxed: false };
    expect(fitFor(catalog, relaxed, "S", loose).score).toBeLessThan(fitFor(catalog, fitted, "S", loose).score);
  });

  it("return chance of a look combines the items", () => {
    const items = ["b2", "l2"].map((id) => ({ product: product(id), size: recommend(catalog, product(id), body).size }));
    const r = lookReturnChance(catalog, items, body);
    expect(r).toBeGreaterThan(0);
    expect(r).toBeLessThan(1);
    expect(lookReturnChance(catalog, [], body)).toBe(0);
  });
});
