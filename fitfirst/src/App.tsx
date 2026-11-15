/*
 * App shell: top bar (with the privacy promise), demo banner, the current screen, and the affiliate disclosure.
 * Screens: start → quick | precise → wardrobe. A returning visitor opens straight on the wardrobe.
 */
import { useEffect, useMemo, useState } from "react";
import { estimateBody, type Body, type Category } from "./engine";
import { catalog } from "./data/catalog";
import { DEFAULT_LOOK, DEFAULT_SAVED, loadSaved, save, type Look, type Saved, type View } from "./state";
import { Start } from "./screens/Start";
import { Quick } from "./screens/Quick";
import { Precise } from "./screens/Precise";
import { Wardrobe } from "./screens/Wardrobe";

export function App() {
  const [initial] = useState(loadSaved);
  const [saved, setSaved] = useState<Saved>(initial ?? DEFAULT_SAVED);
  const [view, setView] = useState<View>(initial ? "wardrobe" : "start");
  const [look, setLookState] = useState<Look>(DEFAULT_LOOK);
  const [changed, setChanged] = useState<{ category: Category; dir: number } | null>(null);
  const [live, setLive] = useState("");

  const update = (s: Saved) => { setSaved(s); save(s); };
  const setLook = (l: Look, c?: { category: Category; dir: number }) => { setLookState(l); setChanged(c ?? null); };

  /** Measurements used by the engines: tape measurements if Precise, otherwise the Quick estimate. */
  const body: Body = useMemo(
    () => (saved.mode === "precise" && saved.measured ? saved.measured : estimateBody(catalog, saved.quick)),
    [saved],
  );

  // On every screen change: scroll to top and move focus to the screen heading (screen readers announce it).
  useEffect(() => {
    window.scrollTo(0, 0);
    document.querySelector<HTMLElement>("main h2")?.focus({ preventScroll: true });
  }, [view]);

  const say = (t: string) => { setLive(""); setTimeout(() => setLive(t), 30); };

  return (
    <>
      <header className="top">
        <div className="logo"><h1>FitFirst</h1><span className="chip">Working name · v0.3</span></div>
        <p className="privacy">🔒 Your body details stay on this device. Nothing is uploaded.</p>
      </header>
      {catalog.demo && (
        <p className="demo-banner">
          Demo: brands, products, prices and reviews are made-up examples. Real catalogs will come from affiliate product feeds.
        </p>
      )}
      <div className="sr" aria-live="polite">{live}</div>

      <main className="wrap">
        {view === "start" && <Start go={setView} />}
        {view === "quick" && (
          <Quick initial={saved.quick} onBack={() => setView("start")}
            onPrecise={(quick) => { setSaved({ ...saved, quick }); setView("precise"); }}
            onDone={(quick) => { update({ ...saved, quick, mode: "quick" }); setLook({ ...look, sizeOverride: {} }); setView("wardrobe"); }} />
        )}
        {view === "precise" && (
          <Precise initial={saved.measured ?? estimateBody(catalog, saved.quick)} onBack={() => setView("start")}
            onDone={(measured) => { update({ ...saved, measured, mode: "precise" }); setLook({ ...look, sizeOverride: {} }); setView("wardrobe"); }} />
        )}
        {view === "wardrobe" && (
          <Wardrobe body={body} mode={saved.mode} usual={saved.quick.usual} skin={saved.skin} look={look} changed={changed}
            setLook={setLook} setSkin={(skin) => update({ ...saved, skin })}
            onEdit={() => setView(saved.mode === "precise" ? "precise" : "quick")} onPrecise={() => setView("precise")} say={say} />
        )}
      </main>

      {/* Affiliate disclosure: must stay visible on every screen. */}
      <p className="foot">
        FitFirst may earn a commission when you buy through store links. You always pay the store directly. Prices change
        often, so check the final price at the store.
      </p>
    </>
  );
}
