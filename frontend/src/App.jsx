import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeProvider";
import HomePage from "./pages/HomePage";
import QuizPage from "./pages/QuizPage";
import KbcPage from "./pages/KbcPage";

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/kbc" element={<KbcPage />} />
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/timed-quiz" element={<QuizPage timed={true} />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
