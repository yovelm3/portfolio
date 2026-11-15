/* Look helpers: slot options, wrap-around swiping and manual size picks. */
import { describe, expect, it } from "vitest";
import { estimateBody } from "./engine";
import { catalog } from "./data/catalog";
import { itemIn, lookItems, moveIndex, optionsFor } from "./look";
import { DEFAULT_LOOK } from "./state";

const body = estimateBody(catalog, { height: 165, usual: "M", shape: "pear" });

describe("look", () => {
  it("the top layer slot can be empty, the others cannot", () => {
    expect(optionsFor("layer").at(-1)).toBeNull();
    expect(optionsFor("bra")).not.toContain(null);
  });

  it("swiping wraps around", () => {
    const n = optionsFor("bra").length;
    let look = DEFAULT_LOOK;
    for (let i = 0; i < n; i++) look = moveIndex(look, "bra", 1);
    expect(look.index.bra).toBe(DEFAULT_LOOK.index.bra);
    expect(moveIndex({ ...DEFAULT_LOOK, index: { ...DEFAULT_LOOK.index, bra: 0 } }, "bra", -1).index.bra).toBe(n - 1);
  });

  it("an empty top layer leaves two items in the look", () => {
    const look = { ...DEFAULT_LOOK, index: { ...DEFAULT_LOOK.index, layer: optionsFor("layer").length - 1 } };
    expect(itemIn(look, "layer", body)).toBeNull();
    expect(lookItems(look, body)).toHaveLength(2);
  });

  it("a manual size pick overrides the recommendation", () => {
    const it0 = itemIn(DEFAULT_LOOK, "bra", body)!;
    const look = { ...DEFAULT_LOOK, sizeOverride: { [it0.product.id]: "XS" } };
    expect(itemIn(look, "bra", body)!.size).toBe("XS");
  });
});
