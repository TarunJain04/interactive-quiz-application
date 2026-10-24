package com.example.quiz.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Document(collection = "quizzes")
public record Quiz(
                @Id String id,
                List<String> questionIds,
                boolean submitted,
                int score,
                int total,
                int attempted,
                Instant timestamp) {
}
