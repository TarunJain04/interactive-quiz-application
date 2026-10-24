import Pill from "./Pill";

/**
 * SingleSelectPillGroup
 *
 * Renders a labelled row of mutually-exclusive pill buttons.
 *
 * @prop {string}        title           - Section label shown above the pills.
 * @prop {Array}         options         - Raw option values.
 * @prop {*}             selectedValue   - Currently selected value (matched by ===).
 * @prop {Function}      setSelectedValues - Called with the chosen value on click.
 * @prop {Function|null} formatLabel     - Optional fn(value) → string for custom display.
 *                                         Defaults to String(value).
 */
export default function SingleSelectPillGroup({
  title,
  options = [],
  selectedValue,
  setSelectedValues,
  formatLabel = null,
}) {
  return (
    <div className="mb-6">
      <p className="text-xs font-semibold mb-2" style={{ color: "var(--color-text-secondary)" }}>
        {title}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <Pill
            key={String(opt)}
            label={formatLabel ? formatLabel(opt) : String(opt)}
            active={selectedValue === opt}
            onClick={() => setSelectedValues(opt)}
          />
        ))}
      </div>
    </div>
  );
}
