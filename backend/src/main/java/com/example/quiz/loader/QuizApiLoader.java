package com.example.quiz.loader;

import com.example.quiz.config.QuizApiProperties;
import com.example.quiz.dto.ApiMetadata;
import com.example.quiz.exception.ExternalServiceException;
import com.example.quiz.exception.InvalidCategoryException;
import com.example.quiz.model.Difficulty;
import com.example.quiz.model.Question;
import com.example.quiz.model.QuestionType;
import com.example.quiz.model.Source;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.*;

@Service
@Slf4j
public class QuizApiLoader {
    private final RestTemplate restTemplate;
    private final QuizApiProperties quizApiProperties;
    private final CategoryFileLoader categoryFileLoader;
    private Map<String, String> categoryMappings;

    public QuizApiLoader(RestTemplate restTemplate, QuizApiProperties quizApiProperties,
                         CategoryFileLoader categoryFileLoader) {
        this.restTemplate = restTemplate;
        this.quizApiProperties = quizApiProperties;
        this.categoryFileLoader = categoryFileLoader;
    }

    @PostConstruct
    public void initializeCategoryMappings() {
        this.categoryMappings = categoryFileLoader.loadCategoriesFile("quiz-api-categories.json");
    }

    public ApiMetadata getMetadata() {
        return new ApiMetadata(
                List.of("MULTIPLE_CHOICE", "TRUE_FALSE"),
                List.of("EASY", "MEDIUM", "HARD", "EXPERT"),
                List.copyOf(categoryMappings.keySet()));
    }

    public List<Question> fetchQuestions(int limit, int offset, String category, String type, String difficulty) {
        String normalizedCategory = StringUtils.hasText(category) ? category.toLowerCase(Locale.ROOT).trim() : null;
        String normalizedType = StringUtils.hasText(type) ? type.toLowerCase(Locale.ROOT).trim() : null;
        String normalizedDifficulty = StringUtils.hasText(difficulty) ? difficulty.toLowerCase(Locale.ROOT).trim() : null;
        if (normalizedCategory != null && !categoryMappings.containsKey(normalizedCategory)) {
            throw new InvalidCategoryException("QuizApi: Invalid category " + category);
        }
        String url = UriComponentsBuilder
                .fromUriString(quizApiProperties.baseUrl())
                .path("/questions")
                .queryParam("limit", limit)
                .queryParam("offset", offset)
                .queryParamIfPresent("category", Optional.ofNullable(normalizedCategory))
                .queryParamIfPresent("type", Optional.ofNullable(normalizedType))
                .queryParamIfPresent("difficulty", Optional.ofNullable(normalizedDifficulty))
                .toUriString();
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(quizApiProperties.apiKey());

        QuizResponse response;
        try {
            response = restTemplate.exchange(
                    url, HttpMethod.GET, new HttpEntity<>(headers), QuizResponse.class).getBody();
        } catch (RestClientException ex) {
            throw new ExternalServiceException(
                    "Failed to fetch questions from Quiz API", ex);
        }

        if (response == null || !response.success || response.data() == null) {
            throw new ExternalServiceException(
                    "Received null response from Quiz API questions endpoint");
        }
        if (response.data().isEmpty()) {
            log.warn("No questions returned from Quiz API for category: {}, difficulty: {}", category, difficulty);
            return Collections.emptyList();
        }

        return response.data().stream()
                .map(this::toQuestion)
                .filter(Objects::nonNull)
                .toList();
    }

    private Question toQuestion(QuizQuestion quizQuestion) {
        if (!categoryMappings.containsKey((quizQuestion.category()))) return null;
        List<String> choices = new ArrayList<>();
        int answerIndex = -1;

        for (int i = 0; i < quizQuestion.answers().size(); i++) {
            QuizAnswer answer = quizQuestion.answers().get(i);
            choices.add(answer.text());
            if (answer.isCorrect()) {
                answerIndex = i;
            }
        }

        return new Question(
                quizQuestion.text(),
                choices,
                answerIndex,
                categoryMappings.get(quizQuestion.category()).trim(),
                quizQuestion.answers().size() == 2
                        ? QuestionType.BOOLEAN
                        : QuestionType.MULTIPLE,
                Difficulty.valueOf(quizQuestion.difficulty().trim().toUpperCase(Locale.ROOT)),
                Source.QUIZ_API);
    }

    record QuizResponse(
            boolean success,
            List<QuizQuestion> data) {
    }

    record QuizQuestion(
            String text,
            String difficulty,
            String category,
            List<QuizAnswer> answers) {
        QuizQuestion {
            text = text.trim();
            difficulty = difficulty.toUpperCase(Locale.ROOT).trim();
            category = category.toLowerCase(Locale.ROOT).trim();
        }
    }

    record QuizAnswer(
            boolean isCorrect,
            String text) {
        QuizAnswer {
            text = text.trim();
        }
    }

}
