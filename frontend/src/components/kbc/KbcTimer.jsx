export default function KbcTimer({ secondsRemaining }) {
  const visibleSeconds = secondsRemaining ?? 0;
  const urgent = visibleSeconds <= 10;
  const red = visibleSeconds <= 5;
  const amber = visibleSeconds <= 10;
  const minutes = Math.floor(visibleSeconds / 60);
  const seconds = visibleSeconds % 60;
  const progress = Math.max(0, Math.min(1, visibleSeconds / 30));
  const circumference = 2 * Math.PI * 24;
  return (
    <div
      role="timer"
      aria-live={urgent ? "assertive" : "off"}
      aria-label={`${visibleSeconds} seconds remaining`}
      className={`kbc-timer flex min-w-[6.1rem] shrink-0 items-center justify-center gap-1 rounded-full border border-[#8e773c] bg-[#0b1c3b]/90 py-1 pl-1 pr-2 text-base font-extrabold tabular-nums tracking-wider shadow-[0_0.4rem_1rem_rgb(0_0_0_/_22%)] sm:w-auto sm:gap-2 sm:py-1.5 sm:pl-1.5 sm:pr-4 sm:text-lg ${red ? "kbc-timer-tick border-red-400/80 text-[#ff9999]" : amber ? "text-[#ffd071]" : "text-white"}`}
    >
      <svg
        viewBox="0 0 56 56"
        className="h-10 w-10 flex-[0_0_auto] -rotate-90 sm:h-12 sm:w-12"
        aria-hidden="true"
      >
        <circle
          cx="28"
          cy="28"
          r="24"
          fill="none"
          stroke="rgb(255 255 255 / 12%)"
          strokeWidth="3"
        />
        <circle
          cx="28"
          cy="28"
          r="24"
          fill="none"
          stroke={red ? "#ff5555" : amber ? "#ffb547" : "#ffd23f"}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress)}
          className="transition-[stroke-dashoffset] duration-300 ease-linear"
        />
      </svg>
      <span className="min-w-[2.7rem] text-center tabular-nums">
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </span>
    </div>
  );
}
