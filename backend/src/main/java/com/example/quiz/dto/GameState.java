package com.example.quiz.dto;


import com.example.quiz.model.KbcStatus;
import com.example.quiz.model.Lifeline;

import java.time.Instant;
import java.util.List;
import java.util.Set;

public record GameState(
        String gameId, KbcStatus status, int level, long currentPrize, long prizeIfCorrect, long prizeIfWrong,
        QuestionView question, Instant expiresAt, Instant serverTime,
        Set<Lifeline> lifelinesAvailable, List<Integer> hiddenIndices, List<PrizeLevel> prizeLadder) {
}
