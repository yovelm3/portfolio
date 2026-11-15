/*
 * PRICE ENGINE (moved from prototype v0.2, same behaviour).
 *
 * Tries every combination of stores for the look and keeps the lowest final total.
 * Shipping is charged once per store, unless that store's subtotal reaches its free-shipping threshold.
 * Wording rule: the UI says "best final deal we found", never "lowest price guaranteed".
 */
import type { Offer, Product, Retailer } from "./types";

export interface PlanItem {
  product: Product;
  priceUsd: number;
}

export interface StoreGroup {
  items: PlanItem[];
  subtotalUsd: number;
  shippingUsd: number;
}

export interface Plan {
  totalUsd: number;
  /** Keyed by retailer id, in the order stores were first used. */
  groups: Record<string, StoreGroup>;
}

export interface Choice {
  product: Product;
  offer: Offer;
}

export function costOf(retailers: Record<string, Retailer>, choice: Choice[]): Plan {
  const groups: Record<string, StoreGroup> = {};
  for (const { product, offer } of choice) {
    const g = (groups[offer.retailer] ??= { items: [], subtotalUsd: 0, shippingUsd: 0 });
    g.items.push({ product, priceUsd: offer.priceUsd });
    g.subtotalUsd += offer.priceUsd;
  }
  let totalUsd = 0;
  for (const [id, g] of Object.entries(groups)) {
    const r = retailers[id];
    if (!r) throw new Error(`Unknown retailer ${id}`);
    g.shippingUsd = g.subtotalUsd >= r.freeOverUsd ? 0 : r.shippingUsd;
    totalUsd += g.subtotalUsd + g.shippingUsd;
  }
  return { totalUsd, groups };
}

/**
 * Cheapest combination of offers. Exhaustive search: fine for a look of 2–4 items
 * (a few dozen combinations). Ties keep the first combination found.
 */
export function bestPlan(retailers: Record<string, Retailer>, products: Product[]): Plan {
  let best: Plan | null = null;
  const walk = (i: number, acc: Choice[]) => {
    if (i === products.length) {
      const c = costOf(retailers, acc);
      if (!best || c.totalUsd < best.totalUsd) best = c;
      return;
    }
    for (const offer of products[i].offers) walk(i + 1, [...acc, { product: products[i], offer }]);
  };
  walk(0, []);
  return best ?? { totalUsd: 0, groups: {} };
}

/** Baseline for "You save": buy each item at its brand's own store. */
export function brandStorePlan(retailers: Record<string, Retailer>, products: Product[]): Plan {
  const choice = products.map((product) => {
    const offer = product.offers.find((o) => retailers[o.retailer]?.brandStore === product.brand);
    if (!offer) throw new Error(`No brand-store offer for ${product.id}`);
    return { product, offer };
  });
  return costOf(retailers, choice);
}
