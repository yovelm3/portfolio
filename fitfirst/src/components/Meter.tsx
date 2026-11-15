/* Accuracy meter. Product rule: no numeric accuracy claims, only "good estimate" vs "precise". */
export function Meter({ precise, label }: { precise: boolean; label: string }) {
  const on = precise ? 5 : 3;
  return (
    <span className="meter" aria-label={`Fit accuracy: ${precise ? "precise" : "good estimate"}`}>
      {[0, 1, 2, 3, 4].map((i) => <i key={i} className={i < on ? "on" : undefined} />)}
      <span>{label}</span>
    </span>
  );
}
