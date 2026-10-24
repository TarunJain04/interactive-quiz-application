package com.example.quiz.dto;

import com.example.quiz.model.KbcStatus;

public record AnswerResult(
        boolean correct,    // WRONG | TIMEOUT | null
        Integer correctIndex,                // only when game is over
        KbcStatus status, long prizeWon,
        GameState next) {
}
