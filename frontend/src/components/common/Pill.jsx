export default function Pill({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="px-3 py-1.5 rounded-md text-xs font-medium border transition-all duration-150 cursor-pointer select-none"
      style={
        active
          ? {
              background: "var(--color-filter-option-selected-bg)",
              color: "#ffffff",
              borderColor: "var(--color-filter-option-selected-border)",
            }
          : {
              background: "var(--color-filter-option-idle-bg)",
              color: "var(--color-filter-option-idle-text)",
              borderColor: "var(--color-filter-option-idle-border)",
            }
      }
    >
      {label}
    </button>
  );
}
