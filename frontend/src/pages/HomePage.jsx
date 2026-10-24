import { useNavigate } from "react-router-dom";
import ThemeSwitcher from "../components/common/ThemeSwitcher";
import Icon from "../components/common/Icon";

const MODES = [
  {
    id: "custom",
    path: "/quiz",
    icon: "zap",
    title: "Custom Quiz",
    description:
      "Pick your categories, difficulty, and question count. Build the quiz that fits you.",
    tags: ["Filter by topic", "Choose difficulty", "Set question count"],
    accent: "var(--color-quiz-primary-action-bg)",
    accentHover: "var(--color-quiz-primary-action-hover-bg)",
    cta: "Build quiz",
  },
  {
    id: "timed",
    path: "/timed-quiz",
    icon: "clock",
    title: "Timed Quiz",
    description:
      "Race against the clock. Random questions, full pressure — how fast can you think?",
    tags: ["Random questions", "Global or per-question timer", "No filters"],
    accent: "var(--color-quiz-navigation-bg)",
    accentHover: "var(--color-quiz-navigation-hover-bg)",
    cta: "Start timer",
  },
  {
    id: "kbc",
    path: "/kbc",
    icon: "trophy",
    title: "Who Wants to Be a Millionaire?",
    description:
      "Climb the prize ladder, use lifelines, and see how far your knowledge takes you.",
    tags: ["15 questions", "Three lifelines", "Win up to ₹1 crore"],
    accent: "#d4a72c",
    accentHover: "#b8891f",
    cta: "Play KBC",
  },
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <>
      <ThemeSwitcher />

      <div
        className="min-h-screen flex flex-col items-center justify-center px-5 py-16"
        style={{ background: "var(--color-bg)" }}
      >
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="mb-4 inline-flex rounded-xl bg-[color-mix(in_srgb,var(--color-quiz-primary-action-bg)_14%,transparent)] p-3" aria-hidden="true">
              <Icon name="brain" size={30} strokeWidth={1.7} />
            </div>
            <h1
              className="text-3xl font-bold mb-2 tracking-tight"
              style={{ color: "var(--color-text-primary)" }}
            >
              Quiz App
            </h1>
            <p
              className="text-sm"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Choose a mode and start testing your knowledge.
            </p>
          </div>

          {/* Mode cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {MODES.map((mode) => (
              <ModeCard key={mode.id} mode={mode} onClick={() => navigate(mode.path)} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function ModeCard({ mode, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      id={`mode-${mode.id}`}
      className="group flex-1 text-left rounded-2xl border p-6 cursor-pointer transition-all duration-200"
      style={{
        background: "var(--color-surface)",
        borderColor: "var(--color-border)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = mode.accent;
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--color-border)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Icon + title */}
      <div className="mb-4">
        <span className="mb-3 inline-flex rounded-lg p-2" style={{ color: mode.accent, background: `color-mix(in srgb, ${mode.accent} 14%, transparent)` }} aria-hidden="true">
          <Icon name={mode.icon} size={22} />
        </span>
        <h2
          className="text-base font-bold mt-2"
          style={{ color: "var(--color-text-primary)" }}
        >
          {mode.title}
        </h2>
        <p
          className="text-sm mt-1 leading-relaxed"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {mode.description}
        </p>
      </div>

      {/* Tags */}
      <ul className="flex flex-col gap-1.5 mb-6">
        {mode.tags.map((tag) => (
          <li
            key={tag}
            className="text-xs flex items-center gap-1.5"
            style={{ color: "var(--color-text-secondary)" }}
          >
            <Icon name="check" size={14} strokeWidth={2.2} className="mr-0.5" style={{ color: mode.accent }} />
            {tag}
          </li>
        ))}
      </ul>

      {/* CTA */}
      <div
        className="w-full text-center py-2 rounded-lg text-sm font-semibold transition-colors"
        style={{
          background: mode.accent,
          color: "var(--color-quiz-primary-action-text)",
        }}
      >
        <span>{mode.cta}</span>
        <Icon name="arrowRight" size={16} />
      </div>
    </button>
  );
}
