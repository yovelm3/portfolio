/* UI constants (not product data). */

/** Mannequin skin tones. */
export const SKINS = ["#F1D3BF", "#E0B48F", "#C68C5E", "#8D5A3B", "#5B3A29"];

export const HEIGHT_MIN = 140;
export const HEIGHT_MAX = 200;

/** The 6 tape measurements of the Precise path, with a how-to for each. */
export const MEASURE_FIELDS = [
  { key: "height", label: "Height", min: 140, max: 200, how: "Stand against a wall without shoes." },
  { key: "bust", label: "Bust", min: 70, max: 130, how: "Around the fullest part of your chest." },
  { key: "underbust", label: "Under-bust", min: 60, max: 110, how: "Around your ribcage, just under the bust." },
  { key: "waist", label: "Waist", min: 50, max: 120, how: "Around the narrowest part, above the belly button." },
  { key: "hips", label: "Hips", min: 75, max: 140, how: "Around the fullest part of your hips and seat." },
  { key: "inseam", label: "Inside leg", min: 60, max: 95, how: "From the top of your inner thigh to the floor." },
] as const;

export const DIM_LABEL = { underbust: "Under-bust", bust: "Bust", waist: "Waist", hips: "Hips" } as const;
