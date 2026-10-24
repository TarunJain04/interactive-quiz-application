package com.example.quiz.dto;

import com.example.quiz.model.Lifeline;
import jakarta.validation.constraints.NotNull;

public record LifelineRequest(@NotNull Lifeline type) {
}
