import { useCallback, useEffect, useState } from "react";
import api from "../../services/api";
import QuestionRenderer from "./QuestionRenderer";
import Timer from "./Timer";
import Loading from "../common/Loading";
import Error from "../common/Error";
import { useNavigate } from "react-router-dom";
import { getFriendlyErrorMessage } from "../../services/errorMessages";
import Icon from "../common/Icon";

/**
 * QuizCard
 *
 * The core quiz session component. Responsible for:
 *   - Fetching questions from the API on mount (and on "play again").
 *   - Tracking user answers and navigation through questions.
 *   - Submitting answers and displaying the result summary.
 *   - Timer integration (global or per-question) when timerConfig is provided.
 *
 * Props
 * ─────
 * @prop {Function}    toggleNewQuiz  - Called with `false` to return to the config screen.
 * @prop {string[]}    categories     - API slugs of selected categories (null = all).
 * @prop {Set|null}    difficulties   - Selected difficulties (null = all).
 * @prop {Set|null}    types          - Selected question types (null = all).
 * @prop {number}      size           - Number of questions to fetch.
 * @prop {object|null} timerConfig    - Timer settings, or null for no timer.
 *   { type: "global" | "per_question", seconds: number }
 */
export default function QuizCard({
  toggleNewQuiz,
  categories,
  difficulties,
  types,
  size,
  timerConfig = null,
}) {
  // ── Answer tracking ──────────────────────────────────────────────────────────
  // selectedIndices[i] = chosen answer index for question i, or undefined
  const [selectedIndices, setSelectedIndices] = useState([]);
  // Flat list of { questionId, selectedIndex } sent to the submit API
  const [submissions, setSubmissions] = useState([]);

  // ── Navigation ───────────────────────────────────────────────────────────────
  const [currentIndex, setCurrentIndex] = useState(0);

  // ── Finish / result state ────────────────────────────────────────────────────
  // isFinished guards against double-submitting when the user spams Finish
  const [isFinished, setIsFinished] = useState(false);
  const [quizResult, setQuizResult] = useState(null);

  // ── Data fetching ────────────────────────────────────────────────────────────
  // Toggling playAgain triggers a new fetch via the useEffect dependency
  const [playAgain, togglePlayAgain] = useState(0);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // ── Fetch questions ──────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    async function execute() {
      setLoading(true);
      setError(null);
      try {
        const result = await api.startQuiz({
          categories,
          difficulties,
          types,
          size,
        });
        if (!cancelled) setData(result);
      } catch (err) {
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    execute();
    return () => {
      cancelled = true;
    };
  }, [playAgain]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Timer helpers ─────────────────────────────────────────────────────────────
  const isTimedMode = Boolean(timerConfig);
  const isGlobal = timerConfig?.type === "global";
  const isPerQ = timerConfig?.type === "per_question";

  /**
   * handleSubmit — shared finalization logic called by:
   *   - "Finish" button click
   *   - Global timer expiry (auto-submit with current answers)
   */
  const handleSubmit = useCallback(
    async (currentSubmissions) => {
      if (isFinished || !data) return;
      setIsFinished(true);
      try {
        const result = await api.submitQuiz(data.id, {
          submissions: currentSubmissions,
        });
        setQuizResult(result);
      } catch (err) {
        setError(err);
      }
    },
    [isFinished, data],
  );

  /**
   * handleGlobalExpire — fires when the global countdown hits zero.
   * Submits whatever answers the user has so far.
   * Wrapped in useCallback so the Timer component gets a stable reference.
   */
  const handleGlobalExpire = useCallback(() => {
    handleSubmit(submissions);
  }, [handleSubmit, submissions]);

  /**
   * handlePerQExpire — fires when the per-question countdown hits zero.
   * Auto-advances to the next question (or submits if on the last one).
   */
  const handlePerQExpire = useCallback(() => {
    if (!data) return;
    const total = data.questions.length;
    if (currentIndex === total - 1) {
      // Last question — auto-submit
      handleSubmit(submissions);
    } else {
      // Advance without waiting for user input
      setCurrentIndex((i) => i + 1);
    }
  }, [currentIndex, data, handleSubmit, submissions]);

  // ── Early returns (loading / error / empty) ──────────────────────────────────
  if (loading) return <Loading message="Loading questions..." />;
  if (error) {
    return (
      <Error
        message={getFriendlyErrorMessage(error)}
        callback={() => navigate("/")}
      />
    );
  }

  if (data.questions.length === 0) {
    return (
      <div className="py-12 flex items-center justify-center">
        <div
          className="border rounded-2xl p-8 text-center max-w-sm"
          style={{
            background: "var(--color-surface)",
            borderColor: "var(--color-border)",
          }}
        >
          <p className="text-2xl mb-3">🔍</p>
          <p className="mb-4" style={{ color: "var(--color-text-primary)" }}>
            No questions matched your filters.
          </p>
          <button
            onClick={() => navigate("/")}
            className="select-none text-sm underline underline-offset-4 cursor-pointer transition-colors"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Go back and adjust filters
          </button>
        </div>
      </div>
    );
  }

  // ── Derived values ───────────────────────────────────────────────────────────
  const total = data.questions.length;
  const currentQuestion = data.questions[currentIndex];
  const progressPct = Math.round(((currentIndex + 1) / total) * 100);
  const accuracy =
    quizResult && quizResult.attempted > 0
      ? Math.round((quizResult.score / quizResult.attempted) * 100)
      : 0;

  // The correct answer index for the current question (only after submission)
  const answerIndex = quizResult?.questionResults.find(
    (q) => q.questionId === currentQuestion.id,
  )?.answerIndex;

  // Post-submit outcome badge for the current question
  const resultStatus = (() => {
    if (!quizResult) return null;
    const sel = selectedIndices[currentIndex];
    if (sel === undefined || sel === null) return "skipped";
    return sel === answerIndex ? "correct" : "wrong";
  })();

  // ── Answer selection ─────────────────────────────────────────────────────────
  function handleSelect(selectedIndex) {
    // Update the per-question index array
    setSelectedIndices((prev) => {
      const updated = [...prev];
      updated[currentIndex] = selectedIndex;
      return updated;
    });
    // Keep the flat submissions list in sync
    const updatedSubmissions =
      selectedIndex === null
        ? submissions
        : [
            ...submissions.filter((s) => s.questionId !== currentQuestion.id),
            { questionId: currentQuestion.id, selectedIndex },
          ];
    setSubmissions(updatedSubmissions);
  }

  // ── Navigation ───────────────────────────────────────────────────────────────
  async function handleNext() {
    if (currentIndex === total - 1) {
      if (quizResult) {
        // Post-submit review: wrap back to the first question
        setCurrentIndex(0);
      } else {
        // Active quiz: submit
        await handleSubmit(submissions);
      }
      return;
    }
    setCurrentIndex((i) => i + 1);
  }

  function handlePrevious() {
    if (currentIndex === 0) return;
    // Per-question mode: block backward navigation during active quiz (timer already ran on prev questions)
    if (isPerQ && !quizResult) return;
    setCurrentIndex((i) => i - 1);
  }

  function handlePlayAgain() {
    togglePlayAgain((prev) => prev + 1);
    setIsFinished(false);
    setSelectedIndices([]);
    setSubmissions([]);
    setCurrentIndex(0);
    setQuizResult(null);
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    // Per-question active: single centered column (no sidebar — can't go back).
    // Everything else (custom, global, or per-question after submission): sidebar + two-column grid.
    <div
      className={
        isPerQ && !quizResult
          ? "w-full max-w-2xl mx-auto"
          : "grid w-full grid-cols-[minmax(15rem,17rem)_minmax(0,1fr)] items-start gap-8 max-md:grid-cols-[minmax(0,1fr)] max-md:gap-5"
      }
    >
      {/* ── Left sidebar: question navigator (hidden only during active per-question quiz) ── */}
      {(!isPerQ || quizResult) && (
        <aside className="min-w-0">
          <nav aria-label="Question navigation">
            <div className="mb-2 flex items-baseline justify-between gap-3">
              <h2
                className="text-sm font-semibold"
                style={{ color: "var(--color-text-primary)" }}
              >
                Questions
              </h2>
              <span
                className="text-xs tabular-nums"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {submissions.length} of {total} answered
              </span>
            </div>

            {/* Numbered grid — clicking jumps to that question */}
            <ol
              className="grid grid-cols-[repeat(auto-fill,2.75rem)] gap-2 p-0 list-none"
              aria-label="Jump to a question"
            >
              {data.questions.map((question, index) => {
                const isAnswered =
                  selectedIndices[index] !== undefined &&
                  selectedIndices[index] !== null;
                const isCurrent = index === currentIndex;
                const state = isCurrent
                  ? "current"
                  : isAnswered
                    ? "answered"
                    : "unanswered";

                return (
                  <li key={question.id}>
                    <button
                      type="button"
                      onClick={() => setCurrentIndex(index)}
                      className="relative inline-flex w-11 aspect-square items-center justify-center border border-current rounded-lg text-sm font-semibold tabular-nums cursor-pointer transition-[background-color,border-color,color,box-shadow] duration-150 ease-[ease] hover:brightness-[1.08] focus-visible:outline-2 focus-visible:outline-(--color-quiz-answer-choice-focus) focus-visible:outline-offset-[3px] data-[state=unanswered]:bg-(--color-question-nav-unanswered-bg) data-[state=unanswered]:border-(--color-question-nav-unanswered-border) data-[state=unanswered]:text-(--color-question-nav-unanswered-text) data-[state=answered]:bg-(--color-question-nav-answered-bg) data-[state=answered]:border-(--color-question-nav-answered-border) data-[state=answered]:text-(--color-question-nav-answered-text) data-[state=current]:bg-(--color-question-nav-current-bg) data-[state=current]:border-(--color-question-nav-current-border) data-[state=current]:text-(--color-question-nav-current-text) data-[state=current]:shadow-[0_0_0_2px_var(--color-question-nav-current-border)]"
                      data-state={state}
                      aria-current={isCurrent ? "step" : undefined}
                      aria-label={`Question ${index + 1}, ${isCurrent ? "current, " : ""}${isAnswered ? "answered" : "not answered"}`}
                    >
                      {index + 1}
                    </button>
                  </li>
                );
              })}
            </ol>

            {/* Legend */}
            <div
              className="mt-3 flex flex-wrap gap-x-4 gap-y-3 text-xs text-(--color-text-secondary)"
              aria-hidden="true"
            >
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="w-3 h-3 border border-current rounded-[0.2rem] data-[state=current]:bg-(--color-question-nav-current-bg) data-[state=current]:border-(--color-question-nav-current-border)"
                  data-state="current"
                />
                Current
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="w-3 h-3 border border-current rounded-[0.2rem] data-[state=answered]:bg-(--color-question-nav-answered-bg) data-[state=answered]:border-(--color-question-nav-answered-border)"
                  data-state="answered"
                />
                Answered
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="w-3 h-3 border border-current rounded-[0.2rem] data-[state=unanswered]:bg-(--color-question-nav-unanswered-bg) data-[state=unanswered]:border-(--color-question-nav-unanswered-border)"
                  data-state="unanswered"
                />
                Unanswered
              </span>
            </div>
          </nav>
        </aside>
      )}

      {/* ── Right main column ────────────────────────────────────────────────── */}
      <div className="min-w-0 pl-2 max-md:pl-0">
        {/* Page heading */}
        <div className="mb-5">
          <h1
            className="inline-flex items-center gap-2 text-xl font-bold"
            style={{ color: "var(--color-text-primary)" }}
          >
            <Icon name={isTimedMode ? "clock" : "zap"} size={18} />
            {isTimedMode ? "Timed quiz" : "Quiz in progress"}
          </h1>
          <p
            className="text-sm mt-1"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {isTimedMode
              ? "Answer quickly — you can skip but not go back."
              : "Answer questions and submit your test."}
          </p>
        </div>

        {/* ── Top bar: back link | q counter | global timer ───────────────── */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => toggleNewQuiz(false)}
            className="select-none text-sm cursor-pointer transition-colors"
            style={{ color: "var(--color-text-secondary)" }}
          >
            <span className="inline-flex items-center gap-1.5">
              <Icon name="arrowLeft" size={16} />
              Back
            </span>
          </button>

          <div className="flex items-center gap-4">
            {/* Global timer — shown in top bar, counts down the full quiz */}
            {isGlobal && !isFinished && (
              <Timer
                duration={timerConfig.seconds}
                resetKey={playAgain} // resets when "play again" starts a new quiz
                onExpire={handleGlobalExpire}
                paused={isFinished}
              />
            )}

            <span
              className="text-sm tabular-nums"
              style={{ color: "var(--color-text-muted)" }}
            >
              {currentIndex + 1} of {total}
            </span>
          </div>
        </div>

        {/* Question progress bar */}
        <div
          className="h-1.5 rounded-full mb-6 overflow-hidden border"
          style={{
            background: "var(--color-surface-raised)",
            borderColor: "var(--color-border)",
          }}
        >
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${progressPct}%`,
              background: "var(--color-quiz-progress-fill)",
            }}
          />
        </div>

        {/* ── Question card ─────────────────────────────────────────────────── */}
        <QuestionRenderer
          question={currentQuestion}
          selectedIndex={selectedIndices[currentIndex]}
          handleSelect={handleSelect}
          disabled={isFinished}
          answerIndex={answerIndex}
          showCorrectAnswer={Boolean(quizResult)}
          resultStatus={resultStatus}
          // Per-question timer props — passed so QuestionRenderer can render the ring
          timerDuration={isPerQ ? timerConfig.seconds : null}
          timerResetKey={isPerQ ? currentIndex : null}
          onTimerExpire={isPerQ && !isFinished ? handlePerQExpire : null}
          timerPaused={isFinished}
        />

        {/* ── Navigation buttons ────────────────────────────────────────────── */}
        <div className="flex gap-2.5 mt-4">
          {/* Previous:
               - Custom / Global timer: always shown, free navigation
               - Per-question timer: hidden during active quiz, shown post-submit for review */}
          {(!isPerQ || quizResult) && (
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="select-none flex-1 py-2.5 rounded-lg border border-(--color-quiz-navigation-border) bg-(--color-quiz-navigation-bg) text-sm font-medium text-(--color-quiz-navigation-text) cursor-pointer enabled:hover:bg-(--color-quiz-navigation-hover-bg) disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <span className="inline-flex items-center justify-center gap-1.5">
                <Icon name="arrowLeft" size={16} />
                Previous
              </span>
            </button>
          )}

          {/* Next: disabled only while the submit API call is in-flight (isFinished=true but quizResult=null).
              After quizResult arrives, re-enabled so user can review answers. */}
          <button
            type="button"
            onClick={handleNext}
            disabled={isFinished && !quizResult}
            className="select-none flex-1 py-2.5 rounded-lg border border-(--color-quiz-navigation-border) bg-(--color-quiz-navigation-bg) text-sm font-semibold text-(--color-quiz-navigation-text) cursor-pointer enabled:hover:bg-(--color-quiz-navigation-hover-bg) disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span className="inline-flex items-center justify-center gap-1.5">
              {currentIndex === total - 1
                ? quizResult
                  ? "First"
                  : "Finish"
                : "Next"}
              <Icon name="arrowRight" size={16} />
            </span>
          </button>
        </div>

        {/* ── Result summary (shown after submission) ───────────────────────── */}
        {quizResult && (
          <div className="mt-6 rounded-2xl border border-(--color-border) bg-(--color-surface) p-6">
            <h2
              className="text-base font-semibold mb-4"
              style={{ color: "var(--color-text-primary)" }}
            >
              <span className="inline-flex items-center gap-2">
                <Icon name="trophy" size={17} />
                Results
              </span>
            </h2>

            {/* Stat grid: Score / Answered / Accuracy */}
            <div className="grid grid-cols-3 gap-3 mb-5 max-[420px]:grid-cols-1">
              {[
                {
                  value: (
                    <>
                      {quizResult.score}
                      <span
                        className="text-sm font-semibold"
                        style={{ color: "var(--color-quiz-result-score)" }}
                      >
                        /{quizResult.total}
                      </span>
                    </>
                  ),
                  label: "Score",
                  labelColor: "var(--color-quiz-result-score)",
                  valueColor: "var(--color-text-primary)",
                },
                {
                  value: quizResult.attempted,
                  label: "Answered",
                  labelColor: "var(--color-quiz-result-answered)",
                  valueColor: "var(--color-quiz-result-answered)",
                },
                {
                  value: `${accuracy}%`,
                  label: "Accuracy",
                  labelColor: "var(--color-quiz-result-accuracy)",
                  valueColor: "var(--color-quiz-result-accuracy)",
                },
              ].map(({ value, label, valueColor, labelColor }) => (
                <div
                  key={label}
                  className="rounded-xl p-3 text-center border border-(--color-quiz-result-stat-border) bg-(--color-quiz-result-stat-bg)"
                >
                  <p
                    className="text-xl font-bold"
                    style={{ color: valueColor }}
                  >
                    {value}
                  </p>
                  <p
                    className="text-sm mt-0.5 font-semibold"
                    style={{ color: labelColor }}
                  >
                    {label}
                  </p>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => toggleNewQuiz(false)}
                className="select-none flex-1 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-colors"
                style={{
                  background: "var(--color-secondary-action-bg)",
                  color: "var(--color-secondary-action-text)",
                }}
              >
                {isTimedMode ? "Change timer" : "Change filters"}
              </button>
              <button
                id="play-again-btn"
                type="button"
                onClick={handlePlayAgain}
                className="select-none flex-1 py-2.5 rounded-lg text-sm font-semibold cursor-pointer transition-colors"
                style={{
                  background: "var(--color-quiz-primary-action-bg)",
                  color: "#ffffff",
                }}
              >
                Play again ↺
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
