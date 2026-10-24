import Pill from "./Pill";

export default function MultiSelectPillGroup({ title, options = [], selectedValues, setSelectedValues }) {
  const isAnyActive =
    !selectedValues?.size ||
    (Boolean(options?.length) && selectedValues.size === options.length);

  return (
    <div className="mb-6">
      <p className="text-xs font-semibold mb-2" style={{ color: "var(--color-text-secondary)" }}>
        {title}
      </p>
      <div className="flex flex-wrap gap-1.5">
        <Pill label="Any" active={isAnyActive} onClick={() => setSelectedValues(null)} />
        {options.map((opt) => (
          <Pill
            key={String(opt)}
            label={opt}
            active={Boolean(selectedValues?.has?.(opt))}
            onClick={() => {
              setSelectedValues((prev) => {
                const s = new Set(prev);
                if (s.has(opt)) {
                  s.delete(opt);
                  if (s.size === 0) return null;
                } else {
                  s.add(opt);
                  if (s.size === options.length) return null;
                }
                return s;
              });
            }}
          />
        ))}
      </div>
    </div>
  );
}
