import { useEffect, useRef, useState } from "react";

/**
 * useTimer — generic countdown hook.
 *
 * @param {number}   duration   - Seconds to count down from.
 * @param {*}        resetKey   - Any value; changing it resets the timer back
 *                               to `duration` (use `currentIndex` for per-q mode).
 * @param {Function} onExpire   - Called once when the countdown reaches zero.
 * @param {boolean}  paused     - When true the ticker is suspended (e.g. after submit).
 *
 * @returns {{ timeLeft: number, pct: number }}
 *   - timeLeft : seconds remaining
 *   - pct      : 0–100 percentage of time remaining (for progress rings / bars)
 */
export function useTimer({ duration, resetKey, onExpire, paused = false }) {
  const [timeLeft, setTimeLeft] = useState(duration);

  // Keep a stable ref to the callback so the effect doesn't need to re-run
  // every time the parent re-renders with a new function reference.
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  // Reset the countdown whenever duration or resetKey changes.
  // (resetKey = questionIndex for per-q mode, or a constant for global mode)
  useEffect(() => {
    setTimeLeft(duration);
  }, [duration, resetKey]);

  // The actual tick — runs every second unless paused or expired.
  useEffect(() => {
    if (paused) return;

    if (timeLeft <= 0) {
      // Fire the callback; guard against stale closures via ref.
      onExpireRef.current?.();
      return;
    }

    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timeLeft, paused]);

  return {
    timeLeft,
    // Percentage of time remaining relative to the full duration (for bars/rings)
    pct: Math.round((timeLeft / duration) * 100),
  };
}
