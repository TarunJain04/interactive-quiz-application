import {useEffect, useRef} from "react";

const formatCurrency = (amount) => new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
}).format(amount);

export default function PrizeLadder({prizeLadder = [], currentLevel, scrollCurrentIntoView = false, variant = "default"}) {
    const currentRef = useRef(null);
    useEffect(() => {
        if (scrollCurrentIntoView) currentRef.current?.scrollIntoView({block: "center"});
    }, [currentLevel, scrollCurrentIntoView]);
    return (
        <aside
            aria-label="Prize ladder"
            className={`kbc-prize-ladder min-w-0 rounded-2xl ${variant === "sheet" ? "bg-transparent p-0 shadow-none" : "bg-[radial-gradient(circle_at_20%_0%,rgb(44_105_190_/_32%),transparent_42%),linear-gradient(160deg,#17396e_0%,#0d1c39_100%)] p-4 shadow-[0_1rem_2.5rem_rgb(0_0_0_/_24%),inset_0_1rem_2rem_rgb(34_88_157_/_13%)] sm:p-5"}`}
        >
            <div className="mb-3 flex items-center justify-between gap-2 pb-1">
                <div>
                    <h2 className="text-base font-extrabold uppercase tracking-wider text-white">Prize ladder</h2>
                    <span
                        className="mt-1.5 block h-0.5 w-14 rounded-full bg-[linear-gradient(90deg,#ffd84d,#f5b82e,transparent)]"
                        aria-hidden="true"/>
                </div>
                <span className="shrink-0 font-sans text-base font-extrabold tracking-wide text-[#E2C778]">
  15 Levels
</span></div>
            <ol className="flex flex-col gap-0.5">
                {[...prizeLadder].reverse().map(({level, amount, checkpoint}) => {
                    const current = level === currentLevel;
                    const passed = level < currentLevel;
                    return (
                        <li
                            key={level}
                            ref={current ? currentRef : undefined}
                            aria-current={current ? "step" : undefined}
                            className={`relative flex min-h-8 items-center justify-between rounded-lg px-3 py-1.5 text-[0.9rem] transition-[background-color,color,transform,box-shadow,opacity] duration-500 ease-out ${
                                current
                                    ? "z-10 scale-[1.025] animate-[kbc-ladder-pulse_3.2s_ease-in-out_infinite] bg-[linear-gradient(100deg,#ffd84d_0%,#f5b82e_100%)] font-extrabold text-[#101d3c] shadow-[0_0_1.4rem_rgb(255_216_77_/_38%),inset_0_1px_rgb(255_255_255_/_60%)]"
                                    : checkpoint
                                        ? "bg-[#ffd84d]/10 font-bold text-[#ffe477] shadow-[inset_0_0_1rem_rgb(255_216_77_/_6%)]"
                                        : `${passed ? "text-[#a9c3e8]" : level === 15 ? "text-[#ffe477]" : "text-[#e5efff]"} ${passed ? "font-medium" : "font-semibold"} ${level === 15 ? "kbc-ladder-shimmer" : ""} after:absolute after:bottom-[-2px] after:left-3 after:right-3 after:h-px after:bg-white/[0.08] after:content-[''] last:after:hidden`
                            }`}
                        >
              <span className="flex w-[5.25rem] shrink-0 items-center gap-1.5 tabular-nums">
                {passed && !checkpoint &&
                    <svg viewBox="0 0 20 20" className="h-4 w-4 text-[#6ee7a0]" fill="none" aria-label="Completed">
                        <path d="m4 10 4 4 8-8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"
                              strokeLinejoin="round"/>
                    </svg>}
                  {checkpoint && <svg viewBox="0 0 20 20"
                                      className={`h-3.5 w-3.5 ${current ? "text-[#101d3c]" : "text-[#ffd84d]"}`}
                                      fill="currentColor" aria-label="Safe level">
                      <path d="m10 1 9 9-9 9-9-9 9-9Z"/>
                  </svg>}
                  {level === 15 &&
                      <svg viewBox="0 0 20 20" className={`h-4 w-4 ${current ? "text-[#101d3c]" : "text-[#ffd84d]"}`}
                           fill="currentColor" aria-label="Top prize">
                          <path d="m3 4 4 3 3-5 3 5 4-3-1 9H4L3 4Zm2 11h10v2H5v-2Z"/>
                      </svg>}
                  <span>{level}</span>

              </span>
                            <span
                                className={`min-w-0 text-right tabular-nums ${current ? "font-extrabold text-[#101d3c]" : checkpoint ? "font-bold text-[#ffe477]" : level === 15 ? "font-extrabold text-[#ffe477]" : ""}`}>{formatCurrency(amount)}</span>
                        </li>
                    );
                })}
            </ol>
        </aside>
    );
}
