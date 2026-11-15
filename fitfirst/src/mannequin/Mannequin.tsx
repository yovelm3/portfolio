/*
 * The mannequin: body from the geometry, the chosen garments clipped to it,
 * and a marker line at every body area that is not a good fit (dashed = check, solid = likely return).
 */
import type { Body, Category, Product, Size } from "../engine";
import { fitFor } from "../engine";
import { catalog } from "../data/catalog";
import { geometry, type Geometry } from "./geometry";

import { DIM_LABEL } from "../config";
const HAIR = "#2B2320";
const BODY_LINE = "rgba(0,0,0,.18)";
/** Drawing order: bra under leggings under the top layer. */
const ORDER: Category[] = ["bra", "leggings", "layer"];

export interface WornItem {
  product: Product;
  size: Size;
}

interface Props {
  body: Body;
  skin: string;
  items: WornItem[];
  /** Slot that just changed and the swipe direction, to slide the garment in. */
  changed: { category: Category; dir: number } | null;
}

function Garment({ p, g }: { p: Product; g: Geometry }) {
  const { cx, u, H } = g;
  const W = 150;
  if (p.category === "bra") {
    return (
      <>
        <g clipPath="url(#cTorso)">
          <rect x={cx - W} y={g.yArm - 0.008 * H} width={2 * W} height={g.yUb - g.yArm + 0.02 * H} fill={p.color} />
          <line x1={cx - W} x2={cx + W} y1={g.yUb + 0.006 * H} y2={g.yUb + 0.006 * H} stroke="rgba(0,0,0,.18)" strokeWidth={2 * u} />
        </g>
        {[1, -1].map((s) => (
          <line key={s} x1={cx + s * g.bustW * 0.5} y1={g.yArm} x2={cx + s * g.shW * 0.62} y2={g.ySh + 1}
            stroke={p.color} strokeWidth={3.2 * u} strokeLinecap="round" />
        ))}
      </>
    );
  }
  if (p.category === "leggings") {
    const end = p.cut === "78" ? g.yAnkle - 0.035 * H : g.yAnkle;
    return (
      <>
        <g clipPath="url(#cLower)">
          <rect x={cx - W} y={g.yWaist - 0.012 * H} width={2 * W} height={end - g.yWaist + 0.012 * H} fill={p.color} />
          <line x1={cx - W} x2={cx + W} y1={g.yWaist + 0.008 * H} y2={g.yWaist + 0.008 * H} stroke="rgba(255,255,255,.22)" strokeWidth={1.5 * u} />
        </g>
        {p.cut === "flare" &&
          g.feet.map((f) => {
            const s = Math.sign(f.x - cx);
            return (
              <path key={s} fill={p.color}
                d={`M${f.x - s * g.hipW * 0.13},${g.yAnkle - 0.09 * H} L${f.x + s * g.hipW * 0.22},${g.yAnkle + 0.004 * H} L${f.x - s * g.hipW * 0.25},${g.yAnkle + 0.004 * H} Z`} />
            );
          })}
      </>
    );
  }
  // top layer: jacket / pullover / wrap cardigan
  const yBot = g.yWaist - 0.01 * H;
  const yV = p.style === "wrap" ? g.yUb : g.yNeck + 0.02 * H;
  const nw = p.style === "wrap" ? 3 * u : 7 * u;
  return (
    <>
      <g clipPath="url(#cTorso)">
        <path fill={p.color}
          d={`M${cx - W},${g.yNeck - 4} L${cx - nw},${g.yNeck - 4} L${cx},${yV} L${cx + nw},${g.yNeck - 4} L${cx + W},${g.yNeck - 4} L${cx + W},${yBot} L${cx - W},${yBot} Z`} />
        {p.style === "zip" && <line x1={cx} x2={cx} y1={yV} y2={yBot} stroke="rgba(0,0,0,.25)" strokeWidth={1.2 * u} />}
        <line x1={cx - W} x2={cx + W} y1={yBot - 0.006 * H} y2={yBot - 0.006 * H} stroke="rgba(0,0,0,.14)" strokeWidth={2 * u} />
      </g>
      <g clipPath="url(#cArms)">
        <rect x={0} y={g.ySh - 6} width={300} height={g.arms[0].yWrist - g.ySh - 0.01 * H} fill={p.color} />
      </g>
    </>
  );
}

export function Mannequin({ body, skin, items, changed }: Props) {
  const g = geometry(body);
  const { cx, H, u } = g;
  const worn = [...items].sort((a, b) => ORDER.indexOf(a.product.category) - ORDER.indexOf(b.product.category));

  // Fit markers, spread out vertically so labels never overlap.
  const dimY = { underbust: g.yUb, bust: g.yBust, waist: g.yWaist, hips: g.yHip };
  const dimW = { underbust: g.ubW, bust: g.bustW, waist: g.waistW, hips: g.hipW };
  const marks = worn
    .flatMap((it) => fitFor(catalog, it.product, it.size, body).dims)
    .filter((d) => d.status !== "good")
    .map((d) => {
      const cls = d.score >= 3 ? "risk" : "warn";
      return { y: dimY[d.dim], w: dimW[d.dim], cls, ly: 0, text: `${cls === "risk" ? "✕" : "!"} ${DIM_LABEL[d.dim]}: ${d.status}` };
    })
    .sort((a, b) => a.y - b.y);
  let last = -99;
  for (const mk of marks) last = mk.ly = Math.max(mk.y, last + 15);

  return (
    <svg viewBox="0 0 300 430" role="img" aria-label="Mannequin with your shape, wearing the selected look">
      <defs>
        <clipPath id="cTorso"><path d={g.torso} /></clipPath>
        <clipPath id="cLower"><path d={g.torso} />{g.legs.map((d, i) => <path key={i} d={d} />)}</clipPath>
        <clipPath id="cArms">{g.arms.map((a, i) => <path key={i} d={a.d} />)}</clipPath>
      </defs>
      <ellipse cx={cx} cy={g.yAnkle + 0.035 * H} rx={g.hipW * 1.4} ry={5 * u} style={{ fill: "var(--line)" }} />
      <g fill={skin} stroke={BODY_LINE} strokeWidth={0.8}>
        {g.arms.map((a, i) => (
          <g key={i}><path d={a.d} /><ellipse cx={a.hand.x} cy={a.hand.y} rx={3.6 * u} ry={6 * u} /></g>
        ))}
        {g.legs.map((d, i) => <path key={i} d={d} />)}
        {g.feet.map((f, i) => <ellipse key={i} cx={f.x} cy={f.y} rx={f.rx} ry={f.ry} />)}
        <rect x={cx - g.neckW} y={g.head.y + g.head.ry * 0.6} width={2 * g.neckW} height={g.yNeck - g.head.y - g.head.ry * 0.6 + 3} stroke="none" />
        <path d={g.torso} />
        <ellipse cx={g.head.x} cy={g.head.y} rx={g.head.rx} ry={g.head.ry} />
      </g>
      <ellipse cx={cx} cy={g.head.y - g.head.ry * 0.35} rx={g.head.rx * 1.06} ry={g.head.ry * 0.7} fill={HAIR} />
      <circle cx={cx} cy={g.head.y - g.head.ry * 1.05} r={g.head.rx * 0.5} fill={HAIR} />
      {worn.map((it) => {
        const isNew = changed?.category === it.product.category;
        return (
          // key includes the product id, so a new garment remounts and the slide-in animation runs
          <g key={it.product.id} className={isNew ? "garment new" : "garment"}
            style={{ "--from": `${(changed?.dir ?? 1) * 24}px` } as React.CSSProperties}>
            <Garment p={it.product} g={g} />
          </g>
        );
      })}
      {marks.map((mk, i) => (
        <g key={i} style={{ stroke: `var(--${mk.cls})` }}>
          <line x1={cx - mk.w - 3} x2={cx + mk.w + 3} y1={mk.y} y2={mk.y} strokeWidth={2.5} strokeDasharray={mk.cls === "warn" ? "4 3" : undefined} />
          <polyline points={`${cx + mk.w + 3},${mk.y} 206,${mk.ly}`} fill="none" strokeWidth={1} />
          <text x={209} y={mk.ly + 4} fontSize={11} fontWeight={600} stroke="none" style={{ fill: `var(--${mk.cls})` }}>{mk.text}</text>
        </g>
      ))}
    </svg>
  );
}
