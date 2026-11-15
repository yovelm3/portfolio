/* SCREEN 1: choose a path. Quick (no tape measure) or Precise (6 measurements). */
import { Meter } from "../components/Meter";

export function Start({ go }: { go: (v: "quick" | "precise") => void }) {
  return (
    <section className="view" aria-labelledby="starth">
      <div className="card" style={{ gap: 20 }}>
        <h2 id="starth" tabIndex={-1}>Find your size in every brand</h2>
        <p className="lead">
          Build a workout look on a mannequin with your shape, and we'll tell you which size to order in each brand so you
          don't have to send it back.
        </p>
        <div className="paths">
          <button type="button" className="path" onClick={() => go("quick")}>
            <span className="t">Quick start</span>
            <span className="muted">About 30 seconds. No tape measure.</span>
            <ul><li>Your height</li><li>The size you usually buy</li><li>Your body shape</li></ul>
            <Meter precise={false} label="Good estimate" />
          </button>
          <button type="button" className="path" onClick={() => go("precise")}>
            <span className="t">Precise fit</span>
            <span className="muted">About 2 minutes with a tape measure.</span>
            <ul><li>6 measurements, with how-to for each</li><li>The most accurate size advice</li><li>Fewest returns</li></ul>
            <Meter precise label="Precise" />
          </button>
        </div>
        <p className="small muted">You can start quick and add your measurements later.</p>
      </div>
    </section>
  );
}
