/*
 * App state.
 * PRIVACY: body details are saved ONLY in this browser's localStorage. Nothing is sent to a server.
 * The storage key is the same as the prototype's, so a returning visitor keeps her details.
 */
import type { Body, Category, QuickInput, Size } from "./engine";

export type View = "start" | "quick" | "precise" | "wardrobe";
export type Mode = "quick" | "precise";

/** The part that is remembered on this device. */
export interface Saved {
  mode: Mode;
  quick: QuickInput;
  /** Tape measurements of the Precise path (null until entered). */
  measured: Body | null;
  skin: number;
}

const KEY = "fitfirst2";

export const DEFAULT_SAVED: Saved = {
  mode: "quick",
  quick: { height: 165, usual: "M", shape: "pear" },
  measured: null,
  skin: 1,
};

/** Reads saved details; returns null if this browser has not been here (or storage is blocked). */
export function loadSaved(): Saved | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    return {
      mode: s.mode === "precise" ? "precise" : "quick",
      quick: s.quick ?? DEFAULT_SAVED.quick,
      measured: s.measured ?? s.m ?? null, // "m" = prototype's name for it
      skin: typeof s.skin === "number" ? s.skin : DEFAULT_SAVED.skin,
    };
  } catch {
    return null;
  }
}

export function save(s: Saved): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    // private window / storage blocked: the app still works, it just won't remember
  }
}

/** Which product is shown in each slot (index into the slot's options), and manual size picks. */
export interface Look {
  index: Record<Category, number>;
  sizeOverride: Record<string, Size>;
  /** Slot whose fit details are shown. */
  active: Category;
}

export const DEFAULT_LOOK: Look = {
  index: { layer: 2, bra: 1, leggings: 0 },
  sizeOverride: {},
  active: "leggings",
};
