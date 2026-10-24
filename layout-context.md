# Layout context for the KBC game screen

## `frontend/src/pages/KbcPage.jsx` — page composition

```jsx
<main className="kbc-game-screen relative min-h-[100dvh] overflow-x-clip bg-[radial-gradient(ellipse_at_50%_-12%,#28569b_0%,#122d5b_30%,#081735_70%,#050b1d_100%)] px-3 py-5 text-white [&_button:not(:disabled)]:transition-[transform,filter,box-shadow] [&_button:not(:disabled)]:duration-150 [&_button:not(:disabled):hover]:brightness-110 [&_button:not(:disabled):active]:scale-[0.98] sm:px-6 sm:py-9">
  <div className="relative mx-auto max-w-[90rem]">
    <div className="pointer-events-none absolute left-1/2 top-0 -z-0 h-72 w-[min(60rem,100vw)] -translate-x-1/2 rounded-full bg-[#2988df]/10 blur-[100px]" aria-hidden="true" />
    {/* ... */}
    {game?.status === "IN_PROGRESS" ? (
      <div className="kbc-content-grid grid gap-5">
        <section className="kbc-main-panel order-1 min-w-0 space-y-4 sm:space-y-5 lg:order-2">
          {/* Info card */}
          <div className="overflow-hidden rounded-2xl border border-[#4b73b2] bg-[linear-gradient(145deg,#142e5c_0%,#0d1e3f_100%)] shadow-[0_1rem_2.5rem_rgb(0_0_0_/_24%),inset_0_1px_rgb(255_255_255_/_5%)]">
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-[0.7rem] font-extrabold uppercase tracking-[0.16em] text-[#9be5ff] [text-shadow:0_0_0.8rem_rgb(89_201_243_/_80%)]">Question {game.level} of 15</span>
                </div>
                <div className="mt-3 flex flex-wrap items-baseline gap-x-5 gap-y-1">
                  <p className="text-sm font-semibold text-white sm:text-base">Win <span className="bg-gradient-to-b from-white via-[#fff4c2] to-[#f5c542] bg-clip-text font-black text-transparent">{/* ... */}</span></p>
                  <p className="text-xs text-[#8da0c0]">{/* ... */}</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-[repeat(15,minmax(0,1fr))] gap-1 bg-[#081630]/75 px-4 py-2" role="progressbar" aria-label={/* ... */} aria-valuemin="1" aria-valuemax="15" aria-valuenow={/* ... */}>
              {/* 15 progress dots */}
              <span className={`h-1.5 rounded-full ${/* ... */ "bg-white/10"}`} />
            </div>
          </div>
          <LifelineBar />
          <KbcQuestion />
          {/* ... */}
          <div className="flex flex-wrap items-center justify-around gap-2">
            <KbcTimer />
            <div className="flex flex-wrap justify-end gap-3">
              <button className="rounded-full border border-[#7f4560]/70 bg-transparent px-5 py-2 text-lg font-bold text-[#d9e7ff] transition hover:border-red-400 hover:bg-red-500/10 hover:text-[#ffb5b5] disabled:opacity-50">Quit</button>
              <button className="rounded-full bg-[linear-gradient(100deg,#ffd23f_0%,#ffe889_100%)] px-6 py-2.5 text-lg font-extrabold text-[#101d3c] shadow-[0_0_1.25rem_rgb(255_210_255_/_28%)] hover:-translate-y-0.5 hover:shadow-[0_0_1.5rem_rgb(255_210_63_/_42%)] disabled:cursor-not-allowed disabled:bg-[#827348] disabled:text-[#888] disabled:shadow-none disabled:hover:translate-y-0">{/* ... */}Lock answer</button>
            </div>
          </div>
          {/* ... */}
        </section>
        <div className="kbc-ladder-column order-2 lg:order-1"><PrizeLadder /></div>
      </div>
    ) : (/* ... */)}
  </div>
</main>
```

## `frontend/src/components/kbc/PrizeLadder.jsx` — prize ladder

```jsx
<aside aria-label="Prize ladder" className="kbc-prize-ladder min-w-0 rounded-2xl bg-[radial-gradient(circle_at_20%_0%,rgb(44_105_190_/_32%),transparent_42%),linear-gradient(160deg,#17396e_0%,#0d1c39_100%)] p-4 shadow-[0_1rem_2.5rem_rgb(0_0_0_/_24%),inset_0_1rem_2rem_rgb(34_88_157_/_13%)] sm:p-5">
  <div className="mb-3 flex items-center justify-between gap-2 pb-1">
    <div><h2 className="text-base font-extrabold uppercase tracking-wider text-white">Prize ladder</h2><span className="mt-1.5 block h-0.5 w-14 rounded-full bg-[linear-gradient(90deg,#ffd84d,#f5b82e,transparent)]" aria-hidden="true" /></div>
    <span className="shrink-0 font-sans text-base font-extrabold tracking-wide text-[#E2C778]">15 Levels</span>
  </div>
  <ol className="flex flex-col gap-0.5">
    {/* ... */}
    <li className={`relative flex min-h-8 items-center justify-between rounded-lg px-3 py-1.5 text-[0.9rem] transition-[background-color,color,transform,box-shadow,opacity] duration-500 ease-out ${/* ... */ ""}`}>
      <span className="flex w-[5.25rem] shrink-0 items-center gap-1.5 tabular-nums">{/* ... */}</span>
      <span className={`min-w-0 text-right tabular-nums ${/* ... */ ""}`}>{/* ... */}</span>
    </li>
  </ol>
</aside>
```

## `frontend/src/components/kbc/KbcQuestion.jsx` — hexagon question and options

```jsx
<section className={`${flipAnimation ? "kbc-question-card" : ""} kbc-question-box relative w-full max-w-full border border-[#a9852e] bg-[linear-gradient(145deg,#d8b74e_0%,#755411_50%,#e4c45b_100%)] p-[2px] shadow-[0_0_2rem_rgb(245_197_66_/_18%),0_1rem_3rem_rgb(0_0_0_/_30%)] [clip-path:polygon(0_50%,4%_0,96%_0,100%_50%,96%_100%,4%_100%)]">
  <div className="kbc-question-inner w-full max-w-full bg-[radial-gradient(ellipse_at_50%_0%,#214780_0%,#10264d_52%,#0a1936_100%)] px-5 py-7 shadow-[inset_0_0_2rem_rgb(255_210_63_/_10%)] [clip-path:polygon(0_50%,4%_0,96%_0,100%_50%,96%_100%,4%_100%)] sm:px-10 sm:py-9">
    <h2 className="mx-auto mb-7 max-w-4xl overflow-wrap-anywhere text-center text-[clamp(1.25rem,1vw+0.5rem,2rem)] font-bold leading-[1.25] text-white [text-shadow:0_1px_8px_rgb(255_255_255_/_15%)]">{/* question text */}</h2>
    <ol className="kbc-options grid w-full max-w-full gap-3 sm:grid-cols-2">
      {/* ... */}
      <li><button className={`flex min-h-16 w-full items-center gap-3 border px-5 py-3 text-left text-base text-white transition-[transform,background-color,border-color,box-shadow] duration-200 [clip-path:polygon(0_50%,5%_0,95%_0,100%_50%,95%_100%,5%_100%)] disabled:cursor-default sm:text-lg ${/* ... */ ""}`}>
        <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border text-sm font-extrabold ${/* ... */ ""}`} aria-hidden="true">A</span><span className="font-medium leading-snug">{/* option text */}</span>
      </button></li>
    </ol>
  </div>
</section>
```

## `frontend/src/components/kbc/LifelineBar.jsx` — lifelines

```jsx
<section className="rounded-2xl bg-[linear-gradient(145deg,#122955_0%,#0d1e3f_100%)] p-2" aria-label="Lifelines">
  <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
    {/* ... */}
    <button className={`flex w-3/5 max-w-full justify-self-center overflow-hidden rounded-lg p-0 transition-[transform,box-shadow] duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6ccff6] disabled:cursor-not-allowed disabled:opacity-45 hover:-translate-y-0.5 ${/* ... */ ""}`}>
      <img className="block h-auto w-full" />
    </button>
  </div>
  {/* ... lifeline result */}
</section>
```

## `frontend/src/components/kbc/KbcTimer.jsx` — timer

```jsx
<div className={`kbc-timer flex shrink-0 items-center gap-2 rounded-full border border-[#8e773c] bg-[#0b1c3b]/90 py-1.5 pl-1.5 pr-4 text-lg font-extrabold tabular-nums tracking-wider shadow-[0_0.4rem_1rem_rgb(0_0_0_/_22%)] ${/* ... */ ""}`}>
  <svg viewBox="0 0 56 56" className="h-12 w-12 -rotate-90" aria-hidden="true">{/* ... */}</svg>
  {/* time */}
</div>
```

## `frontend/index.css` — Tailwind and layout CSS

Tailwind v4 entry:

```css
@import "tailwindcss";
```

Root layout rules, verbatim:

```css
html {
  transition: background-color 0.2s ease, color 0.2s ease;
  overflow-x: hidden;
  max-width: 100%;
}

body {
  font-family: 'Inter', system-ui, sans-serif;
  margin: 0;
  background: var(--color-bg);
  color: var(--color-text-primary);
  min-height: 100vh;
  overflow-x: hidden;
  max-width: 100%;
}

#root {
  min-width: 0;
  max-width: 100%;
  overflow-x: clip;
}
```

Verbatim CSS rules containing `clip-path`, fixed width/height declarations, or media queries:

```css
.kbc-prize-hex {
  padding: 3px;
  clip-path: polygon(0 50%, 8% 0, 92% 0, 100% 50%, 92% 100%, 8% 100%);
  background: linear-gradient(135deg, #fff0a3, #f5c542 32%, #8f6500 66%, #f5c542);
  filter: drop-shadow(0 0 12px rgb(245 197 66 / 42%));
}

.kbc-prize-hex-inner {
  border: 1px solid rgb(255 233 139 / 58%);
  clip-path: polygon(0 50%, 8% 0, 92% 0, 100% 50%, 92% 100%, 8% 100%);
  background: linear-gradient(135deg, #10265d, #091638 58%, #121e4d);
}

.kbc-confetti i {
  position: absolute;
  top: 53%;
  left: 50%;
  width: 5px;
  height: 9px;
  border-radius: 2px;
  opacity: 0;
  background: linear-gradient(#fff3ae, #d99c12);
  box-shadow: 0 0 8px rgb(245 197 66 / 72%);
  animation: kbc-confetti-burst 1.8s ease-out both;
}

.kbc-game-screen::before {
  position: absolute;
  inset: 8rem 0 auto;
  height: 34rem;
  content: "";
  pointer-events: none;
  background: radial-gradient(ellipse at 50% 35%, rgb(57 116 210 / 19%), transparent 56%), radial-gradient(1.5px 1.5px at 13% 23%, rgb(255 232 139 / 62%) 50%, transparent 100%), radial-gradient(1px 1px at 87% 17%, rgb(255 255 255 / 55%) 50%, transparent 100%), radial-gradient(1.5px 1.5px at 77% 74%, rgb(255 232 139 / 50%) 50%, transparent 100%), radial-gradient(1px 1px at 21% 81%, rgb(255 255 255 / 45%) 50%, transparent 100%);
  animation: kbc-starlight 5s ease-in-out infinite alternate;
}

@media (prefers-reduced-motion: reduce) {
  .kbc-correct-screen::after,
  .kbc-correct-title,
  .kbc-countdown-number,
  .kbc-confetti i { animation: none; }
  .kbc-confetti { display: none; }
}

@media (prefers-reduced-motion: reduce) {
  .kbc-question-card { animation: none; }
}

@media (prefers-reduced-motion: reduce) {
  .kbc-game-screen::before,
  .kbc-question-card,
  .kbc-timer-tick,
  .kbc-ladder-shimmer,
  [class*="kbc-ladder-pulse"],
  [class*="kbc-lock-pulse"] { animation: none !important; }
}

@media (max-width: 640px) {
  .kbc-page-header { grid-template-columns: auto minmax(0, 1fr); row-gap: 1rem; }
  .kbc-page-header > div:nth-child(2) { grid-column: 1 / -1; grid-row: 2; }
  .kbc-page-header > div:last-child { display: none; }
  .kbc-page-header h1 { font-size: clamp(1.35rem, 7vw, 1.8rem); line-height: 1.15; }
  .kbc-page-header p { font-size: clamp(0.55rem, 2.2vw, 0.7rem); letter-spacing: 0.2em; }
  .kbc-game-screen .kbc-timer { font-size: 1.35rem; gap: 0.35rem; padding-right: 0.75rem; }
  .kbc-game-screen .kbc-timer svg { height: 2.5rem; width: 2.5rem; }
}

@media (max-width: 1024px) {
  .kbc-content-grid { grid-template-columns: 240px minmax(0, 1fr); }
}

@media (max-width: 768px) {
  .kbc-game-screen { padding: 1rem; }
  .kbc-content-grid { grid-template-columns: minmax(0, 1fr); }
  .kbc-content-grid > .kbc-ladder-column { order: 1; overflow-x: auto; }
  .kbc-content-grid > .kbc-main-panel { order: 2; }
  .kbc-prize-ladder { display: flex; min-width: max-content; align-items: center; gap: 1rem; overflow-x: auto; padding: 0.75rem; }
  .kbc-prize-ladder > div:first-child { min-width: 8.5rem; }
  .kbc-prize-ladder ol { display: flex; min-width: max-content; gap: 0.4rem; }
  .kbc-prize-ladder li { min-width: 8.5rem; }
  .kbc-options { grid-template-columns: minmax(0, 1fr); }
}

@media (max-width: 380px) {
  .kbc-game-screen { padding-left: 0.75rem; padding-right: 0.75rem; }
  .kbc-page-header { gap: 0.6rem; }
  .kbc-prize-ladder { padding: 0.75rem; }
  .kbc-prize-ladder li { padding-left: 0.55rem; padding-right: 0.55rem; font-size: 0.8rem; }
  .kbc-prize-ladder li > span:first-child { width: 4rem; }
}

@media (max-width: 420px) {
  .quiz-result-card .grid-cols-3 { grid-template-columns: 1fr; }
}

@media (max-width: 767px) {
  .quiz-layout { grid-template-columns: minmax(0, 1fr); gap: 1.25rem; }
  .quiz-main-column { padding-left: 0; }
}
```

## `frontend/index.html` — viewport

```html
<meta name="viewport" content="width=device-width, initial-scale=1" />
```

## Pattern occurrences

frontend/src/components/kbc/PrizeLadder.jsx:11: min-w-0
frontend/src/components/kbc/PrizeLadder.jsx:11: w-[
frontend/src/components/kbc/PrizeLadder.jsx:20: text-[
frontend/src/components/kbc/PrizeLadder.jsx:31: text-[
frontend/src/components/kbc/PrizeLadder.jsx:33: text-[
frontend/src/components/kbc/PrizeLadder.jsx:33: w-[
frontend/src/components/kbc/PrizeLadder.jsx:35: text-[
frontend/src/components/kbc/PrizeLadder.jsx:35: w-[
frontend/src/components/kbc/PrizeLadder.jsx:36: text-[
frontend/src/components/kbc/PrizeLadder.jsx:36: text-[
frontend/src/components/kbc/PrizeLadder.jsx:36: text-[
frontend/src/components/kbc/PrizeLadder.jsx:36: absolute
frontend/src/components/kbc/PrizeLadder.jsx:39: w-[
frontend/src/components/kbc/PrizeLadder.jsx:41: text-[
frontend/src/components/kbc/PrizeLadder.jsx:46: text-[
frontend/src/components/kbc/PrizeLadder.jsx:46: text-[
frontend/src/components/kbc/PrizeLadder.jsx:51: text-[
frontend/src/components/kbc/PrizeLadder.jsx:51: text-[
frontend/src/components/kbc/PrizeLadder.jsx:59: min-w-0
frontend/src/components/kbc/PrizeLadder.jsx:59: text-[
frontend/src/components/kbc/PrizeLadder.jsx:59: text-[
frontend/src/components/kbc/PrizeLadder.jsx:59: text-[
frontend/src/components/kbc/KbcQuestion.jsx:18: w-[
frontend/src/components/kbc/KbcQuestion.jsx:18: clip-path
frontend/src/components/kbc/KbcQuestion.jsx:20: w-[
frontend/src/components/kbc/KbcQuestion.jsx:20: clip-path
frontend/src/components/kbc/KbcQuestion.jsx:21: text-[
frontend/src/components/kbc/KbcQuestion.jsx:29: clip-path
frontend/src/components/kbc/KbcQuestion.jsx:43: clip-path
frontend/src/components/kbc/KbcQuestion.jsx:45: w-[
frontend/src/components/kbc/KbcQuestion.jsx:47: w-[
frontend/src/components/kbc/KbcQuestion.jsx:49: text-[
frontend/src/components/kbc/KbcQuestion.jsx:49: w-[
frontend/src/components/kbc/KbcQuestion.jsx:50: w-[
frontend/src/components/kbc/KbcQuestion.jsx:54: text-[
frontend/src/components/kbc/LifelineBar.jsx:45: w-[
frontend/src/components/kbc/KbcTimer.jsx:14: w-[
frontend/src/components/kbc/KbcTimer.jsx:14: text-[
frontend/src/components/kbc/KbcTimer.jsx:14: text-[
frontend/src/pages/KbcPage.jsx:280: h-[
frontend/src/pages/KbcPage.jsx:281: w-[
frontend/src/pages/KbcPage.jsx:283: absolute
frontend/src/pages/KbcPage.jsx:283: w-[
frontend/src/pages/KbcPage.jsx:297: min-w-0
frontend/src/pages/KbcPage.jsx:323: h-[
frontend/src/pages/KbcPage.jsx:325: absolute
frontend/src/pages/KbcPage.jsx:334: absolute
frontend/src/pages/KbcPage.jsx:338: text-[
frontend/src/pages/KbcPage.jsx:345: text-[
frontend/src/pages/KbcPage.jsx:352: text-[
frontend/src/pages/KbcPage.jsx:359: text-[
frontend/src/pages/KbcPage.jsx:368: text-[
frontend/src/pages/KbcPage.jsx:370: h-[
frontend/src/pages/KbcPage.jsx:370: w-[
frontend/src/pages/KbcPage.jsx:373: absolute
frontend/src/pages/KbcPage.jsx:394: h-[
frontend/src/pages/KbcPage.jsx:398: text-[
frontend/src/pages/KbcPage.jsx:433: text-[
frontend/src/pages/KbcPage.jsx:441: min-w-0
frontend/src/pages/KbcPage.jsx:445: min-w-0
frontend/src/pages/KbcPage.jsx:448: text-[
frontend/src/pages/KbcPage.jsx:448: text-[
frontend/src/pages/KbcPage.jsx:457: text-[
frontend/src/pages/KbcPage.jsx:468: w-[
frontend/src/pages/KbcPage.jsx:505: text-[
frontend/src/pages/KbcPage.jsx:505: text-[
frontend/src/pages/KbcPage.jsx:513: text-[
frontend/src/pages/KbcPage.jsx:513: text-[
frontend/src/pages/KbcPage.jsx:520: text-[
frontend/src/pages/KbcPage.jsx:532: text-[
frontend/src/pages/KbcPage.jsx:540: text-[
frontend/src/pages/KbcPage.jsx:545: text-[
frontend/src/pages/KbcPage.jsx:551: text-[
frontend/src/pages/KbcPage.jsx:558: text-[
frontend/index.css:10: absolute
frontend/index.css:34: clip-path
frontend/index.css:41: clip-path
frontend/index.css:54: absolute
frontend/index.css:133: absolute
