package com.example.quiz.dto;

import java.util.List;

public record ApiMetadata(
        List<String> questionTypes,
        List<String> difficulties,
        List<String> categories
) {
}
