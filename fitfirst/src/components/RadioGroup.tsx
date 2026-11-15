/*
 * Accessible radio group made of big buttons.
 * Arrow keys move the choice (and the focus), like native radio buttons.
 */
import { useRef, type ReactNode } from "react";

interface Props<T extends string> {
  label: string;
  className: string;
  itemClassName: string;
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  render: (v: T) => ReactNode;
}

export function RadioGroup<T extends string>({ label, className, itemClassName, options, value, onChange, render }: Props<T>) {
  const ref = useRef<HTMLDivElement>(null);
  const onKeyDown = (e: React.KeyboardEvent) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (!step) return;
    e.preventDefault();
    const i = (options.indexOf(value) + step + options.length) % options.length;
    onChange(options[i]);
    (ref.current?.children[i] as HTMLElement | undefined)?.focus();
  };
  return (
    <div className={className} role="radiogroup" aria-label={label} ref={ref} onKeyDown={onKeyDown}>
      {options.map((o) => (
        <button key={o} type="button" role="radio" className={itemClassName} aria-checked={o === value}
          tabIndex={o === value ? 0 : -1} onClick={() => onChange(o)}>
          {render(o)}
        </button>
      ))}
    </div>
  );
}
