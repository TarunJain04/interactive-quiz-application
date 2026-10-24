import Timer from "./Timer";
import Icon from "../common/Icon";

/**
 * QuestionRenderer
 *
 * Pure display component for a single question.
 * Stateless — all state lives in QuizCard.
 *
 * Props
 * ─────
 * @prop {object}      question          - The question object from the API.
 * @prop {number}      selectedIndex     - Index of the user's current selection (or undefined).
 * @prop {Function}    handleSelect      - Called with the chosen index when the user picks an answer.
 * @prop {boolean}     disabled          - Locks choices after submission.
 * @prop {number}      answerIndex       - Correct answer index (supplied after submission).
 * @prop {boolean}     showCorrectAnswer - Whether to highlight the correct answer.
 *
 * Per-question timer props (all null / undefined in custom mode):
 * @prop {number|null}   timerDuration  - Countdown duration in seconds.
 * @prop {*|null}        timerResetKey  - Key that resets the countdown (= currentIndex).
 * @prop {Function|null} onTimerExpire  - Called when the countdown hits zero.
 * @prop {boolean}       timerPaused    - Suspends the tick (e.g. after submission).
 */
export default function QuestionRenderer({
  question,
  selectedIndex,
  handleSelect,
  disabled,
  answerIndex,
  showCorrectAnswer,
  resultStatus = null, // "correct" | "wrong" | "skipped" | null
  // Per-question timer (optional — omitted in custom mode)
  timerDuration = null,
  timerResetKey = null,
  onTimerExpire = null,
  timerPaused = false,
}) {
  if (!question) return null;
  const { question: text, choices, categoryName, difficulty } = question;

  const showPerQTimer = timerDuration !== null && onTimerExpire !== null;

  return (
    <div
      className="rounded-2xl border p-6"
      style={{
        background: "var(--color-surface)",
        borderColor: "var(--color-border)",
        color: "var(--color-text-primary)",
      }}
    >
      {/* ── Meta row: category · difficulty · [per-question timer] · [result badge] ── */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="text-sm font-semibold"
            style={{ color: "var(--color-question-category-label)" }}
          >
            {categoryName}
          </span>
          <span style={{ color: "var(--color-text-muted)" }}>·</span>
          <span
            className="text-sm font-medium"
            style={{ color: "var(--color-question-difficulty-label)" }}
          >
            {difficulty}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Per-question timer badge — only rendered in per_question timed mode */}
          {showPerQTimer && (
            <Timer
              duration={timerDuration}
              resetKey={timerResetKey}
              onExpire={onTimerExpire}
              paused={timerPaused}
            />
          )}

          {/* Result status badge — shown after quiz submission */}
          {resultStatus && (
            <span
              data-state={resultStatus}
              className="inline-flex items-center px-[0.6rem] py-[0.2rem] rounded-full text-[0.7rem] font-bold tracking-[0.04em] uppercase border border-transparent data-[state=correct]:bg-[hsl(142_60%_18%)] data-[state=correct]:border-[hsl(142_55%_30%)] data-[state=correct]:text-[hsl(142_70%_65%)] data-[state=wrong]:bg-[hsl(0_60%_20%)] data-[state=wrong]:border-[hsl(0_55%_38%)] data-[state=wrong]:text-[hsl(0_75%_68%)] data-[state=skipped]:bg-[hsl(40_40%_18%)] data-[state=skipped]:border-[hsl(40_35%_32%)] data-[state=skipped]:text-[hsl(40_65%_62%)]"
            >
              {resultStatus === "correct" && "Correct"}
              {resultStatus === "wrong" && "Wrong"}
              {resultStatus === "skipped" && "Skipped"}
            </span>
          )}
        </div>
      </div>

      {/* ── Question text ─────────────────────────────────────────────────────── */}
      <h2
        className="mb-5 text-base font-semibold leading-relaxed"
        style={{ color: "var(--color-text-primary)" }}
      >
        {text}
      </h2>

      {/* ── Answer choices ────────────────────────────────────────────────────── */}
      <ul className="space-y-2.5">
        {choices.map((choice, index) => {
          const isCorrect = showCorrectAnswer && answerIndex === index;
          const isSelected = selectedIndex === index;

          // Visual state drives CSS data-attribute styling (see index.css)
          const choiceState = isCorrect
            ? "correct"
            : isSelected
              ? "selected"
              : "default";

          return (
            <li key={index}>
              <button
                type="button"
                onClick={() => handleSelect(index)}
                disabled={disabled}
                aria-pressed={isSelected}
                aria-label={
                  isCorrect ? `${choice} (correct answer)` : undefined
                }
                data-state={choiceState}
                className="select-none flex w-full items-center justify-between gap-3 rounded-lg border px-4 py-2.5 text-left text-sm transition-colors cursor-pointer disabled:cursor-default bg-(--color-quiz-answer-choice-bg) border-(--color-quiz-answer-choice-border) text-(--color-quiz-answer-choice-text) data-[state=default]:enabled:hover:bg-(--color-quiz-answer-choice-hover-bg) data-[state=selected]:bg-(--color-quiz-answer-choice-selected-bg) data-[state=selected]:border-(--color-quiz-answer-choice-selected-border) data-[state=selected]:text-(--color-quiz-answer-choice-selected-text) data-[state=selected]:font-medium data-[state=correct]:border-(--color-quiz-answer-choice-correct-border) data-[state=correct]:text-(--color-quiz-answer-choice-correct-text) data-[state=correct]:font-medium data-[state=incorrect]:border-[#ef4444] data-[state=incorrect]:text-[#ef4444] data-[state=incorrect]:font-medium focus-visible:outline-2 focus-visible:outline-(--color-quiz-answer-choice-focus) focus-visible:outline-offset-2"
              >
                <span>{choice}</span>
                {isCorrect && (
                  <span
                    className="inline-flex w-5 h-5 flex-[0_0_auto] items-center justify-center rounded-full bg-(--color-quiz-answer-choice-correct-mark-bg) text-(--color-quiz-answer-choice-correct-mark-text) text-[0.8rem] font-bold leading-none"
                    aria-hidden="true"
                  >
                    <Icon name="check" size={15} strokeWidth={2.2} />
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
