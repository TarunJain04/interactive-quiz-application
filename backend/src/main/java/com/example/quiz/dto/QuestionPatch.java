package com.example.quiz.dto;

import com.example.quiz.model.Difficulty;
import com.example.quiz.model.QuestionType;
import com.example.quiz.model.Source;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record QuestionPatch(
        @NotBlank String category,
        @NotNull QuestionType type,
        @NotNull Difficulty difficulty,
        @NotNull Source source
) {
}
