package com.example.quiz.loader;

import com.example.quiz.dto.ApiMetadata;
import com.example.quiz.exception.ExternalServiceException;
import com.example.quiz.exception.InvalidCategoryException;
import com.example.quiz.model.Difficulty;
import com.example.quiz.model.Question;
import com.example.quiz.model.QuestionType;
import com.example.quiz.model.Source;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.*;

@Service
@Slf4j
public class TriviaApiLoader {
    private static final String QUESTIONS_URL = "https://the-trivia-api.com/v2/questions";

    private final RestTemplate restTemplate;
    private final CategoryFileLoader categoryFileLoader;
    private Map<String, String> categoryMappings;

    public TriviaApiLoader(RestTemplate restTemplate, CategoryFileLoader categoryFileLoader) {
        this.restTemplate = restTemplate;
        this.categoryFileLoader = categoryFileLoader;
    }

    @PostConstruct
    public void initializeCategoryMappings() {
        this.categoryMappings = categoryFileLoader.loadCategoriesFile("trivia-api-categories.json");
    }

    public ApiMetadata getMetadata() {
        return new ApiMetadata(
                List.of("TEXT_CHOICE"),
                List.of("EASY", "MEDIUM", "HARD"),
                List.copyOf(categoryMappings.keySet()));
    }

    public List<Question> fetchQuestions(int limit, String category, String difficulty) {
        String normalizedCategory = StringUtils.hasText(category) ? category.toLowerCase(Locale.ROOT).trim() : null;
        String normalizedDifficulty = StringUtils.hasText(difficulty) ? difficulty.toLowerCase(Locale.ROOT).trim() : null;

        if (normalizedCategory != null && !categoryMappings.containsKey(normalizedCategory)) {
            throw new InvalidCategoryException("TriviaApi: Invalid category " + category);
        }

        String url = UriComponentsBuilder
                .fromUriString(QUESTIONS_URL)
                .queryParam("limit", limit)
                .queryParamIfPresent("categories", Optional.ofNullable(normalizedCategory))
                .queryParamIfPresent("difficulties", Optional.ofNullable(normalizedDifficulty))
                .toUriString();

        TriviaQuestion[] response;
        try {
            response = restTemplate.getForObject(url, TriviaQuestion[].class);
        } catch (RestClientException ex) {
            throw new ExternalServiceException("Failed to fetch questions from Trivia API", ex);
        }

        if (response == null) {
            throw new ExternalServiceException("Received null response from Trivia API questions endpoint");
        }
        if (response.length == 0) {
            log.warn("No questions returned from Trivia API for category: {}, difficulty: {}", category, difficulty);
            return Collections.emptyList();
        }

        return Arrays.stream(response)
                .map(this::toQuestion)
                .filter(Objects::nonNull)
                .toList();
    }

    private Question toQuestion(TriviaQuestion triviaQuestion) {
        if(!categoryMappings.containsKey(triviaQuestion.category())) return null;
        List<String> options = new ArrayList<>(triviaQuestion.incorrectAnswers());
        options.add(triviaQuestion.correctAnswer());
        Collections.shuffle(options);

        int answerIndex = options.indexOf(triviaQuestion.correctAnswer());

        return new Question(
                triviaQuestion.question().text(),
                options,
                answerIndex,
                categoryMappings.get(triviaQuestion.category()).trim(),
                QuestionType.MULTIPLE,
                Difficulty.valueOf(triviaQuestion.difficulty().trim().toUpperCase(Locale.ROOT)),
                Source.TRIVIA_API);
    }

    record TriviaQuestion(
            String category,
            String difficulty,
            QuestionText question,
            String correctAnswer,
            List<String> incorrectAnswers,
            String type) {
        TriviaQuestion {
            category = category.toLowerCase(Locale.ROOT).trim();
            difficulty = difficulty.toUpperCase(Locale.ROOT).trim();
            correctAnswer = correctAnswer.trim();
            incorrectAnswers = incorrectAnswers.stream()
                    .map(String::trim)
                    .toList();
            type = type.toLowerCase(Locale.ROOT).trim();
        }
    }

    record QuestionText(String text) {
        QuestionText {
            text = text.trim();
        }
    }
}
