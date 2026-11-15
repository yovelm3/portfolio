/*
 * Shared types for the fit engine and the price engine.
 * The engines only see these shapes, so demo data (Phase A) can later be
 * replaced by real size charts and affiliate feeds (Phase B/C) without touching engine code.
 */

export type Size = string; // e.g. "XS" … "XL"
export type Dim = "underbust" | "bust" | "waist" | "hips";
export type Category = "layer" | "bra" | "leggings";

/** Body measurements in cm. Stays on the device. */
export interface Body {
  height: number;
  bust: number;
  underbust: number;
  waist: number;
  hips: number;
  inseam: number;
}

/** Inputs of the Quick path. */
export interface QuickInput {
  height: number;
  usual: Size;
  shape: string; // key of BodyShapes
}

export interface SizeChart {
  sizes: Size[];
  /** Half-width of the "fits" band around each mid-point, in cm. */
  toleranceCm: number;
  /** Garment mid-point per size and body area, in cm. */
  chart: Record<Size, Record<Dim, number>>;
}

export interface Brand {
  name: string;
  /** Shift of this brand's chart vs. the base chart. Negative = runs small. */
  offsetCm: number;
  note: string;
}

export interface BodyShape {
  name: string;
  description: string;
  adjustCm: { bust: number; waist: number; hips: number };
}

export interface Reviews {
  runsSmallPct: number;
  trueToSizePct: number;
  runsLargePct: number;
  count: number;
}

export interface Offer {
  retailer: string;
  priceUsd: number;
}

export interface Product {
  id: string;
  category: Category;
  brand: string;
  name: string;
  color: string;
  /** How many cm the fabric can stretch past the chart. */
  stretchCm: number;
  /** Relaxed-fit items tolerate more looseness. */
  relaxed?: boolean;
  cut?: "78" | "full" | "flare";
  style?: "zip" | "wrap";
  reviews: Reviews;
  offers: Offer[];
}

export interface Retailer {
  name: string;
  shippingUsd: number;
  freeOverUsd: number;
  /** Brand id when this is the brand's own store. */
  brandStore?: string;
}

export interface Slot {
  category: Category;
  label: string;
  /** Body areas that decide the fit for this kind of garment. */
  dims: Dim[];
  /** The slot can be empty (e.g. no top layer). */
  allowNone?: boolean;
}

/** Everything the engines need, in one object. */
export interface Catalog {
  sizeChart: SizeChart;
  brands: Record<string, Brand>;
  shapes: Record<string, BodyShape>;
  retailers: Record<string, Retailer>;
  products: Product[];
  slots: Slot[];
  /** True while any of the data is invented. Shown in the UI. */
  demo: boolean;
}
