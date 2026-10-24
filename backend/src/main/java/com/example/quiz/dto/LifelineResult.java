package com.example.quiz.dto;

import com.example.quiz.model.Lifeline;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record LifelineResult(
        Lifeline type,
        List<Integer> hiddenIndices,   // FIFTY_FIFTY
        List<Integer> percentages,     // AUDIENCE_POLL
        Integer suggestedIndex,        // PHONE_FRIEND
        Integer confidence,            // PHONE_FRIEND
        GameState state) {
}            // FLIP (new question + new deadline)
