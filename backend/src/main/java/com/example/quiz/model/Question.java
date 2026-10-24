package com.example.quiz.model;

import com.example.quiz.util.Slugifier;
import lombok.NonNull;
import org.apache.commons.codec.digest.DigestUtils;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;
import java.util.Locale;

@Document(collection = "questions")
public record Question(
                @Id String id,
                @NonNull String question,
                @NonNull List<@NonNull String> choices,
                int answerIndex,
                @NonNull String categoryName,
                @Indexed String categorySlug,
                @NonNull QuestionType type,
                @NonNull Difficulty difficulty,
                @NonNull Source source,
                Instant timestamp) {

        @Default
        public Question(String question, List<String> choices, int answerIndex,
                        String categoryName,
                        QuestionType type, Difficulty difficulty,
                        Source source) {
                this(null, question, choices, answerIndex,
                                categoryName.trim(), null,
                                type, difficulty, source, null);
        }

        public Question {
                question = question.trim();
                List<String> sortedNormalizedChoices = choices.stream()
                                .map(s -> s.toLowerCase(Locale.ROOT))
                                .sorted()
                                .toList();
                String raw = question.toLowerCase(Locale.ROOT)
                                + "|" + String.join("|", sortedNormalizedChoices);
                id = DigestUtils.sha256Hex(raw);
                categorySlug = Slugifier.slugify(categoryName);
                timestamp = Instant.now();
        }

}
