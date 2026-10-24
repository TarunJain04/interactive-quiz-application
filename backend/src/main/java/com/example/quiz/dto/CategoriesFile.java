package com.example.quiz.dto;

import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

public record CategoriesFile(Map<String, String> categoryMappings) {
    public CategoriesFile {
        categoryMappings = categoryMappings != null
                ? categoryMappings.entrySet().stream()
                .collect(Collectors.toMap(
                        e -> e.getKey().trim().toLowerCase(Locale.ROOT),
                        Map.Entry::getValue))
                : null;
    }
}