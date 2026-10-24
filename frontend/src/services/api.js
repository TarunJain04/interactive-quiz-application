// services/api.js
const BASE_URL = import.meta.env.VITE_API_URL;

async function request(path, options = {}) {
    const res = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers: { "Content-Type": "application/json", ...options.headers },
    });
    if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        const message = errorBody.message || res.statusText || "Request failed";

        throw new ApiError(
            errorBody.code || "INTERNAL_SERVER_ERROR",
            message,
            res.status,
        );
    }

    if (res.status === 204) return null;
    return res.json();
}

function getQuestions(params = {}) {
    const query = new URLSearchParams(params).toString();
    return request(`/api/questions/sample${query ? `?${query}` : ""}`);
}
function checkAnswer(id, data) {
    return request(`/api/questions/${id}/check`, {
        method: 'POST',
        body: JSON.stringify(data)
    })
}
function startQuiz(params = {}) {
    const query = new URLSearchParams();
    const categories = params.categories;
    const difficulties = params.difficulties;
    const types = params.types;

    if (categories) query.set("categories", categories.join(","));
    if (difficulties) query.set("difficulties", difficulties.join(","));
    if (types) query.set("types", types.join(","));
    if (params.size) query.set("size", params.size);
    return request(`/api/quiz/start${query ? `?${query}` : ""}`);
}

function submitQuiz(id, quizSubmission) {
    return request(`/api/quiz/${id}/submit`, {
        method: 'POST',
        body: JSON.stringify(quizSubmission)
    })
}
function getFilters() {
    return request("/api/filters");
}

function startKbcGame() {
    return request("/api/kbc/start", { method: "POST" });
}
function getKbcGame(id) {
    return request(`/api/kbc/${encodeURIComponent(id)}`);
}
function answerKbcGame(id, data) {
    return request(`/api/kbc/${encodeURIComponent(id)}/answer`, {
        method: "POST",
        body: JSON.stringify(data),
    });
}
function practiceKbcAnswer(id, data) {
    return request(`/api/kbc/${encodeURIComponent(id)}/practice-answer`, {
        method: "POST",
        body: JSON.stringify(data),
    });
}
function quitKbcGame(id) {
    return request(`/api/kbc/${encodeURIComponent(id)}/quit`, { method: "POST" });
}
function useKbcLifeline(id, type) {
    return request(`/api/kbc/${encodeURIComponent(id)}/lifeline`, {
        method: "POST",
        body: JSON.stringify({ type }),
    });
}
export class QuizIntegrityError extends Error {
    constructor(message, status) {
        super(message);
        this.name = "QuizIntegrityError";
        this.status = status;
    }
}

export class ApiError extends Error {
    constructor(code, message, status) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.code = code;
    }
}
export default {
    getQuestions,
    checkAnswer,
    startQuiz,
    submitQuiz,
    getFilters,
    startKbcGame,
    getKbcGame,
    answerKbcGame,
    practiceKbcAnswer,
    quitKbcGame,
    useKbcLifeline,
};
