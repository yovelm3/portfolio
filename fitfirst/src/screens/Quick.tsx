/* SCREEN 2a: Quick start. Height, usual size and body shape → estimated measurements. */
import { useState } from "react";
import type { QuickInput } from "../engine";
import { catalog } from "../data/catalog";
import { HEIGHT_MAX, HEIGHT_MIN } from "../config";
import { RadioGroup } from "../components/RadioGroup";
import { shapeIconPath } from "../mannequin/geometry";

interface Props {
  initial: QuickInput;
  onBack: () => void;
  onPrecise: (q: QuickInput) => void;
  onDone: (q: QuickInput) => void;
}

const SHAPE_KEYS = Object.keys(catalog.shapes);

export function Quick({ initial, onBack, onPrecise, onDone }: Props) {
  const [height, setHeight] = useState(String(initial.height));
  const [usual, setUsual] = useState(initial.usual);
  const [shape, setShape] = useState(initial.shape);
  const [error, setError] = useState("");

  const h = Number(height);
  const valid = h >= HEIGHT_MIN && h <= HEIGHT_MAX;
  const step = (d: number) => setHeight(String(Math.min(HEIGHT_MAX, Math.max(HEIGHT_MIN, (Number(height) || 165) + d))));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return setError(`Height should be between ${HEIGHT_MIN} and ${HEIGHT_MAX} cm.`);
    setError("");
    onDone({ height: h, usual, shape });
  };

  return (
    <section className="view" aria-labelledby="quickh">
      <form className="card" style={{ gap: 22 }} noValidate onSubmit={submit}>
        <div className="row between">
          <h2 id="quickh" tabIndex={-1}>Quick start</h2>
          <button type="button" className="btn link" onClick={onBack}>Back</button>
        </div>

        <fieldset className="fieldset">
          <legend id="hlabel">Your height</legend>
          <div className="stepper">
            <button type="button" aria-label="Height minus 1 centimetre" onClick={() => step(-1)}>−</button>
            <input type="number" inputMode="numeric" min={HEIGHT_MIN} max={HEIGHT_MAX} value={height}
              className={error ? "bad" : undefined} aria-labelledby="hlabel" aria-describedby="hunit"
              onChange={(e) => setHeight(e.target.value)} />
            <button type="button" aria-label="Height plus 1 centimetre" onClick={() => step(1)}>+</button>
            <span id="hunit" className="muted">cm</span>
          </div>
        </fieldset>

        <fieldset className="fieldset">
          <legend>The size you usually buy in workout tops and leggings</legend>
          <RadioGroup label="Usual size" className="choices" itemClassName="choice"
            options={catalog.sizeChart.sizes} value={usual} onChange={setUsual} render={(s) => s} />
        </fieldset>

        <fieldset className="fieldset">
          <legend>Which shape is closest to yours?</legend>
          <RadioGroup label="Body shape" className="shapes" itemClassName="shape"
            options={SHAPE_KEYS} value={shape} onChange={setShape}
            render={(k) => {
              const s = catalog.shapes[k];
              return (
                <>
                  <svg viewBox="0 0 46 76" aria-hidden="true">
                    <circle cx="23" cy="5" r="5" fill="currentColor" opacity=".5" />
                    <path d={shapeIconPath(s.adjustCm)} fill="currentColor" opacity=".75" />
                  </svg>
                  <b>{s.name}</b>
                  <small>{s.description}</small>
                </>
              );
            }} />
        </fieldset>

        <div className="err" role="alert">{error}</div>
        <div className="row">
          <button type="submit" className="btn primary">Open my wardrobe</button>
          <button type="button" className="btn link"
            onClick={() => onPrecise({ height: valid ? h : initial.height, usual, shape })}>
            Use measurements for a precise fit
          </button>
        </div>
      </form>
    </section>
  );
}
