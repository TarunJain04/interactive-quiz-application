package com.example.quiz.dto;

import com.example.quiz.model.Difficulty;
import com.example.quiz.model.QuestionType;
import com.example.quiz.model.Source;
import org.apache.commons.lang3.builder.Diff;

import java.util.List;

public record Filters(
        List<Category> categories,
        List<Difficulty> difficulties,
        List<QuestionType> types,
        List<Source> sources
) {
}
