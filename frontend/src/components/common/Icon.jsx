const PATHS = {
  arrowLeft: <path d="m15 18-6-6 6-6" />,
  arrowRight: <path d="m9 18 6-6-6-6" />,
  check: <path d="m5 12 4 4L19 6" />,
  brain: <path d="M9.5 4a3.5 3.5 0 0 0-3.4 4.3A3.5 3.5 0 0 0 7 15h2m5.5-11a3.5 3.5 0 0 1 3.4 4.3A3.5 3.5 0 0 1 17 15h-2m-5.5 5v-4m5.5 4v-4M9 8h.01M15 8h.01M9 12h.01M15 12h.01M12 4v16" />,
  clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3 2" /></>,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.2 2.4 3.3 5.4 3.3 9S14.2 18.6 12 21c-2.2-2.4-3.3-5.4-3.3-9S9.8 5.4 12 3Z" /></>,
  helpCircle: <><circle cx="12" cy="12" r="9" /><path d="M9.8 9a2.3 2.3 0 1 1 3.7 1.8c-.9.7-1.5 1-1.5 2.2M12 16h.01" /></>,
  play: <path d="m9 6 9 6-9 6V6Z" />,
  trophy: <><path d="M8 4h8v5a4 4 0 0 1-8 0V4Z" /><path d="M8 6H4v2a4 4 0 0 0 4 4m8-6h4v2a4 4 0 0 1-4 4m-4 4v3m-4 0h8" /></>,
  zap: <path d="m13 2-8 12h6l-1 8 8-12h-6l1-8Z" />,
};

export default function Icon({ name, size = 18, strokeWidth = 1.8, label, className = "", style }) {
  return (
    <svg
      aria-hidden={label ? undefined : "true"}
      aria-label={label}
      className={`shrink-0 ${className}`}
      fill="none"
      height={size}
      role={label ? "img" : undefined}
      style={style}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
      viewBox="0 0 24 24"
      width={size}
    >
      {PATHS[name]}
    </svg>
  );
}
