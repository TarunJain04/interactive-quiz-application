package com.example.quiz.loader;

import com.example.quiz.dto.OpenTDBMetadata;
import com.example.quiz.exception.ExternalServiceException;
import com.example.quiz.exception.InvalidCategoryException;
import com.example.quiz.model.Difficulty;
import com.example.quiz.model.Question;
import com.example.quiz.model.QuestionType;
import com.example.quiz.model.Source;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.text.StringEscapeUtils;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
@Slf4j
public class OpenTDBLoader {
    private static final String QUESTIONS_URL = "https://opentdb.com/api.php";
    private static final String CATEGORIES_URL = "https://opentdb.com/api_category.php";

    private final RestTemplate restTemplate;
    private final CategoryFileLoader categoryFileLoader;
    private Map<Integer, String> categoriesById;
    private Map<String, String> categoryMappings;

    public OpenTDBLoader(RestTemplate restTemplate, CategoryFileLoader categoryFileLoader) {
        this.restTemplate = restTemplate;
        this.categoryFileLoader = categoryFileLoader;
    }

    @PostConstruct
    public void initializeCategoryMappings() {
        this.categoryMappings = categoryFileLoader.loadCategoriesFile("open-tdb-categories.json");
    }

    public void fetchUpdateCategories() {
        CategoryResponse categoryResponse;
        try {
            categoryResponse = restTemplate.getForObject(CATEGORIES_URL, CategoryResponse.class);
        } catch (RestClientException ex) {
            throw new ExternalServiceException(
                    "Failed to fetch categories from OpenTDB API", ex);
        }
        if (categoryResponse == null || categoryResponse.trivia_categories() == null) {
            log.error("Received null response from OpenTDB categories API");
            throw new ExternalServiceException(
                    "Received null response from OpenTDB categories API");
        }

        Map<Integer, String> byId = new LinkedHashMap<>();
        for (Category cat : categoryResponse.trivia_categories()) {
            byId.put(cat.id(), cat.name());
        }
        this.categoriesById = byId;
    }

    public OpenTDBMetadata getMetadata() {
        if (categoriesById == null || categoriesById.isEmpty()) {
            fetchUpdateCategories();
        }
        return new OpenTDBMetadata(
                categoriesById.entrySet().stream()
                        .filter(e -> categoryMappings.containsKey(e.getValue().toLowerCase(Locale.ROOT).trim()))
                        .map(e -> new OpenTDBMetadata.CategoryInfo(e.getKey(), e.getValue().trim()))
                        .toList(),
                List.of("MULTIPLE", "BOOLEAN"),
                List.of("EASY", "MEDIUM", "HARD"));
    }

    public List<Question> fetchQuestions(int amount, Integer category, String type, String difficulty) {
        if (categoriesById == null || categoriesById.isEmpty()) {
            fetchUpdateCategories();
        }
        String categoryName = category == null ? null : categoriesById.get(category);
        if (categoryName != null && !categoryMappings.containsKey(categoryName.toLowerCase(Locale.ROOT).trim())) {
            throw new InvalidCategoryException("OpenTDB: Invalid category " + category + ": " + categoryName);
        }
        TriviaResponse response;
        try {
            response = restTemplate.getForObject(
                    buildUrl(amount, category, type, difficulty),
                    TriviaResponse.class);
        } catch (RestClientException ex) {
            throw new ExternalServiceException("Failed to fetch questions from OpenTDB API", ex);
        }
        if (response == null || response.results == null) {
            log.error("Received null response from OpenTDB API");
            throw new ExternalServiceException("Received null response from OpenTDB API");
        }
        if (response.results.isEmpty()) {
            log.warn("No questions returned from OpenTDB API for category: {}, difficulty: {}", category, difficulty);
            return Collections.emptyList();
        }

        return response.results.stream()
                .map(this::toQuestion)
                .filter(Objects::nonNull)
                .toList();
    }

    private String buildUrl(int amount, Integer category, String type, String difficulty) {
        StringBuilder url = new StringBuilder(QUESTIONS_URL)
                .append("?amount=").append(amount);
        if (StringUtils.hasText(type)) {
            url.append("&type=").append(type.toLowerCase(Locale.ROOT).trim());
        }
        if (category != null) {
            url.append("&category=").append(category);
        }
        if (StringUtils.hasText(difficulty)) {
            url.append("&difficulty=").append(difficulty.toLowerCase(Locale.ROOT).trim());
        }
        return url.toString();
    }

    private Question toQuestion(TriviaQuestion tq) {
        if(!categoryMappings.containsKey(tq.category())) return null;
        List<String> options = new ArrayList<>(tq.incorrect_answers());
        options.add(tq.correct_answer());
        Collections.shuffle(options);

        int correctIndex = options.indexOf(tq.correct_answer());
        return new Question(
                tq.question(),
                options,
                correctIndex,
                categoryMappings.get(tq.category()).trim(),
                QuestionType.valueOf(tq.type()),
                Difficulty.valueOf(tq.difficulty()),
                Source.OPEN_TDB);
    }

    record TriviaResponse(List<TriviaQuestion> results) {
    }

    record TriviaQuestion(
            String question,
            String correct_answer,
            List<String> incorrect_answers,
            String category,
            String type,
            String difficulty) {
        TriviaQuestion {
            question = StringEscapeUtils.unescapeHtml4(question).trim();
            category = StringEscapeUtils.unescapeHtml4(category).trim().toLowerCase(Locale.ROOT);
            correct_answer = StringEscapeUtils.unescapeHtml4(correct_answer).trim();
            incorrect_answers = incorrect_answers.stream()
                    .map(s -> StringEscapeUtils.unescapeHtml4(s).trim())
                    .toList();
            type = type.trim().toUpperCase(Locale.ROOT);
            difficulty = difficulty.trim().toUpperCase(Locale.ROOT);
        }
    }

    record CategoryResponse(List<Category> trivia_categories) {
    }

    record Category(int id, String name) {
        Category {
            name = StringEscapeUtils.unescapeHtml4(name).trim();
        }
    }
}
