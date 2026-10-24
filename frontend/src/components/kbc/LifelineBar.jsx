const LIFELINES = [
    {type: "FIFTY_FIFTY", label: "50:50", description: "Remove two wrong options", image: "/kbc-lifeline-50-50.png"},
    {
        type: "AUDIENCE_POLL",
        label: "Audience Poll",
        description: "See what the audience picks",
        image: "/kbc-lifeline-audience.png"
    },
    {
        type: "PHONE_FRIEND",
        label: "Phone a friend",
        description: "Get a friend's suggestion",
        image: "/kbc-lifeline-phone-friend.png"
    },
    {type: "FLIP", label: "Flip", description: "Swap for a new question", image: "/kbc-lifeline-flip.png"},
];

const LETTERS = ["A", "B", "C", "D"];
export default function LifelineBar({
                                        available = [],
                                        disabled = false,
                                        result,
                                        question,
                                        onUse,
                                    }) {
    return (
        <section
            className="relative rounded-2xl bg-[linear-gradient(145deg,#122955_0%,#0d1e3f_100%)] p-1.5 sm:p-2"
            aria-label="Lifelines"
        >
            <div className="grid grid-cols-4 gap-2">
                {LIFELINES.map(({type, label, description, image}) => {
                    const isAvailable = available.includes(type);
                    return (
                        <button
                            key={type}
                            type="button"
                            onClick={() => onUse(type)}
                            disabled={disabled || !isAvailable}
                            aria-label={label}
                            title={`${label}: ${description}`}
                            aria-description={description}
                            className={`kbc-lifeline flex items-center min-h-11 w-full max-w-[4.5rem] justify-self-center overflow-hidden rounded-lg p-0 transition-[transform,box-shadow] duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6ccff6] disabled:cursor-not-allowed disabled:opacity-45 hover:-translate-y-0.5 sm:max-w-24 lg:w-3/5 lg:max-w-full ${
                                isAvailable
                                    ? "hover:shadow-[0_0_1.25rem_rgb(89_201_243_/_18%)]"
                                    : "grayscale"
                            }`}
                        >
                            <img src={image} alt="" aria-hidden="true" className="block h-auto w-full"/>
                        </button>
                    );
                })}
            </div>

            {result && result.type !== "FLIP" && (
                <div
                    role="status"
                    className="mt-2 max-h-35 w-full overflow-y-auto rounded-lg border border-[#4164a2] bg-[#10234a] p-2 text-white shadow-lg sm:mt-4 sm:max-h-none sm:overflow-visible sm:p-3 sm:shadow-none"
                >
                    {result.type === "FIFTY_FIFTY" && (
                        <p className="text-sm">Two incorrect answers have been removed.</p>
                    )}
                    {result.type === "AUDIENCE_POLL" && (
                        <>
                            <p className="mb-3 text-sm font-semibold">Audience poll</p>
                            <div className="space-y-2">
                                {(result.percentages || []).map((percentage, index) => (
                                    <div key={index}
                                         className="grid grid-cols-[1.5rem_minmax(0,1fr)_2.5rem] items-center gap-2 text-xs">
                                        <span>{LETTERS[index]}</span>
                                        <div className="h-2 overflow-hidden rounded-full bg-[#4164a2]">
                                            <div className="h-full rounded-full bg-[#ffd23f]"
                                                 style={{width: `${percentage}%`}}/>
                                        </div>
                                        <span className="text-right tabular-nums">{percentage}%</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                    {result.type === "PHONE_FRIEND" && (
                        <p className="text-sm">
                            Your friend suggests <strong>{LETTERS[result.suggestedIndex] || "an answer"}</strong>
                            {Number.isFinite(result.confidence) ? ` (${result.confidence}% confidence)` : ""}.
                        </p>
                    )}
                    {result.type === "AUDIENCE_POLL" && !question && (
                        <p className="text-sm">Poll results are unavailable.</p>
                    )}
                </div>
            )}
        </section>
    );
}
