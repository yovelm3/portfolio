/*
 * Records what the ORIGINAL prototype engine answers for many bodies and looks,
 * and saves it as src/engine/__fixtures__/prototype-golden.json.
 * The Vitest suite then checks the new TypeScript engine gives exactly the same answers.
 * Run once (already done): node scripts/make-golden.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import vm from "node:vm";

const html = readFileSync(new URL("../prototype/index.html", import.meta.url), "utf8");
const js = html.split("<script>")[1].split("/* ===================== MANNEQUIN")[0];
const ctx = {};
vm.createContext(ctx);
vm.runInContext(js + "\nthis.api={SIZES,SHAPES,PRODUCTS,SLOTS,fitFor,recommend,estimate,costOf,bestPlan,brandStorePlan};", ctx);
const { SIZES, SHAPES, PRODUCTS, SLOTS, fitFor, recommend, estimate, bestPlan, brandStorePlan } = ctx.api;

// Deterministic pseudo-random bodies so the fixture is stable.
let seed = 42;
const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2 ** 31) / 2 ** 31);
const r = (a, b) => Math.round((a + rnd() * (b - a)) * 2) / 2;

const bodies = [];
for (const height of [150, 165, 182]) for (const usual of SIZES) for (const shape of Object.keys(SHAPES))
  bodies.push({ quick: { height, usual, shape }, body: estimate({ height, usual, shape }) });
for (let i = 0; i < 60; i++)
  bodies.push({ body: { height: r(145, 195), bust: r(74, 120), underbust: r(62, 100), waist: r(55, 110), hips: r(80, 130), inseam: r(65, 90) } });

const fit = bodies.map(({ quick, body }) => ({
  quick, body,
  products: Object.fromEntries(PRODUCTS.map((p) => [p.id, {
    recommended: recommend(p, body).size,
    scores: Object.fromEntries(SIZES.map((s) => [s, fitFor(p, s, body).score])),
    statuses: Object.fromEntries(SIZES.map((s) => [s, fitFor(p, s, body).dims.map((d) => d.status)])),
  }])),
}));

const byCat = (c) => PRODUCTS.filter((p) => p.cat === c);
const looks = [];
for (const layer of [...byCat("layer"), null]) for (const bra of byCat("bra")) for (const leg of byCat("leggings")) {
  const prods = [layer, bra, leg].filter(Boolean);
  const best = bestPlan(prods), base = brandStorePlan(prods);
  looks.push({
    ids: prods.map((p) => p.id), best: best.total, brandStores: base.total,
    stores: Object.fromEntries(Object.entries(best.groups).map(([k, g]) => [k, g.items.map((i) => i.p.id)])),
  });
}

mkdirSync(new URL("../src/engine/__fixtures__/", import.meta.url), { recursive: true });
writeFileSync(new URL("../src/engine/__fixtures__/prototype-golden.json", import.meta.url),
  JSON.stringify({ generatedFrom: "prototype/index.html v0.2", fit, looks }));
console.log(`bodies: ${fit.length}, looks: ${looks.length}`);
