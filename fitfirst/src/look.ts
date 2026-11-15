/*
 * Look helpers: which product is in each slot and which size she would order.
 * Default size = the fit engine's recommendation; she can override it per product.
 */
import { recommend, type Body, type Category, type Product, type Size } from "./engine";
import { catalog } from "./data/catalog";
import type { Look } from "./state";

/** Products available in a slot; slots that allow "none" end with null. */
export function optionsFor(category: Category): (Product | null)[] {
  const list = catalog.products.filter((p) => p.category === category);
  const slot = catalog.slots.find((s) => s.category === category);
  return slot?.allowNone ? [...list, null] : list;
}

export interface LookItem {
  product: Product;
  size: Size;
}

export function itemIn(look: Look, category: Category, body: Body): LookItem | null {
  const product = optionsFor(category)[look.index[category]];
  if (!product) return null;
  return { product, size: look.sizeOverride[product.id] ?? recommend(catalog, product, body).size };
}

export function lookItems(look: Look, body: Body): LookItem[] {
  return catalog.slots.map((s) => itemIn(look, s.category, body)).filter((x): x is LookItem => x !== null);
}

/** Next / previous product in a slot (wraps around). */
export function moveIndex(look: Look, category: Category, dir: number): Look {
  const n = optionsFor(category).length;
  return { ...look, active: category, index: { ...look.index, [category]: (look.index[category] + dir + n) % n } };
}
