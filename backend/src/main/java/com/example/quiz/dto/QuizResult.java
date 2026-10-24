package com.example.quiz.dto;

import jakarta.validation.constraints.Min;
import lombok.NonNull;

import java.util.List;

public record QuizResult(
        @NonNull List<@NonNull QuestionResult> questionResults,
        int score,
        int attempted,
        int total
) {
    public record QuestionResult(@NonNull String questionId, int answerIndex) {
    }
}
