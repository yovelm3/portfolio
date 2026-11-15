/* Data integrity: every reference in the demo data points to something that exists. */
import { describe, expect, it } from "vitest";
import { catalog } from "./catalog";

describe("demo catalog", () => {
  it("is labelled as demo", () => expect(catalog.demo).toBe(true));

  it.each(catalog.products.map((p) => [p.id, p] as const))("product %s references valid data", (_id, p) => {
    expect(catalog.brands[p.brand]).toBeDefined();
    expect(catalog.slots.some((s) => s.category === p.category)).toBe(true);
    expect(p.offers.length).toBeGreaterThan(0);
    for (const o of p.offers) expect(catalog.retailers[o.retailer], o.retailer).toBeDefined();
    expect(p.offers.some((o) => catalog.retailers[o.retailer].brandStore === p.brand)).toBe(true);
    const r = p.reviews;
    expect(r.runsSmallPct + r.trueToSizePct + r.runsLargePct).toBe(100);
  });

  it("every size has every body area in the chart", () => {
    for (const s of catalog.sizeChart.sizes)
      for (const d of ["underbust", "bust", "waist", "hips"] as const) expect(catalog.sizeChart.chart[s][d]).toBeTypeOf("number");
  });
});
