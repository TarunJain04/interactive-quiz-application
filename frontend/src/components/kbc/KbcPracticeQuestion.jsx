import KbcQuestion from "./KbcQuestion";

export default function KbcPracticeQuestion({
    question,
    selectedIndex,
    result,
    busy = false,
    onSelect,
    onSubmit,
}) {
    if (!question) return null;

    function handleSelect(index) {
        onSelect(index);
        onSubmit(index);
    }

    return (
        <section className="rounded-2xl border border-[#4b73b2] bg-[linear-gradient(145deg,#122955_0%,#0b1b38_100%)] p-4 shadow-[0_1rem_2.5rem_rgb(0_0_0_/_20%),inset_0_1px_rgb(255_255_255_/_4%)] sm:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div>
                    <p className="mb-1 text-[0.62rem] font-extrabold uppercase tracking-[0.22em] text-[#65c9f2]">Before you go</p>
                    <h2 className="text-lg font-extrabold tracking-tight text-white">Which option would you choose?</h2>
                </div>
            </div>
            <KbcQuestion
                question={question}
                selectedIndex={selectedIndex}
                onSelect={handleSelect}
                disabled={busy || result !== null}
                correctIndex={result?.correctIndex}
                revealCorrect={result !== null}
            />
            {result && (
                <p role="status" className="mt-3 text-center font-semibold text-[#d9e7ff]">
                    {result.correct
                        ? "Correct!"
                        : `Not quite — the correct answer is ${question.choices[result.correctIndex]}.`}
                </p>
            )}
            {false && <button
                    type="button"
                    onClick={onSubmit}
                    disabled={busy || selectedIndex === null}
                    className="mt-4 w-full rounded-lg bg-[#ffd23f] px-5 py-2.5 text-sm font-semibold text-[#101d3c] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {busy ? "Checking…" : "Check answer"}
                </button>}
        </section>
    );
}
