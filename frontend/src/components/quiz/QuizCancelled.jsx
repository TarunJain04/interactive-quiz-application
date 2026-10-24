import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function QuizCancelled() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-6 py-10 text-center">
      <h2 className="text-lg font-semibold text-red-800">Quiz Cancelled</h2>
      <p className="text-sm text-red-700">
        This quiz was cancelled due to suspicious activity and cannot be scored.
      </p>
    </div>
  );
}
