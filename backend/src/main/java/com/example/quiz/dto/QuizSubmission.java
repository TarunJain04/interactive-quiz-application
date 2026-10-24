package com.example.quiz.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record QuizSubmission(
        @NotNull List<@NotNull Submission> submissions
) {
    public record Submission(
            @NotBlank String questionId,
            int selectedIndex
    ) {
    }
}
