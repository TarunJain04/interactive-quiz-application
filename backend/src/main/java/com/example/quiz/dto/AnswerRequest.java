package com.example.quiz.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record AnswerRequest(
        @NotBlank String questionId,
        @Min(0) @Max(3) int selectedIndex) {
}
