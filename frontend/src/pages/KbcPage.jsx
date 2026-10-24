import { useCallback, useEffect, useRef, useState } from "react";
import KbcConfirmDialog from "../components/kbc/KbcConfirmDialog";
import KbcGameResult from "../components/kbc/KbcGameResult";
import KbcPracticeQuestion from "../components/kbc/KbcPracticeQuestion";
import KbcQuestion from "../components/kbc/KbcQuestion";
import KbcTimer from "../components/kbc/KbcTimer";
import LifelineBar from "../components/kbc/LifelineBar";
import PrizeLadder from "../components/kbc/PrizeLadder";
import Icon from "../components/common/Icon";
import api from "../services/api";

function getErrorMessage(error) {
  return error?.message || "Something went wrong. Please try again.";
}

function withReceiveTime(gameState) {
  if (!Array.isArray(gameState.prizeLadder)) {
    throw new Error("The server response is missing the prize ladder.");
  }
  if (gameState.status === "IN_PROGRESS") {
    const expiresAt = Date.parse(gameState.expiresAt);
    const serverTime = Date.parse(gameState.serverTime);
    if (!Number.isFinite(expiresAt) || !Number.isFinite(serverTime)) {
      throw new Error("The server returned an invalid question deadline.");
    }
    if (!gameState.question) {
      throw new Error("The server response is missing the current question.");
    }
  }
  return { ...gameState, _receivedAt: Date.now() };
}

export default function KbcPage() {
  const [game, setGame] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [secondsRemaining, setSecondsRemaining] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [outcome, setOutcome] = useState(null);
  const [lifelineResult, setLifelineResult] = useState(null);
  const [confirmation, setConfirmation] = useState(null);
  const [correctFeedback, setCorrectFeedback] = useState(null);
  const [correctCountdown, setCorrectCountdown] = useState(10);
  const [wrongFeedback, setWrongFeedback] = useState(null);
  const [practiceQuestion, setPracticeQuestion] = useState(null);
  const [practiceSelectedIndex, setPracticeSelectedIndex] = useState(null);
  const [practiceResult, setPracticeResult] = useState(null);
  const [practiceBusy, setPracticeBusy] = useState(false);
  const [ladderOpen, setLadderOpen] = useState(false);
  const ladderButtonRef = useRef(null);
  const ladderCloseButtonRef = useRef(null);

  useEffect(() => {
    if (!ladderOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    const focusReturnTarget =
      [...document.querySelectorAll(".kbc-ladder-button")].find(
        (button) => button.getClientRects().length > 0,
      ) || ladderButtonRef.current;
    document.body.style.overflow = "hidden";
    ladderCloseButtonRef.current?.focus();
    const closeOnEscape = (event) =>
      event.key === "Escape" && setLadderOpen(false);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
      focusReturnTarget?.focus();
    };
  }, [ladderOpen]);

  useEffect(() => {
    if (
      !game ||
      game.status !== "IN_PROGRESS" ||
      outcome ||
      correctFeedback ||
      wrongFeedback
    )
      return undefined;

    const expiresAt = Date.parse(game.expiresAt);
    const serverTime = Date.parse(game.serverTime);
    const responseAge = Date.now() - game._receivedAt;
    const remainingMs = Math.max(0, expiresAt - serverTime - responseAge);
    const localDeadline = Date.now() + remainingMs;
    const updateCountdown = () => {
      setSecondsRemaining(
        Math.max(0, Math.ceil((localDeadline - Date.now()) / 1000)),
      );
    };
    updateCountdown();
    const intervalId = window.setInterval(updateCountdown, 250);
    const timeoutId = window.setTimeout(async () => {
      try {
        const updatedGame = withReceiveTime(await api.getKbcGame(game.gameId));
        setGame(updatedGame);
        if (updatedGame.status !== "IN_PROGRESS") {
          if (updatedGame.status === "TIMED_OUT")
            setPracticeQuestion(game.question);
          setOutcome({ game: updatedGame });
        }
      } catch (requestError) {
        setError(getErrorMessage(requestError));
      }
    }, remainingMs + 1700);

    return () => {
      window.clearInterval(intervalId);
      window.clearTimeout(timeoutId);
    };
  }, [game, outcome, correctFeedback, wrongFeedback]);

  const advanceAfterCorrect = useCallback(() => {
    if (!correctFeedback) return;
    if (correctFeedback.nextGame) {
      setGame(correctFeedback.nextGame);
      setSelectedIndex(null);
      setLifelineResult(null);
    } else {
      setGame(correctFeedback.finalOutcome.game);
      setOutcome(correctFeedback.finalOutcome);
    }
    setCorrectFeedback(null);
  }, [correctFeedback]);

  useEffect(() => {
    if (!correctFeedback) return undefined;

    const timeoutId = window.setTimeout(() => {
      advanceAfterCorrect();
    }, 10_000);
    const countdownId = window.setInterval(() => {
      setCorrectCountdown((seconds) => Math.max(0, seconds - 1));
    }, 1_000);

    return () => {
      window.clearTimeout(timeoutId);
      window.clearInterval(countdownId);
    };
  }, [correctFeedback, advanceAfterCorrect]);

  async function startGame() {
    setBusy(true);
    setError("");
    setOutcome(null);
    setCorrectFeedback(null);
    setWrongFeedback(null);
    setSelectedIndex(null);
    setLifelineResult(null);
    setPracticeQuestion(null);
    setPracticeSelectedIndex(null);
    setPracticeResult(null);
    try {
      setGame(withReceiveTime(await api.startKbcGame()));
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  }

  async function lockAnswer() {
    if (!game?.question || selectedIndex === null || busy) return;
    setBusy(true);
    setError("");
    try {
      const result = await api.answerKbcGame(game.gameId, {
        questionId: game.question.id,
        selectedIndex,
      });
      if (result.correct) {
        const finalGame = {
          ...game,
          status: result.status,
          currentPrize: result.prizeWon,
        };
        setCorrectFeedback({
          question: game.question,
          level: game.level,
          prizeWon: result.prizeWon,
          selectedIndex,
          correctIndex: result.correctIndex,
          nextGame: result.next ? withReceiveTime(result.next) : null,
          finalOutcome: result.next
            ? null
            : {
                game: finalGame,
                question: game.question,
                selectedIndex,
                correctIndex: result.correctIndex,
                correct: true,
              },
        });
        setCorrectCountdown(10);
      } else {
        const finalGame = {
          ...game,
          status: result.status,
          currentPrize: result.prizeWon,
        };
        if (result.status === "TIMED_OUT") {
          setGame(finalGame);
          setPracticeQuestion(game.question);
          setOutcome({ game: finalGame });
        } else {
          setWrongFeedback({
            game: finalGame,
            question: game.question,
            selectedIndex,
            correctIndex: result.correctIndex,
            correct: result.correct,
          });
        }
      }
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  }

  async function useLifeline(type) {
    if (!game || busy || !game.lifelinesAvailable?.includes(type)) return;
    setBusy(true);
    setError("");
    try {
      const result = await api.useKbcLifeline(game.gameId, type);
      setGame(withReceiveTime(result.state));
      setLifelineResult(result);
      if (type === "FLIP" || result.hiddenIndices?.includes(selectedIndex)) {
        setSelectedIndex(null);
      }
    } catch (requestError) {
      setError(getErrorMessage(requestError));
      if (requestError.code === "GAME_TIMED_OUT") {
        try {
          const finalGame = withReceiveTime(await api.getKbcGame(game.gameId));
          setGame(finalGame);
          if (finalGame.status !== "IN_PROGRESS") {
            if (finalGame.status === "TIMED_OUT")
              setPracticeQuestion(game.question);
            setOutcome({ game: finalGame });
          }
        } catch (refreshError) {
          setError(getErrorMessage(refreshError));
        }
      }
    } finally {
      setBusy(false);
    }
  }

  async function quitGame() {
    if (!game || busy) return;
    setConfirmation({ kind: "quit" });
  }

  async function confirmQuit() {
    if (!game || busy) return;
    setBusy(true);
    setError("");
    try {
      const finalGame = withReceiveTime(await api.quitKbcGame(game.gameId));
      setGame(finalGame);
      setLifelineResult(null);
      if (finalGame.status === "QUIT" || finalGame.status === "TIMED_OUT") {
        setPracticeQuestion(game.question);
        setPracticeSelectedIndex(null);
        setPracticeResult(null);
      }
      setOutcome({ game: finalGame });
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setBusy(false);
      setConfirmation(null);
    }
  }

  function playAgain() {
    setGame(null);
    setOutcome(null);
    setCorrectFeedback(null);
    setWrongFeedback(null);
    setSelectedIndex(null);
    setSecondsRemaining(null);
    setLifelineResult(null);
    setConfirmation(null);
    setPracticeQuestion(null);
    setPracticeSelectedIndex(null);
    setPracticeResult(null);
    setError("");
  }

  async function submitPracticeAnswer(answerIndex = practiceSelectedIndex) {
    if (
      !game?.gameId ||
      !practiceQuestion ||
      answerIndex === null ||
      practiceBusy
    )
      return;
    setPracticeBusy(true);
    setError("");
    try {
      const result = await api.practiceKbcAnswer(game.gameId, {
        questionId: practiceQuestion.id,
        selectedIndex: answerIndex,
      });
      setPracticeResult(result);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setPracticeBusy(false);
    }
  }

  return (
    <main className="kbc-game-screen relative min-h-[100dvh] overflow-x-clip bg-[radial-gradient(ellipse_at_50%_-12%,#28569b_0%,#122d5b_30%,#081735_70%,#050b1d_100%)] px-3 pt-2 pb-5 text-white [&_button:not(:disabled)]:transition-[transform,filter,box-shadow] [&_button:not(:disabled)]:duration-150 [&_button:not(:disabled):hover]:brightness-110 [&_button:not(:disabled):active]:scale-[0.98] [&_button:focus-visible]:outline-2 [&_button:focus-visible]:outline-[#6ccff6] [&_button:focus-visible]:outline-offset-2 sm:px-6 sm:pt-9 sm:pb-9">
      <div className="relative mx-auto max-w-[90rem]">
        <div
          className="pointer-events-none absolute left-1/2 top-0 -z-0 h-72 w-[min(60rem,100vw)] -translate-x-1/2 rounded-full bg-[#2988df]/10 blur-[100px]"
          aria-hidden="true"
        />
        {error && (
          <div
            role="alert"
            className="mb-5 rounded-lg border border-red-400/40 bg-red-500/10 p-3 text-base text-red-300"
          >
            {error}
          </div>
        )}

        {outcome ? (
          (outcome.game.status === "QUIT" ||
            outcome.game.status === "TIMED_OUT") &&
          practiceQuestion ? (
            <div className="grid gap-5 lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-start">
              <div className="kbc-ladder-column hidden min-w-0 lg:block">
                <PrizeLadder
                  prizeLadder={outcome.game.prizeLadder}
                  currentLevel={outcome.game.level}
                />
              </div>
              <section className="kbc-main-panel min-w-0 space-y-4">
                <KbcGameResult
                  outcome={outcome}
                  onPlayAgain={playAgain}
                  compact
                />
                <KbcPracticeQuestion
                  question={practiceQuestion}
                  selectedIndex={practiceSelectedIndex}
                  result={practiceResult}
                  busy={practiceBusy}
                  onSelect={setPracticeSelectedIndex}
                  onSubmit={submitPracticeAnswer}
                />
              </section>
            </div>
          ) : (
            <KbcGameResult outcome={outcome} onPlayAgain={playAgain} />
          )
        ) : correctFeedback ? (
          <div className="grid gap-5 lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-start">
            <div className="kbc-ladder-column hidden min-w-0 lg:block">
              <PrizeLadder
                prizeLadder={game.prizeLadder}
                currentLevel={correctFeedback.level}
              />
            </div>
            <section
              role="status"
              aria-live="assertive"
              className="kbc-main-panel kbc-correct-screen min-w-0 relative isolate flex min-h-[70dvh] flex-col items-center justify-center overflow-hidden rounded-2xl p-6 text-center text-white shadow-[0_1.25rem_4rem_rgb(0_0_0_/_35%)] sm:p-8"
            >
              <div
                className="kbc-confetti pointer-events-none absolute inset-0"
                aria-hidden="true"
              >
                {Array.from({ length: 18 }, (_, index) => (
                  <i key={index} />
                ))}
              </div>
              <div className="relative z-10 mb-8 grid min-h-32 w-full max-w-lg place-items-center">
                <div className="hidden" aria-hidden="true">
                  <span className="grid h-20 w-20 place-items-center rounded-full bg-[#16c978] text-white">
                    <Icon name="check" size={38} strokeWidth={2.4} />
                  </span>
                </div>
                {correctFeedback.nextGame && (
                  <div
                    className="kbc-prize-hex absolute inset-x-2 inset-y-0"
                    aria-label={`Next question prize: ${formatCurrency(correctFeedback.nextGame.prizeIfCorrect)}`}
                  >
                    <div className="kbc-prize-hex-inner grid h-full content-center justify-items-center px-8 py-4">
                      <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#f5c542]">
                        Next question prize
                      </p>
                      <p className="mt-2 bg-gradient-to-b from-white via-[#fff4c2] to-[#f5c542] bg-clip-text text-3xl font-black text-transparent sm:text-4xl">
                        {formatCurrency(
                          correctFeedback.nextGame.prizeIfCorrect,
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <p className="relative z-10 text-sm font-extrabold uppercase tracking-[0.3em] text-[#b7f6a5] [text-shadow:0_0_0.5rem_rgb(181_246_165_/_85%),0_0_1.2rem_rgb(245_197_66_/_65%)]">
                Correct answer
              </p>
              <h2 className="kbc-correct-title relative z-10 mt-3 text-4xl font-black [text-shadow:0_0_1.25rem_rgb(245_197_66_/_35%)] sm:text-5xl">
                That is correct!
              </h2>
              <p className="relative z-10 mt-3 text-lg text-white">
                Congratulations! You have won{" "}
                <span className="font-extrabold text-[#f5c542] [text-shadow:0_0_0.8rem_rgb(245_197_66_/_35%)]">
                  {formatCurrency(correctFeedback.prizeWon)}
                </span>
                .
              </p>
              <div className="relative z-10 mt-7 flex flex-col items-center gap-4">
                {correctFeedback.nextGame && (
                  <button
                    type="button"
                    onClick={advanceAfterCorrect}
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-[#ffe98b] via-[#f5c542] to-[#b8860b] px-6 py-3 text-sm font-extrabold text-[#101d3c] shadow-[0_0.45rem_1.5rem_rgb(245_197_66_/_28%),inset_0_1px_rgb(255_255_255_/_65%)] transition-[transform,box-shadow,filter] hover:scale-105 hover:shadow-[0_0.65rem_2rem_rgb(245_197_66_/_42%)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#fff1a8] disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Go to next question"
                  >
                    Next
                    <Icon name="arrowRight" size={18} />
                  </button>
                )}
                <div className="flex flex-col items-center gap-2">
                  <span className="text-[0.62rem] font-bold uppercase tracking-[0.22em] text-[#f5d977]">
                    Next question in
                  </span>
                  <div
                    className={`kbc-countdown-badge relative grid h-[5.25rem] w-[5.25rem] place-items-center rounded-full ${correctCountdown <= 3 ? "text-[#ff6b6b]" : "text-[#f5c542]"}`}
                    role="timer"
                    aria-label={`${correctFeedback.nextGame ? "Next question" : "Game result"} in ${correctCountdown} seconds`}
                  >
                    <svg
                      className="absolute inset-0 h-full w-full -rotate-90"
                      viewBox="0 0 52 52"
                      aria-hidden="true"
                    >
                      <circle
                        cx="26"
                        cy="26"
                        r="22"
                        fill="none"
                        stroke="currentColor"
                        strokeOpacity=".2"
                        strokeWidth="2.5"
                      />
                      <circle
                        cx="26"
                        cy="26"
                        r="22"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeDasharray="138.23"
                        strokeDashoffset={`${138.23 * (1 - correctCountdown / 10)}`}
                        className="transition-[stroke-dashoffset,color] duration-500"
                      />
                    </svg>
                    <span
                      key={correctCountdown}
                      className="kbc-countdown-number text-4xl font-black tabular-nums leading-none"
                    >
                      {correctCountdown}
                    </span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        ) : wrongFeedback ? (
          <div className="grid gap-5 lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-start">
            <div className="kbc-ladder-column hidden min-w-0 lg:block">
              <PrizeLadder
                prizeLadder={game.prizeLadder}
                currentLevel={game.level}
              />
            </div>
            <section
              className="kbc-main-panel min-w-0 flex min-h-[65dvh] flex-col justify-center gap-5 rounded-2xl border border-[#4164a2] bg-[#10234a] p-5 text-white shadow-[0_1rem_4rem_rgb(0_0_0_/_24%)] sm:p-8"
              role="status"
              aria-live="assertive"
            >
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.25em]">
                  Answer locked
                </p>
                <h2 className="mt-1 text-3xl font-black text-[#ff7777] sm:text-4xl">
                  That is incorrect
                </h2>
              </div>
              <LifelineBar
                available={game.lifelinesAvailable}
                disabled
                result={lifelineResult}
                question={wrongFeedback.question}
                onUse={() => {}}
              />
              <KbcQuestion
                question={wrongFeedback.question}
                selectedIndex={wrongFeedback.selectedIndex}
                correctIndex={wrongFeedback.correctIndex}
                revealCorrect
                disabled
                hiddenIndices={game.hiddenIndices}
              />
              {practiceQuestion && (
                <KbcPracticeQuestion
                  question={practiceQuestion}
                  selectedIndex={practiceSelectedIndex}
                  result={practiceResult}
                  busy={practiceBusy}
                  onSelect={setPracticeSelectedIndex}
                  onSubmit={submitPracticeAnswer}
                />
              )}
              <button
                type="button"
                onClick={() => {
                  setOutcome(wrongFeedback);
                  setWrongFeedback(null);
                }}
                className="mx-auto mt-2 rounded-lg bg-[#ffd23f] px-6 py-3 text-base font-bold text-[#101d3c]"
              >
                View game result
              </button>
            </section>
          </div>
        ) : game?.status === "IN_PROGRESS" ? (
          <>
            <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-start lg:gap-5">
              <section className="kbc-main-panel kbc-play-panel order-1 min-w-0 flex flex-col gap-4 min-h-[calc(100dvh-5.5rem)] pb-24 sm:mx-auto sm:w-full sm:max-w-3xl sm:gap-5 lg:order-2 lg:mx-0 lg:block lg:min-h-0 lg:max-w-none lg:space-y-5 lg:pb-0">
                <div className="kbc-head kbc-short-landscape-sticky sticky top-0 z-20 overflow-hidden rounded-2xl border border-[#4b73b2] bg-[linear-gradient(145deg,#142e5c_0%,#0d1e3f_100%)] shadow-[0_1rem_2.5rem_rgb(0_0_0_/_24%),inset_0_1px_rgb(255_255_255_/_5%)] lg:static">
                  <div className="kbc-head-row grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 p-2.5 sm:p-4 lg:flex lg:flex-wrap lg:justify-between lg:gap-4 lg:p-5">
                    <button
                      type="button"
                      onClick={quitGame}
                      disabled={busy}
                      className="min-h-11 rounded-full border border-[#7f4560]/70 px-3 text-sm font-bold text-[#d9e7ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6ccff6] disabled:opacity-50 lg:hidden"
                    >
                      Quit
                    </button>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center justify-center gap-2.5 lg:justify-start">
                        <span className="min-w-0 text-[0.7rem] font-extrabold uppercase tracking-[0.16em] text-[#9be5ff] [text-shadow:0_0_0.8rem_rgb(89_201_243_/_80%)]">
                          <span className="block min-w-0 truncate lg:hidden">
                            Q {game.level} ·{" "}
                            {formatCurrency(game.prizeIfCorrect)}
                          </span>
                          <span className="hidden lg:inline">
                            Question {game.level} of 15
                          </span>
                        </span>
                      </div>
                      <div className="mt-3 hidden flex-wrap items-baseline gap-x-5 gap-y-1 lg:flex">
                        <p className="text-sm font-semibold text-white sm:text-base">
                          Win{" "}
                          <span className="bg-gradient-to-b from-white via-[#fff4c2] to-[#f5c542] bg-clip-text font-black text-transparent">
                            {formatCurrency(game.prizeIfCorrect)}
                          </span>
                        </p>
                        <p className="text-xs text-[#8da0c0]">
                          Walk away with {formatCurrency(game.prizeIfWrong)}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0 lg:hidden">
                      <KbcTimer secondsRemaining={secondsRemaining} />
                    </div>
                    <div className="kbc-short-actions hidden items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setLadderOpen(true)}
                        className="kbc-ladder-button min-h-10 shrink-0 rounded-lg border border-[#6f8dbd] bg-[#173667] px-3 text-xs font-bold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6ccff6]"
                      >
                        Prize ladder
                      </button>
                      <button
                        type="button"
                        onClick={lockAnswer}
                        disabled={
                          busy ||
                          selectedIndex === null ||
                          secondsRemaining === 0
                        }
                        className="min-h-10 shrink-0 w-auto rounded-lg bg-[linear-gradient(100deg,#ffd23f_0%,#ffe889_100%)] px-3 text-xs font-extrabold text-[#101d3c] shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:bg-[#827348] disabled:bg-none disabled:text-white disabled:shadow-none"
                      >
                        {busy ? "Submittingâ€¦" : "Lock answer"}
                      </button>
                    </div>
                  </div>
                  <div
                    className="kbc-progress grid grid-cols-[repeat(15,minmax(0,1fr))] gap-1 bg-[#081630]/75 px-3 py-1.5 sm:px-4"
                    role="progressbar"
                    aria-label={`Progress: question ${game.level} of 15`}
                    aria-valuemin="1"
                    aria-valuemax="15"
                    aria-valuenow={game.level}
                  >
                    {Array.from({ length: 15 }, (_, index) => (
                      <span
                        key={index}
                        className={`h-1.5 rounded-full ${index + 1 === game.level ? "bg-[#ffd23f] shadow-[0_0_0.8rem_rgb(255_210_63_/_75%)]" : index + 1 < game.level ? "bg-[#a8872d]" : "bg-white/10"}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="kbc-lifelines">
                  <LifelineBar
                    available={game.lifelinesAvailable}
                    disabled={busy || secondsRemaining === 0}
                    result={lifelineResult}
                    question={game.question}
                    onUse={useLifeline}
                  />
                </div>
                <div className="kbc-question-area">
                  <KbcQuestion
                    question={game.question}
                    selectedIndex={selectedIndex}
                    onSelect={setSelectedIndex}
                    disabled={busy || secondsRemaining === 0}
                    hiddenIndices={game.hiddenIndices}
                    flipAnimation={lifelineResult?.type === "FLIP"}
                  />
                </div>
                {practiceQuestion && (
                  <KbcPracticeQuestion
                    question={practiceQuestion}
                    selectedIndex={practiceSelectedIndex}
                    result={practiceResult}
                    busy={practiceBusy}
                    onSelect={setPracticeSelectedIndex}
                    onSubmit={submitPracticeAnswer}
                  />
                )}

                <div className="kbc-desktop-controls hidden flex-wrap items-center justify-around gap-2 lg:flex">
                  <KbcTimer secondsRemaining={secondsRemaining} />
                  <div className="flex flex-wrap justify-end gap-3">
                    <button
                      type="button"
                      onClick={quitGame}
                      disabled={busy}
                      className="rounded-full border border-[#7f4560]/70 bg-transparent px-5 py-2 text-lg font-bold text-[#d9e7ff] transition hover:border-red-400 hover:bg-red-500/10 hover:text-[#ffb5b5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6ccff6] disabled:opacity-50"
                    >
                      Quit
                    </button>
                    <button
                      type="button"
                      onClick={lockAnswer}
                      disabled={
                        busy || selectedIndex === null || secondsRemaining === 0
                      }
                      className="rounded-full bg-[linear-gradient(100deg,#ffd23f_0%,#ffe889_100%)] px-6 py-2.5 text-lg font-extrabold text-[#101d3c] shadow-[0_0_1.25rem_rgb(255_210_255_/_28%)] hover:-translate-y-0.5 hover:shadow-[0_0_1.5rem_rgb(255_210_63_/_42%)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:bg-[#827348] disabled:bg-none disabled:text-white disabled:shadow-none disabled:hover:translate-y-0"
                    >
                      {busy ? "Submitting…" : "Lock answer"}
                    </button>
                  </div>
                </div>
                <div className="kbc-status min-h-6">
                  {secondsRemaining === 0 && (
                    <p
                      role="status"
                      className="text-right text-sm text-[#d9e7ff]"
                    >
                      Time is up. Finalizing your game…
                    </p>
                  )}
                </div>
              </section>
              <div className="kbc-ladder-column hidden min-w-0 order-2 lg:order-1 lg:block">
                <PrizeLadder
                  prizeLadder={game.prizeLadder}
                  currentLevel={game.level}
                />
              </div>
            </div>
            <div className="kbc-mobile-actions fixed inset-x-0 bottom-0 z-40 border-t border-white/15 bg-[#091832]/90 p-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] shadow-[0_-1rem_2rem_rgb(0_0_0_/_28%)] backdrop-blur-xl lg:hidden">
              <div className="mx-auto flex max-w-3xl gap-2">
                <button
                  ref={ladderButtonRef}
                  type="button"
                  onClick={() => setLadderOpen(true)}
                  className="kbc-ladder-button min-h-12 shrink-0 rounded-xl border border-[#6f8dbd] bg-[#173667] px-4 text-sm font-bold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6ccff6]"
                >
                  Prize ladder
                </button>
                <button
                  type="button"
                  onClick={lockAnswer}
                  disabled={
                    busy || selectedIndex === null || secondsRemaining === 0
                  }
                  className="min-h-12 flex-1 rounded-xl bg-[linear-gradient(100deg,#ffd23f_0%,#ffe889_100%)] px-5 text-base font-extrabold text-[#101d3c] shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:bg-[#827348] disabled:bg-none disabled:text-white disabled:shadow-none"
                >
                  {busy ? "Submitting…" : "Lock answer"}
                </button>
              </div>
            </div>
            {ladderOpen && (
              <div
                className="fixed inset-0 z-50 flex items-end bg-black/65 backdrop-blur-sm lg:hidden"
                onClick={() => setLadderOpen(false)}
              >
                <section
                  role="dialog"
                  aria-modal="true"
                  aria-label="Prize ladder"
                  className="max-h-[80dvh] w-full overflow-y-auto rounded-t-3xl border border-white/15 bg-[#0d1c39] p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] shadow-2xl motion-safe:animate-[kbc-sheet-in_220ms_ease-out]"
                  onClick={(event) => event.stopPropagation()}
                >
                  <div
                    className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-white/35"
                    aria-hidden="true"
                  />
                  <div className="mb-3 flex justify-end">
                    <button
                      ref={ladderCloseButtonRef}
                      type="button"
                      onClick={() => setLadderOpen(false)}
                      aria-label="Close prize ladder"
                      className="grid h-11 w-11 place-items-center rounded-full border border-white/25 text-xl text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6ccff6]"
                    >
                      ×
                    </button>
                  </div>
                  <PrizeLadder
                    prizeLadder={game.prizeLadder}
                    currentLevel={game.level}
                    scrollCurrentIntoView
                    variant="sheet"
                  />
                </section>
              </div>
            )}
          </>
        ) : (
          <section className="relative mx-auto max-w-2xl overflow-hidden rounded-3xl border border-[#4b73b2] bg-[radial-gradient(ellipse_at_50%_0%,#1b427c_0%,#11264b_50%,#0b1933_100%)] px-6 py-10 text-center shadow-[0_1.5rem_4rem_rgb(0_0_0_/_35%),inset_0_1px_rgb(255_255_255_/_6%)] sm:px-12 sm:py-14">
            <div
              className="mx-auto mb-5 grid h-20 w-20 place-items-center rounded-full border border-[#59c9f3]/40 bg-[#59c9f3]/10 text-[#9be5ff] shadow-[0_0_2.5rem_rgb(89_201_243_/_15%)]"
              aria-hidden="true"
            >
              <svg viewBox="0 0 48 48" className="h-10 w-10" fill="none">
                <path
                  d="M24 5 29 17l13 1-10 8 3 13-11-7-11 7 3-13-10-8 13-1 5-12Z"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinejoin="round"
                />
                <circle cx="24" cy="24" r="4" fill="#ffd95f" />
              </svg>
            </div>
            <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.26em] text-[#65c9f2]">
              Your moment is here
            </p>
            <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
              Ready for the hot seat?
            </h2>
            <p className="mx-auto my-4 max-w-md text-sm leading-6 text-[#c0d0eb] sm:text-base">
              Take on 15 questions, use your lifelines wisely, and climb all the
              way to ₹1 crore.
            </p>
            <div className="mb-6 flex flex-wrap justify-center gap-2">
              {["15 questions", "4 lifelines", "Timed rounds"].map(
                (feature) => (
                  <span
                    key={feature}
                    className="rounded-full border border-white/10 bg-[#081630]/50 px-3 py-1.5 text-xs font-semibold text-[#d9e7ff]"
                  >
                    {feature}
                  </span>
                ),
              )}
            </div>
            <button
              type="button"
              onClick={startGame}
              disabled={busy}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[linear-gradient(100deg,#ffd23f_0%,#ffe889_100%)] px-7 py-3 text-base font-extrabold text-[#101d3c] shadow-[0_0.65rem_1.75rem_rgb(255_210_63_/_22%)] transition hover:-translate-y-0.5 hover:shadow-[0_0.9rem_2rem_rgb(255_210_63_/_30%)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ffe889] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? "Starting…" : "Start KBC"}
              <Icon name="arrowRight" size={20} />
            </button>
          </section>
        )}
      </div>
      {confirmation && (
        <KbcConfirmDialog
          title="Quit this game?"
          message={`You will take home ${formatCurrency(game.currentPrize)}.`}
          confirmLabel="Quit game"
          busy={busy}
          onCancel={() => setConfirmation(null)}
          onConfirm={confirmQuit}
        />
      )}
    </main>
  );
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
