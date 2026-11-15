/*
 * Price engine tests.
 * 1. Parity: all 36 possible looks must give the same totals and store split as the prototype.
 * 2. Readable examples for the shipping rules.
 */
import { describe, expect, it } from "vitest";
import golden from "./__fixtures__/prototype-golden.json";
import { catalog } from "../data/catalog";
import { bestPlan, brandStorePlan, costOf } from "./price";
import type { Product, Retailer } from "./types";

const byId = (id: string) => catalog.products.find((p) => p.id === id) as Product;

describe("parity with prototype v0.2", () => {
  it.each(golden.looks.map((l) => [l.ids.join("+"), l] as const))("look %s", (_k, look) => {
    const prods = look.ids.map(byId);
    const best = bestPlan(catalog.retailers, prods);
    expect(best.totalUsd).toBe(look.best);
    expect(brandStorePlan(catalog.retailers, prods).totalUsd).toBe(look.brandStores);
    const stores = Object.fromEntries(Object.entries(best.groups).map(([k, g]) => [k, g.items.map((i) => i.product.id)]));
    expect(stores).toEqual(look.stores);
  });
});

describe("shipping rules", () => {
  const retailers: Record<string, Retailer> = {
    a: { name: "A", shippingUsd: 6, freeOverUsd: 75 },
    b: { name: "B", shippingUsd: 5, freeOverUsd: 60 },
  };
  const p = (id: string, offers: [string, number][]): Product => ({
    id, category: "bra", brand: "x", name: id, color: "#000", stretchCm: 0,
    reviews: { runsSmallPct: 0, trueToSizePct: 100, runsLargePct: 0, count: 1 },
    offers: offers.map(([retailer, priceUsd]) => ({ retailer, priceUsd })),
  });

  it("charges shipping once per store below the threshold", () => {
    const x = p("x", [["a", 30]]), y = p("y", [["a", 30]]);
    const plan = costOf(retailers, [{ product: x, offer: x.offers[0] }, { product: y, offer: y.offers[0] }]);
    expect(plan.totalUsd).toBe(66);
  });

  it("free shipping once the store subtotal reaches the threshold", () => {
    const x = p("x", [["a", 40]]), y = p("y", [["a", 35]]);
    expect(costOf(retailers, [{ product: x, offer: x.offers[0] }, { product: y, offer: y.offers[0] }]).totalUsd).toBe(75);
  });

  it("can pay a bit more per item to group in one store and skip shipping", () => {
    // Split: 38+5 (b) + 36+6 (a) = 85. Together at a: 40+36 = 76, free shipping.
    const x = p("x", [["a", 40], ["b", 38]]), y = p("y", [["a", 36]]);
    const best = bestPlan(retailers, [x, y]);
    expect(best.totalUsd).toBe(76);
    expect(Object.keys(best.groups)).toEqual(["a"]);
  });

  it("an empty look costs nothing", () => {
    expect(bestPlan(retailers, []).totalUsd).toBe(0);
  });
});
