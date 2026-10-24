package com.example.quiz.dto;

import lombok.NonNull;

import java.util.List;

public record SampleQuiz(
        @NonNull String id,
        @NonNull List<@NonNull QuestionResponse> questions
) {
}
