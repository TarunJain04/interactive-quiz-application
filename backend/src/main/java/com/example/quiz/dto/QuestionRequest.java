package com.example.quiz.dto;

import com.example.quiz.model.Difficulty;
import com.example.quiz.model.QuestionType;
import jakarta.validation.constraints.*;
import java.util.List;

public record QuestionRequest(
        @NotBlank String question,
        @NotNull @Size(min = 2) List<@NotBlank String> choices,
        int answerIndex,
        @NotBlank String category,
        @NotNull QuestionType type,
        @NotNull Difficulty difficulty) {
    @AssertTrue(message = "answerIndex out of bounds")
    public boolean isAnswerIndex() {
        return choices == null || (answerIndex >= 0 && answerIndex < choices.size());
    }
}
