package com.example.quiz.model;

import lombok.NonNull;

public record Choice(
        @NonNull String text
) {
    public Choice {
        text = text.trim();
    }
}
