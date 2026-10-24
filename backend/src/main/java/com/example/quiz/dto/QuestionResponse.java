package com.example.quiz.dto;

import com.example.quiz.model.Difficulty;
import com.example.quiz.model.QuestionType;

import lombok.NonNull;

import java.util.List;

public record QuestionResponse(
        String id,
        @NonNull String question,
        @NonNull List<@NonNull String> choices,
        @NonNull String categoryName,
        @NonNull QuestionType type,
        @NonNull Difficulty difficulty) {
}
