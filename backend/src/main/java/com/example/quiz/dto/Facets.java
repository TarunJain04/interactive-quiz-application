package com.example.quiz.dto;

import com.example.quiz.model.Difficulty;
import com.example.quiz.model.QuestionType;
import com.example.quiz.model.Source;

import java.util.Map;

public record Facets(
        Map<String, Long> byCategory,
        Map<Difficulty, Long> byDifficulty,
        Map<QuestionType, Long> byType,
        Map<Source, Long> bySource,
        Long total) {
}
