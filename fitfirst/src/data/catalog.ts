/*
 * Builds the Catalog the engines use from the JSON files in /data.
 * Phase A: demo data only. Phase B swaps these imports for real, sourced data
 * (each record with its source URL and date checked) and validates it with a schema.
 */
import sizeChart from "../../data/demo/size-chart.json";
import brands from "../../data/demo/brands.json";
import shapes from "../../data/demo/body-shapes.json";
import retailers from "../../data/demo/retailers.json";
import products from "../../data/demo/products.json";
import type { Catalog, Product, Slot } from "../engine";

/** One swipe row per slot, top to bottom as on the mannequin. */
export const SLOTS: Slot[] = [
  { category: "layer", label: "Top layer", dims: ["bust", "waist"], allowNone: true },
  { category: "bra", label: "Sports bra", dims: ["underbust", "bust"] },
  { category: "leggings", label: "Bottoms", dims: ["waist", "hips"] },
];

export const catalog: Catalog = {
  sizeChart,
  brands: brands.brands,
  shapes: shapes.shapes,
  retailers: retailers.retailers,
  products: products.products as Product[],
  slots: SLOTS,
  demo: [sizeChart, brands, shapes, retailers, products].some((f) => f.demo),
};
