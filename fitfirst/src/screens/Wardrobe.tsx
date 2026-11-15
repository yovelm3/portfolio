/*
 * SCREEN 3: Wardrobe.
 * Left: the mannequin (hero) with one swipe row per slot under it.
 * Right: look summary (price, savings, return chance), fit details for the active item, and where to buy.
 */
import { useRef } from "react";
import {
  bestPlan, brandStorePlan, dimClass, fitFor, lookReturnChance, recommend, verdict,
  type Body, type Category,
} from "../engine";
import { catalog } from "../data/catalog";
import { DIM_LABEL, SKINS } from "../config";
import { itemIn, lookItems, moveIndex, optionsFor, type LookItem } from "../look";
import type { Look, Mode } from "../state";
import { Mannequin } from "../mannequin/Mannequin";
import { Meter } from "../components/Meter";

interface Props {
  body: Body;
  mode: Mode;
  usual: string;
  skin: number;
  look: Look;
  changed: { category: Category; dir: number } | null;
  setLook: (l: Look, changed?: { category: Category; dir: number }) => void;
  setSkin: (i: number) => void;
  onEdit: () => void;
  onPrecise: () => void;
  say: (text: string) => void;
}

const riskClass = (r: number) => (r < 0.2 ? "ok" : r < 0.4 ? "warn" : "risk");
const brandName = (id: string) => catalog.brands[id].name;

export function Wardrobe(props: Props) {
  const { body, mode, usual, skin, look, changed, setLook, setSkin, onEdit, onPrecise, say } = props;
  const items = lookItems(look, body);

  const move = (category: Category, dir: number) => {
    const next = moveIndex(look, category, dir);
    setLook(next, { category, dir });
    const it = itemIn(next, category, body);
    say(it ? `${it.product.name}, ${brandName(it.product.brand)}, size ${it.size}, ${fitFor(catalog, it.product, it.size, body).level.name}` : "No top layer");
  };

  // Swipe: on a slot row it changes that slot; on the mannequin it changes the active slot.
  const start = useRef<{ x: number; y: number; category: Category } | null>(null);
  const swiped = useRef(false);
  const swipeHandlers = (category: Category | null) => ({
    onPointerDown: (e: React.PointerEvent) => { start.current = { x: e.clientX, y: e.clientY, category: category ?? look.active }; },
    onPointerUp: (e: React.PointerEvent) => {
      const s = start.current;
      start.current = null;
      if (!s) return;
      const dx = e.clientX - s.x, dy = e.clientY - s.y;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.3) {
        move(s.category, dx < 0 ? 1 : -1);
        swiped.current = true; // swallow the click that follows a swipe
        setTimeout(() => (swiped.current = false), 350);
      }
    },
    onPointerCancel: () => { start.current = null; },
  });
  const click = (fn: () => void) => () => { if (!swiped.current) fn(); };

  return (
    <section className="view" aria-labelledby="wardh">
      <h2 id="wardh" className="sr" tabIndex={-1}>Your wardrobe</h2>
      <div className="wardrobe">
        <div className="stage">
          <div className="mannequin" {...swipeHandlers(null)}>
            <Mannequin body={body} skin={SKINS[skin]} items={items} changed={changed} />
          </div>
          <p className="hint">Swipe a row, or use the arrows, to change what she's wearing.</p>
          <div className="slots">
            {catalog.slots.map((slot) => (
              <SlotRow key={slot.category} category={slot.category} label={slot.label} look={look} body={body}
                onMove={(d) => click(() => move(slot.category, d))()}
                onFocus={click(() => {
                  setLook({ ...look, active: slot.category });
                  document.getElementById("fitcard")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
                })}
                swipe={swipeHandlers(slot.category)} />
            ))}
          </div>
          <div className="skins" role="group" aria-label="Mannequin skin tone">
            {SKINS.map((c, i) => (
              <button key={c} type="button" className="sw" style={{ background: c }} aria-label={`Skin tone ${i + 1}`}
                aria-pressed={i === skin} onClick={() => setSkin(i)} />
            ))}
          </div>
        </div>

        <div className="side">
          <Summary items={items} body={body} mode={mode} usual={usual} onPrecise={onPrecise} />
          <FitCard look={look} body={body} mode={mode} usual={usual}
            onSize={(size) => {
              const it = itemIn(look, look.active, body);
              if (!it) return;
              setLook({ ...look, sizeOverride: { ...look.sizeOverride, [it.product.id]: size } });
              say(`Size ${size}: ${fitFor(catalog, it.product, size, body).level.name}`);
            }} />
          <PlanCard items={items} />
          <div className="row"><button type="button" className="btn" onClick={onEdit}>Edit my body details</button></div>
        </div>
      </div>
    </section>
  );
}

function SlotRow({ category, label, look, body, onMove, onFocus, swipe }: {
  category: Category; label: string; look: Look; body: Body;
  onMove: (dir: number) => void; onFocus: () => void; swipe: React.HTMLAttributes<HTMLDivElement>;
}) {
  const opts = optionsFor(category);
  const it = itemIn(look, category, body);
  const f = it && fitFor(catalog, it.product, it.size, body);
  const lower = label.toLowerCase();
  return (
    <div className={`slot${look.active === category ? " active" : ""}`} {...swipe}>
      <button type="button" className="arrow" aria-label={`Previous ${lower}`} onClick={() => onMove(-1)}>‹</button>
      <button type="button" className="mid" onClick={onFocus}
        aria-label={`${label}: ${it && f ? `${it.product.name}, size ${it.size}, ${f.level.name}` : "none"}. Show fit details`}>
        <span className="cat">{label}</span>
        {it && f ? (
          <>
            <span className="nm">{it.product.name}</span>
            <span className="meta">
              <span className="muted">{brandName(it.product.brand)}</span>
              <span className={`badge ${f.level.cls}`}>{f.level.sym} Size {it.size}</span>
            </span>
          </>
        ) : (
          <>
            <span className="nm muted">Nothing on top</span>
            <span className="meta muted">Swipe to add a layer</span>
          </>
        )}
        <span className="pips" aria-hidden="true">
          {opts.map((_, i) => <i key={i} className={i === look.index[category] ? "on" : undefined} />)}
        </span>
      </button>
      <button type="button" className="arrow" aria-label={`Next ${lower}`} onClick={() => onMove(1)}>›</button>
    </div>
  );
}

function Summary({ items, body, mode, usual, onPrecise }: { items: LookItem[]; body: Body; mode: Mode; usual: string; onPrecise: () => void }) {
  const prods = items.map((i) => i.product);
  const best = bestPlan(catalog.retailers, prods);
  const base = brandStorePlan(catalog.retailers, prods);
  const rNow = lookReturnChance(catalog, items, body);
  const rUsual = lookReturnChance(catalog, items.map((i) => ({ ...i, size: usual })), body);
  return (
    <section className="card highlight" aria-labelledby="sumh">
      <h3 id="sumh">Your look</h3>
      <div className="tiles">
        <div className="tile"><span className="k">Best final price</span><span className="v">${best.totalUsd}</span>
          <span className="s">{prods.length} items, shipping included</span></div>
        <div className="tile"><span className="k">You save</span><span className="v ok">${base.totalUsd - best.totalUsd}</span>
          <span className="s">vs ${base.totalUsd} at the brands' own stores</span></div>
        <div className="tile"><span className="k">Chance of a return</span>
          <span className={`v ${riskClass(rNow)}`}>{Math.round(rNow * 100)}%</span>
          <span className="s">Ordering your usual {usual}: {Math.round(rUsual * 100)}%</span></div>
      </div>
      <div className="acc">
        {mode === "precise" ? (
          <Meter precise label="Fit accuracy: precise, from your measurements" />
        ) : (
          <>
            <Meter precise={false} label="Fit accuracy: good estimate" />
            <button type="button" className="btn" onClick={onPrecise}>Add measurements for a precise fit</button>
          </>
        )}
      </div>
    </section>
  );
}

function FitCard({ look, body, mode, usual, onSize }: { look: Look; body: Body; mode: Mode; usual: string; onSize: (s: string) => void }) {
  const slot = catalog.slots.find((s) => s.category === look.active)!;
  const it = itemIn(look, look.active, body);
  if (!it) {
    return (
      <section className="card" aria-labelledby="fith" id="fitcard">
        <h3 id="fith">{slot.label}</h3>
        <p className="muted">No layer on top. Use the arrows on the "Top layer" row to try one.</p>
      </section>
    );
  }
  const p = it.product, brand = catalog.brands[p.brand], R = p.reviews;
  const f = fitFor(catalog, p, it.size, body);
  const rec = recommend(catalog, p, body);
  const uf = fitFor(catalog, p, usual, body);

  // One clear message: wrong manual pick → your usual size would go back → or all good.
  let alert;
  if (it.size !== rec.size && f.score > rec.fit.score) {
    alert = <div className={`alert ${f.level.cls}`}><b>{f.level.sym} {f.level.name} in {it.size}</b><span>We recommend {rec.size} in this item.</span></div>;
  } else if (uf.score >= 2 && rec.size !== usual) {
    const why = uf.dims.filter((x) => x.status !== "good").map((x) => `${DIM_LABEL[x.dim].toLowerCase()} ${verdict(x).toLowerCase()}`).join(", ");
    alert = (
      <div className="alert risk"><b>✕ Your usual {usual} would likely go back</b>
        <span>In {brand.name} it would be: {why}. Order <b>{rec.size}</b> instead.</span></div>
    );
  } else {
    alert = <div className="alert ok"><b>✓ {f.level.name} in {it.size}</b><span>{brand.name} {brand.note.toLowerCase()}.</span></div>;
  }
  const stretch = p.stretchCm >= 4 ? "very stretchy" : p.stretchCm >= 2 ? "some stretch" : "little stretch";

  return (
    <section className="card" aria-labelledby="fith" id="fitcard">
      <div>
        <h3 id="fith">{p.name}</h3>
        <span className="muted small">{slot.label} · {brand.name} · {stretch}{p.relaxed ? " · relaxed fit" : ""}</span>
      </div>
      {alert}
      <div>
        <p className="small muted" style={{ marginBottom: 6 }}>Pick a size to see how it fits</p>
        <div className="sizes" role="group" aria-label="Size">
          {catalog.sizeChart.sizes.map((s) => {
            const lv = fitFor(catalog, p, s, body).level;
            return (
              <button key={s} type="button" className="sizebtn" aria-pressed={s === it.size} aria-label={`Size ${s}, ${lv.name}`} onClick={() => onSize(s)}>
                {s}<span className={`sym ${lv.cls}`} aria-hidden="true">{lv.sym}</span>
              </button>
            );
          })}
        </div>
      </div>
      <details>
        <summary>Why this size?</summary>
        <div className="tablewrap">
          <table>
            <thead><tr><th>Area</th><th>You</th><th>{it.size} in this item</th><th>Fit</th></tr></thead>
            <tbody>
              {f.dims.map((x) => (
                <tr key={x.dim}>
                  <td>{DIM_LABEL[x.dim]}</td><td>{x.body} cm</td><td>{x.min.toFixed(0)}–{x.max.toFixed(0)} cm</td>
                  <td><span className={`badge ${dimClass(x)}`}>{verdict(x)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="small" style={{ marginTop: 10 }}>
          <b>{R.count.toLocaleString("en-US")} buyers say:</b>{" "}
          <span className="muted">runs small {R.runsSmallPct}% · true to size {R.trueToSizePct}% · runs large {R.runsLargePct}%</span>
        </p>
        <div className="reviews" aria-hidden="true" style={{ marginTop: 6 }}>
          <i style={{ width: `${R.runsSmallPct}%`, background: "var(--risk)" }} />
          <i style={{ width: `${R.trueToSizePct}%`, background: "var(--ok)" }} />
          <i style={{ width: `${R.runsLargePct}%`, background: "var(--warn)" }} />
        </div>
        <p className="small muted" style={{ marginTop: 8 }}>
          The range includes the brand's sizing and what buyers report. The fabric can stretch about {p.stretchCm} cm past it.
          {mode !== "precise" && " Your numbers are estimated from your usual size and shape."}
        </p>
      </details>
    </section>
  );
}

function PlanCard({ items }: { items: LookItem[] }) {
  const best = bestPlan(catalog.retailers, items.map((i) => i.product));
  return (
    <section className="card" aria-labelledby="planh">
      <h3 id="planh">Where to buy it for less</h3>
      <div className="plan">
        {Object.entries(best.groups).map(([id, g]) => {
          const r = catalog.retailers[id];
          return (
            <div className="plan-group" key={id}>
              <div className="row between"><b>{r.name}</b><span className="price">${g.subtotalUsd + g.shippingUsd}</span></div>
              {g.items.map((x) => (
                <div className="row between small" key={x.product.id}>
                  <span>{x.product.name} · size {items.find((i) => i.product.id === x.product.id)?.size}</span>
                  <span className="price">${x.priceUsd}</span>
                </div>
              ))}
              <div className="row between small muted">
                <span>{g.shippingUsd === 0 ? `Free shipping (over $${r.freeOverUsd})` : `Shipping $${g.shippingUsd} · free over $${r.freeOverUsd}`}</span>
                {/* Demo: the affiliate store link goes here (rel="sponsored" when real). */}
                <a className="btn primary" href="#planh" title="Demo: the store link goes here">Go to store</a>
              </div>
            </div>
          );
        })}
        <p className="small muted">We search the stores for the best final deal on the whole look, shipping included.</p>
      </div>
    </section>
  );
}
