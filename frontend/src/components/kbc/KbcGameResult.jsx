const STATUS_LABELS = {
    WON: "You won!",
    LOST: "Game over",
    QUIT: "You walked away",
    TIMED_OUT: "Time's up",
};

const formatCurrency = (amount) => new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
}).format(amount);

export default function KbcGameResult({
    outcome,
    onPlayAgain,
    compact = false,
}) {
    const {game} = outcome;
    const won = game.status === "WON";
    const timedOut = game.status === "TIMED_OUT";
    const accent = won
        ? "border-[#ffd95f]/35 bg-[#ffd95f]/10 text-[#ffe27e] shadow-[0_0_2rem_rgb(255_217_95_/_12%)]"
        : timedOut
            ? "bg-[#59c9f3]/10 text-[#b9efff] shadow-[0_0_2rem_rgb(89_201_243_/_18%)]"
            : "bg-[#7d9bc9]/10 text-[#c3d5f3]";
    return (
        <section
            className={`relative flex flex-col items-center overflow-hidden rounded-3xl bg-[radial-gradient(circle_at_50%_18%,rgb(40_103_182_/_26%),transparent_38%),linear-gradient(145deg,#142e5c_0%,#0a1934_100%)] text-center shadow-[0_1.25rem_4rem_rgb(0_0_0_/_30%),inset_0_1px_rgb(255_255_255_/_7%)] ${compact ? "p-5 sm:p-6" : "mx-auto min-h-[65vh] w-full max-w-5xl justify-center p-8 sm:p-12"}`}
        >
            <div className={`grid place-items-center ${timedOut ? (compact ? "mb-2 h-20 w-24" : "mb-4 h-28 w-36") : `rounded-full border ${accent} ${compact ? "mb-2 h-14 w-14" : "mb-4 h-20 w-20"}`}`} aria-hidden="true">
                <svg viewBox="0 0 160 140" fill="none" className={timedOut ? "h-full w-full" : compact ? "h-7 w-7" : "h-10 w-10"}>
                    {timedOut ? (
                        <>
                            <circle cx="72" cy="70" r="50" stroke="#168df5" strokeWidth="10" />
                            <path d="M37 35 27 22M107 35l10-13" stroke="#168df5" strokeWidth="10" strokeLinecap="round" />
                            <path d="M72 35v35l27 17" stroke="#0750ad" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
                            <circle cx="72" cy="70" r="7" fill="#0750ad" />
                            <path d="M72 14v10M72 116v10M16 70h10M118 70h10" stroke="#0750ad" strokeWidth="7" strokeLinecap="round" />
                            <circle cx="121" cy="104" r="27" fill="#ff312e" />
                            <path d="M121 89v22" stroke="white" strokeWidth="7" strokeLinecap="round" />
                            <circle cx="121" cy="121" r="4" fill="white" />
                        </>
                    ) : won ? (
                        <>
                            <path d="M16 8h16v8c0 7-3.6 11-8 11s-8-4-8-11V8Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
                            <path d="M16 12H9v3c0 5 3 8 8 8m15-11h7v3c0 5-3 8-8 8m-7 3v7m-7 4h14M18 8V5h12v3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </>
                    ) : (
                        <path d="M24 7v25m0 0-8-8m8 8 8-8M12 39h24" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    )}
                </svg>
            </div>
            <p className="mb-1 text-[0.62rem] font-extrabold uppercase tracking-[0.24em] text-[#70cdf2]">
                {won ? "Fantastic achievement" : timedOut ? "The clock ran out" : "Your game has ended"}
            </p>
            <h2 className={`font-black text-white ${compact ? "text-2xl" : "text-3xl sm:text-4xl"}`}>
                {STATUS_LABELS[game.status] || "Game finished"}
            </h2>
            <p className={`${compact ? "mt-2 text-sm" : "mt-5 text-lg"} text-[#d9e7ff]`}>
                {game.status === "QUIT" ? "Prize you take home" : "Prize won"}
            </p>
            <p className={`mt-1 font-black tracking-tight text-[#ffda55] ${compact ? "text-3xl" : "text-4xl sm:text-5xl"}`}>
                {formatCurrency(game.currentPrize)}
            </p>

            <button
                type="button"
                onClick={onPlayAgain}
                className={`rounded-xl bg-[linear-gradient(100deg,#ffd23f_0%,#ffe889_100%)] font-extrabold text-[#101d3c] shadow-[0_0.5rem_1.5rem_rgb(255_210_63_/_18%)] transition hover:-translate-y-0.5 hover:shadow-[0_0.75rem_1.75rem_rgb(255_210_63_/_26%)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#ffe889] ${compact ? "mt-4 px-5 py-2.5 text-base" : "mt-8 px-7 py-3 text-lg"}`}
            >
                Play again
            </button>
        </section>
    );
}
