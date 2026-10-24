package com.example.quiz.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "quiz-api")
public record QuizApiProperties(String baseUrl, String apiKey) {
}
