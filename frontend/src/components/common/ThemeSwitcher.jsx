import { useTheme } from "../../context/useTheme";
import { THEMES } from "../../context/themes";

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className="absolute right-3 top-3 inline-flex max-w-[calc(100%-1.5rem)] items-center gap-1 rounded-lg border p-1.5 sm:right-4 sm:top-4 sm:p-2"
      style={{
        background: "var(--color-theme-selector-bg)",
        borderColor: "var(--color-theme-selector-border)",
      }}
      role="group"
      aria-label="Theme Switcher"
    >
      {THEMES.map((key) => (
        <button
          key={key}
          type="button"
          onClick={() => setTheme(key)}
          className="px-3 py-1 text-xs rounded-md transition-colors capitalize cursor-pointer"
          style={{
            color: "var(--color-theme-selector-text)",
            ...(theme === key && {
              background: "var(--color-theme-selector-active-bg)",
            }),
          }}
        >
          {key}
        </button>
      ))}
    </div>
  );
}
