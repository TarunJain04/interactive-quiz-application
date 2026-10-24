import { useEffect, useState } from "react";
import api from "../services/api";
import QuizCard from "../components/quiz/QuizCard";
import MultiSelectPillGroup from "../components/common/MultiSelectPillGroup";
import SingleSelectPillGroup from "../components/common/SingleSelectPillGroup";
import ThemeSwitcher from "../components/common/ThemeSwitcher";
import Icon from "../components/common/Icon";

// ─── Timer config constants ────────────────────────────────────────────────────

/** Available per-question durations (seconds) */
const PER_Q_DURATIONS = [10, 15, 20, 30, 45, 60];

/** Available global quiz durations (seconds → displayed as minutes) */
const GLOBAL_DURATIONS = [60, 120, 180, 300, 600];

/**
 * QuizPage
 *
 * Single page component that serves two modes:
 *   - Custom mode  (timed=false) : user picks filters → starts QuizCard
 *   - Timed mode   (timed=true)  : user picks timer config → starts QuizCard
 *
 * In both modes the quiz itself is rendered by <QuizCard />.
 * Timer config is encoded as a `timerConfig` object passed to QuizCard:
 *   null                                  → no timer (custom mode)
 *   { type: "global",       seconds: N }  → one countdown for the whole quiz
 *   { type: "per_question", seconds: N }  → per-question countdown, resets each slide
 *
 * @prop {boolean} timed - Injected by the route (<QuizPage timed={true} />).
 */
export default function QuizPage({ timed = false }) {
  // ── Filter state (custom mode only) ─────────────────────────────────────────
  const [categories,   setCategories]   = useState(null);
  const [types,        setTypes]        = useState(null);
  const [difficulties, setDifficulties] = useState(null);
  const [size,         setSize]         = useState(10);
  const [filters,      setFilters]      = useState({
    categories: [],
    difficulties: [],
    types: [],
    sizes: [],
  });

  // ── Timer config state (timed mode only) ────────────────────────────────────
  // timerType: "global" | "per_question"
  const [timerType,     setTimerType]     = useState("global");
  // timerSeconds: the chosen countdown duration
  const [timerSeconds,  setTimerSeconds]  = useState(GLOBAL_DURATIONS[2]); // 3 min default

  // ── Shared state ─────────────────────────────────────────────────────────────
  const [loading,    setLoading]    = useState(!timed); // timed mode needs no filter fetch
  const [error,      setError]      = useState(null);
  const [quizActive, setQuizActive] = useState(false);  // true once "Start" is clicked

  // ── Load filter options (custom mode only) ───────────────────────────────────
  useEffect(() => {
    if (timed) return; // skip API call in timed mode — no filters needed

    let isMounted = true;
    async function loadFilters() {
      try {
        setLoading(true);
        setError(null);
        const data = await api.getFilters();
        if (!isMounted) return;
        setFilters({
          categories: data?.categories,
          difficulties: data?.difficulties,
          types: data?.types,
          sizes: [5, 10, 15, 20, 25, 30, 50],
        });
      } catch (err) {
        if (isMounted) setError(err.message || "Failed to load filters");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadFilters();
    return () => { isMounted = false; };
  }, [timed]);

  // ── Derived values (custom mode) ─────────────────────────────────────────────
  // Map selected category display-names back to their API slugs
  const categorySlugs = filters.categories
    ?.filter((cat) => categories?.has(cat.name))
    .map((cat) => cat.slug);

  const categoryNames = filters.categories?.map((c) => c.name) || [];
  const hasFilters    = categories?.size || difficulties?.size || types?.size;

  // ── Timer config object passed to QuizCard ───────────────────────────────────
  // null in custom mode; a typed config object in timed mode.
  const timerConfig = timed
    ? { type: timerType, seconds: timerSeconds }
    : null;

  // ── Sync default timerSeconds when timerType changes ─────────────────────────
  // (per-question defaults to 30s; global defaults to 3 min)
  function handleTimerTypeChange(newType) {
    setTimerType(newType);
    setTimerSeconds(newType === "per_question" ? 30 : GLOBAL_DURATIONS[2]);
  }

  return (
    <>
      <ThemeSwitcher />

      <div className="min-h-screen" style={{ background: "var(--color-bg)" }}>
        <div
          className={`${quizActive ? "max-w-6xl" : "max-w-xl"} mx-auto px-5 py-8`}
        >

          {/* ── Page header (hidden while quiz is running) ───────────────────── */}
          {!quizActive && (
            <header className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8 sm:justify-between">
              <div>
                <h1
                  className="text-xl font-bold"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  <span className="inline-flex items-center gap-2">
                    <Icon name={timed ? "clock" : "zap"} size={18} />
                    {timed ? "Timed Quiz" : "Build your quiz"}
                  </span>
                </h1>
                <p
                  className="text-sm mt-1"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {timed
                    ? "Choose a timer style, then start."
                    : "Pick filters, then start when you're ready."}
                </p>
              </div>
            </header>
          )}

          {/* ── Loading spinner (custom mode filter fetch) ───────────────────── */}
          {loading && (
            <div className="py-20 text-center">
              <div
                className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin mx-auto mb-3"
                style={{
                  borderColor: "var(--color-loading-spinner)",
                  borderTopColor: "transparent",
                }}
              />
              <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                Loading filters…
              </p>
            </div>
          )}

          {/* ── Error state ──────────────────────────────────────────────────── */}
          {!loading && error && (
            <div
              className="py-12 rounded-xl border p-6 text-center max-w-xs mx-auto"
              style={{
                borderColor: "color-mix(in srgb, #ef4444 30%, transparent)",
              }}
            >
              <p className="text-sm" style={{ color: "#f87171" }}>{error}</p>
            </div>
          )}

          {/* ── Config card (shown before quiz starts) ───────────────────────── */}
          {!loading && !error && !quizActive && (
            <div
              className="rounded-xl border p-5"
              style={{
                background: "var(--color-surface)",
                borderColor: "var(--color-border)",
              }}
            >

              {/* ── Custom mode: category / difficulty / type / size filters ── */}
              {!timed && (
                <>
                  <MultiSelectPillGroup
                    title="Category"
                    options={categoryNames}
                    selectedValues={categories}
                    setSelectedValues={setCategories}
                  />
                  <MultiSelectPillGroup
                    title="Difficulty"
                    options={filters.difficulties}
                    selectedValues={difficulties}
                    setSelectedValues={setDifficulties}
                  />
                  <MultiSelectPillGroup
                    title="Type"
                    options={filters.types}
                    selectedValues={types}
                    setSelectedValues={setTypes}
                  />
                  <SingleSelectPillGroup
                    title="Number of questions"
                    options={filters.sizes}
                    selectedValue={size}
                    setSelectedValues={setSize}
                  />
                </>
              )}

              {/* ── Timed mode: timer type + duration picker ─────────────────── */}
              {timed && (
                <div className="space-y-5">

                  {/* Timer type selector */}
                  <div>
                    <p
                      className="text-xs font-semibold uppercase tracking-wider mb-2"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      Timer style
                    </p>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {[
                        { value: "global",       label: "Global",         icon: "globe", hint: "One countdown for the whole quiz" },
                        { value: "per_question",  label: "Per question",   icon: "helpCircle", hint: "Resets for every question" },
                      ].map(({ value, label, icon, hint }) => {
                        const active = timerType === value;
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => handleTimerTypeChange(value)}
                            className="flex-1 rounded-lg border px-3 py-2.5 text-left text-sm cursor-pointer transition-colors"
                            style={{
                              background: active
                                ? "var(--color-filter-option-selected-bg)"
                                : "var(--color-filter-option-idle-bg)",
                              borderColor: active
                                ? "var(--color-filter-option-selected-border)"
                                : "var(--color-filter-option-idle-border)",
                              color: active
                                ? "var(--color-filter-option-selected-text)"
                                : "var(--color-filter-option-idle-text)",
                            }}
                          >
                            <span className="flex items-center gap-2 font-semibold"><Icon name={icon} size={16} />{label}</span>
                            <br />
                            <span
                              className="text-xs"
                              style={{
                                color: active
                                  ? "var(--color-filter-option-selected-text)"
                                  : "var(--color-text-muted)",
                                opacity: 0.85,
                              }}
                            >
                              {hint}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Duration picker — options differ per timer type */}
                  <SingleSelectPillGroup
                    title={timerType === "per_question" ? "Seconds per question" : "Total quiz time"}
                    options={timerType === "per_question" ? PER_Q_DURATIONS : GLOBAL_DURATIONS}
                    selectedValue={timerSeconds}
                    setSelectedValues={setTimerSeconds}
                    // Format global durations as "Xm" labels
                    formatLabel={timerType === "global"
                      ? (s) => `${s / 60}m`
                      : undefined}
                  />
                </div>
              )}

              {/* ── Footer row: clear filters + start button ─────────────────── */}
              <div
                className="flex items-center justify-between pt-4 mt-4 border-t"
                style={{ borderColor: "var(--color-border)" }}
              >
                {/* Left: clear button (custom) or empty slot (timed) */}
                {!timed ? (
                  hasFilters ? (
                    <button
                      onClick={() => {
                        setCategories(null);
                        setDifficulties(null);
                        setTypes(null);
                      }}
                      className="select-none text-xs cursor-pointer transition-colors"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      Clear filters
                    </button>
                  ) : (
                    <span
                      className="select-none text-xs"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      No filters applied
                    </span>
                  )
                ) : (
                  // Timed mode: show a summary of what was picked
                  <span
                    className="select-none text-xs"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    {timerType === "per_question"
                      ? `${timerSeconds}s per question`
                      : `${timerSeconds / 60} min total`}
                  </span>
                )}

                {/* Right: start button */}
                <button
                  id="start-quiz-btn"
                  onClick={() => setQuizActive(true)}
                  className="select-none inline-flex items-center justify-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-colors"
                  style={{
                    background: "var(--color-quiz-primary-action-bg)",
                    color: "var(--color-quiz-primary-action-text)",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--color-quiz-primary-action-hover-bg)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "var(--color-quiz-primary-action-bg)")
                  }
                >
                  <span>{timed ? "Start" : `Start — ${size} questions`}</span>
                  <Icon name="arrowRight" size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ── Active quiz ───────────────────────────────────────────────────── */}
          {!loading && !error && quizActive && (
            <QuizCard
              toggleNewQuiz={setQuizActive}  // called with `false` to go back to config
              categories={timed ? null : categorySlugs}
              difficulties={timed ? null : difficulties}
              types={timed ? null : types}
              size={size}
              timerConfig={timerConfig}       // null = no timer; object = timer active
            />
          )}

        </div>
      </div>
    </>
  );
}
