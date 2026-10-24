const LETTERS = ["A", "B", "C", "D"];

export default function KbcQuestion({
  question,
  selectedIndex,
  onSelect,
  disabled = false,
  correctIndex,
  hiddenIndices = [],
  revealCorrect = false,
  flipAnimation = false,
}) {
  if (!question) return null;

  return (
    <section
      key={question.id}
      className={`${flipAnimation ? "kbc-question-card origin-center backface-hidden" : ""} kbc-question-box relative flex flex-1 flex-col w-full min-w-0 max-w-full rounded-2xl border border-[#a9852e] bg-[linear-gradient(145deg,#d8b74e_0%,#755411_50%,#e4c45b_100%)] p-[2px] shadow-[0_0_2rem_rgb(245_197_66_/_18%),0_1rem_3rem_rgb(0_0_0_/_30%)] md:rounded-none md:[clip-path:polygon(0_50%,4%_0,96%_0,100%_50%,96%_100%,4%_100%)] lg:flex-none`}
    >
      <div className="kbc-question-inner flex flex-1 min-w-0 flex-col justify-start max-h-[min(70dvh,38rem)] w-full max-w-full overflow-y-auto rounded-[calc(1rem-2px)] border border-[rgb(255_235_161_/_58%)] bg-[radial-gradient(ellipse_at_50%_0%,#214780_0%,#10264d_52%,#0a1936_100%)] px-4 py-5 shadow-[inset_0_0_2rem_rgb(255_210_63_/_10%)] md:rounded-none md:[clip-path:polygon(0_50%,2.5%_0,97.5%_0,100%_50%,97.5%_100%,2.5%_100%)] lg:max-h-none lg:flex-none lg:overflow-visible sm:px-10 sm:py-9">
        <h2 className="mx-auto mb-5 max-w-4xl break-words text-center text-base font-bold leading-[1.3] text-white [text-shadow:0_1px_8px_rgb(255_255_255_/_15%)] sm:mb-7 sm:text-xl lg:text-2xl">
          {question.question}
        </h2>
        <ol className="kbc-options grid w-full min-w-0 max-w-full grid-cols-1 gap-3 lg:grid-cols-2">
          {question.choices.map((choice, index) => {
            if (hiddenIndices.includes(index)) {
              return (
                <li key={`${question.id}-${index}`} aria-hidden="true">
                  <div className="min-h-14 rounded-xl border border-dashed border-white/30 bg-[#020f28]/25 sm:min-h-16 md:rounded-none md:[clip-path:polygon(0_50%,5%_0,95%_0,100%_50%,95%_100%,5%_100%)]" />
                </li>
              );
            }
            const isSelected = selectedIndex === index;
            const isCorrect = revealCorrect && correctIndex === index;
            const isIncorrect = revealCorrect && isSelected && !isCorrect;
            return (
              <li key={`${question.id}-${index}`}>
                <button
                  type="button"
                  onClick={() => onSelect(index)}
                  disabled={disabled}
                  aria-pressed={isSelected}
                  className={`flex min-h-14 w-full items-center gap-3 rounded-xl border px-3 py-3 text-left text-base text-white transition-[transform,background-color,border-color,box-shadow] duration-200 break-words focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#fff1a8] disabled:cursor-default sm:min-h-16 sm:px-5 sm:text-lg md:rounded-none md:[clip-path:polygon(0_50%,5%_0,95%_0,100%_50%,95%_100%,5%_100%)] ${
                    isCorrect
                      ? "animate-pulse border-[#55f5a8] bg-[#10a957] shadow-[0_0_1.5rem_rgb(55_255_146_/_40%)]"
                      : isIncorrect
                        ? "animate-pulse border-[#ff9b9b] bg-red-600 shadow-[0_0_1.5rem_rgb(255_53_53_/_45%)]"
                        : isSelected
                          ? `scale-[1.01] border-[#ffcf4a] bg-[linear-gradient(100deg,#ffd23f,#ffe889)] !text-[#101d3c] shadow-[0_0_1.25rem_rgb(255_210_63_/_30%)] ${disabled && !revealCorrect ? "animate-[kbc-lock-pulse_1.2s_ease-in-out_infinite]" : ""}`
                          : "border-[#a58a45] bg-[linear-gradient(120deg,#173667,#0d2147)] hover:-translate-y-0.5 hover:border-[#ffda55] hover:shadow-[0_0_1rem_rgb(255_210_63_/_28%)]"
                  }`}
                  data-state={
                    isCorrect
                      ? "correct"
                      : isIncorrect
                        ? "incorrect"
                        : isSelected
                          ? "selected"
                          : "default"
                  }
                >
                  <span
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border text-sm font-extrabold ${isCorrect ? "border-white/55 bg-white/15 text-white" : isIncorrect ? "border-white/45 bg-white/10 text-white" : "border-[#ffe477] bg-[#ffd23f] text-[#101d3c]"}`}
                    aria-hidden="true"
                  >
                    {LETTERS[index]}
                  </span>
                  <span className="min-w-0 break-words leading-snug">
                    {choice}
                  </span>
                  {(isCorrect || isIncorrect || isSelected) && (
                    <span
                      className="ml-auto shrink-0 font-black"
                      aria-hidden="true"
                    >
                      {isCorrect ? "✓" : isIncorrect ? "✗" : "✓"}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
