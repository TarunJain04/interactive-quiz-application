# Quiz App — Future TODO

## 🏠 Home & Navigation
- [ ] Improve `HomePage` with proper branding, hero section, and real styling (currently unstyled buttons)
- [ ] Add a navbar / persistent header across all pages

---

## ⏱ Timed Quiz — Backend Enforcement
- [ ] **Global timer**: Record `startedAt` + `allowedSeconds` on quiz session at `POST /quiz/start`; reject or flag `timedOut` submissions that arrive late
- [ ] **Per-question timer**: Requires stateful question serving — `GET /quiz/{id}/question/{n}` endpoint that records `servedAt`; validate each answer's `answeredAt` on submit
- [ ] Send `timerConfig` (type + seconds) to backend at quiz start so it can store and enforce it

---

## 🏆 Competitive / Social
- [ ] User accounts (auth — JWT or OAuth)
- [ ] Leaderboard per quiz mode (global timer, custom)
- [ ] Shareable result cards (score summary as image or link)
- [ ] Challenge a friend (send quiz link with same question set)

---

## 📊 Stats & History
- [ ] Per-user quiz history (past results, accuracy trends)
- [ ] Per-category performance breakdown
- [ ] Streak tracking (daily quiz streak)

---

## ❓ Question & Content
- [ ] Admin panel to add/edit/delete questions
- [ ] Question difficulty tagging improvements
- [ ] Support for image-based questions
- [ ] True/False question type UI (currently rendered as 2-choice MCQ — could have dedicated UI)
- [ ] Explanation / rationale shown after revealing correct answer

---

## 🎮 Quiz Modes
- [ ] **Sudden death** mode — one wrong answer ends the quiz
- [ ] **Infinite / endless** mode — keeps fetching new questions until the user quits
- [ ] **Practice mode** — instant feedback after each question (no submit at end)
- [ ] **Review mode** — re-attempt only wrongly answered questions from a past session

---

## 🔧 Technical / Architecture
- [ ] Backend time enforcement for global timed quiz (see above)
- [ ] Persist quiz session to localStorage so a page refresh doesn't wipe progress
- [ ] Error boundary component wrapping quiz routes
- [ ] API pagination for large question banks
- [ ] Optimistic UI for answer selection (no flicker on slow connections)
- [ ] E2E tests (Playwright or Cypress) covering custom and timed quiz flows
- [ ] CI pipeline (GitHub Actions) for build + test on push

---

## ♿ Accessibility & Polish
- [ ] Keyboard-only navigation audit (tab order, focus trapping in modals)
- [ ] Announce timer updates to screen readers more gracefully (currently `aria-live` on every tick is noisy)
- [ ] Reduced-motion support for progress bar and card transitions
- [ ] Mobile layout pass — bottom-sheet for results on small screens
