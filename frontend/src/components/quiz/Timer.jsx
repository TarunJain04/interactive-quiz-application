import { useTimer } from "../../hooks/useTimer";
import Icon from "../common/Icon";

/**
 * Timer — countdown display component.
 *
 * Wraps `useTimer` and renders a compact pill showing remaining time.
 * The pill turns amber below 30 % and red below 15 % of the original duration,
 * giving the user a visual urgency cue without any extra logic in the parent.
 *
 * Props
 * ─────
 * @prop {number}   duration   - Total seconds for this countdown.
 * @prop {*}        resetKey   - Forwarded to useTimer; changing it resets the countdown.
 * @prop {Function} onExpire   - Called when timeLeft hits zero.
 * @prop {boolean}  [paused]   - Suspends the tick (default false).
 */
export default function Timer({ duration, resetKey, onExpire, paused = false }) {
  const { timeLeft, pct } = useTimer({ duration, resetKey, onExpire, paused });

  // Format mm:ss so longer durations stay readable
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const display = minutes > 0
    ? `${minutes}:${String(seconds).padStart(2, "0")}`
    : `${seconds}s`;

  // Urgency colour thresholds (driven by percentage remaining)
  const urgent  = pct <= 15; // red
  const warning = pct <= 30; // amber

  const color = urgent
    ? "#f87171"                             // red-400
    : warning
    ? "var(--color-question-difficulty-label)"  // amber token
    : "var(--color-quiz-result-answered)";  // teal / green token

  return (
    <div
      aria-live="polite"
      aria-label={`Time remaining: ${display}`}
      className="inline-flex items-center gap-1.5 tabular-nums text-sm font-semibold"
      style={{ color }}
    >
      <Icon name="clock" size={15} strokeWidth={2} />
      {display}
    </div>
  );
}
