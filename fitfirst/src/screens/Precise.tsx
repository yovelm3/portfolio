/* SCREEN 2b: Precise fit. 6 tape measurements, pre-filled with the Quick estimate. */
import { useRef, useState } from "react";
import type { Body } from "../engine";
import { MEASURE_FIELDS } from "../config";

interface Props {
  initial: Body;
  onBack: () => void;
  onDone: (m: Body) => void;
}

type Key = (typeof MEASURE_FIELDS)[number]["key"];

export function Precise({ initial, onBack, onDone }: Props) {
  const [values, setValues] = useState<Record<Key, string>>(
    () => Object.fromEntries(MEASURE_FIELDS.map((f) => [f.key, String(initial[f.key])])) as Record<Key, string>,
  );
  const [bad, setBad] = useState<Set<Key>>(new Set());
  const [error, setError] = useState("");
  const refs = useRef<Partial<Record<Key, HTMLInputElement | null>>>({});

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const wrong = MEASURE_FIELDS.filter((f) => {
      const v = parseFloat(values[f.key]);
      return !(v >= f.min && v <= f.max);
    });
    setBad(new Set(wrong.map((f) => f.key)));
    if (wrong.length) {
      const f = wrong[0];
      setError(`${f.label} should be between ${f.min} and ${f.max} cm.`);
      refs.current[f.key]?.focus();
      return;
    }
    setError("");
    onDone(Object.fromEntries(MEASURE_FIELDS.map((f) => [f.key, parseFloat(values[f.key])])) as unknown as Body);
  };

  return (
    <section className="view" aria-labelledby="preh">
      <form className="card" style={{ gap: 20 }} noValidate onSubmit={submit}>
        <div className="row between">
          <h2 id="preh" tabIndex={-1}>Precise fit</h2>
          <button type="button" className="btn link" onClick={onBack}>Back</button>
        </div>
        <p className="lead">Measure over underwear, tape snug but not tight. We filled in an estimate; change any number you measure.</p>
        <div className="measures">
          {MEASURE_FIELDS.map((f) => (
            <div className="measure" key={f.key}>
              <label htmlFor={`p-${f.key}`}>{f.label}</label>
              <small id={`h-${f.key}`}>{f.how}</small>
              <div className="unit">
                <input id={`p-${f.key}`} type="number" inputMode="decimal" step="0.5" min={f.min} max={f.max}
                  value={values[f.key]} aria-describedby={`h-${f.key}`} aria-invalid={bad.has(f.key) || undefined}
                  className={bad.has(f.key) ? "bad" : undefined} ref={(el) => { refs.current[f.key] = el; }}
                  onChange={(e) => setValues({ ...values, [f.key]: e.target.value })} />
                <span>cm</span>
              </div>
            </div>
          ))}
        </div>
        <div className="err" role="alert">{error}</div>
        <div className="row"><button type="submit" className="btn primary">Open my wardrobe</button></div>
      </form>
    </section>
  );
}
