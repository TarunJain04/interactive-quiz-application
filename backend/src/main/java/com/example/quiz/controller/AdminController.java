package com.example.quiz.controller;

import com.example.quiz.dto.*;
import com.example.quiz.loader.OpenTDBLoader;
import com.example.quiz.loader.QuizApiLoader;
import com.example.quiz.loader.TriviaApiLoader;
import com.example.quiz.model.Difficulty;
import com.example.quiz.model.Question;
import com.example.quiz.model.QuestionType;
import com.example.quiz.model.Source;
import com.example.quiz.service.AdminService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
@Validated
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    private final AdminService adminService;
    private final OpenTDBLoader openTDBLoader;
    private final QuizApiLoader quizApiLoader;
    private final TriviaApiLoader triviaApiLoader;

    public AdminController(AdminService adminService, OpenTDBLoader openTDBLoader, QuizApiLoader quizApiLoader,
                           TriviaApiLoader triviaApiLoader) {
        this.adminService = adminService;
        this.openTDBLoader = openTDBLoader;
        this.quizApiLoader = quizApiLoader;
        this.triviaApiLoader = triviaApiLoader;
    }

    @PostMapping("/questions")
    public Question addQuestion(@RequestBody @Valid QuestionRequest questionRequest) {
        return adminService.addQuestion(questionRequest);
    }

    @PostMapping("/questions/bulk")
    public List<Question> addManyQuestions(@RequestBody List<@Valid QuestionRequest> questions) {
        return adminService.addManyQuestions(questions);
    }

    @PostMapping("/opentdb/import")
    public ResponseEntity<ApiResults> addFromOpenTDB(
            @RequestParam(defaultValue = "5") @Min(1) @Max(50) int amount,
            @RequestParam(required = false) @Min(9) @Max(32) Integer category,
            @RequestParam(required = false) @Pattern(regexp = "(?i)^\\s*(multiple|boolean|)\\s*$", message = "type must be multiple or boolean") String type,
            @RequestParam(required = false) @Pattern(regexp = "(?i)^\\s*(easy|medium|hard|)\\s*$", message = "difficulty must be easy, medium, or hard") String difficulty,
            @RequestParam(defaultValue = "false") boolean verbose) {
        ApiResults result = adminService.addFromOpenTrivia(amount, category, type, difficulty, verbose);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/quiz-api/import")
    public ResponseEntity<ApiResults> addFromQuizApi(
            @RequestParam(defaultValue = "5") @Min(1) @Max(50) int limit,
            @RequestParam(defaultValue = "0") @Min(0) int offset,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) @Pattern(regexp = "(?i)^\\s*(multiple_choice|true_false|)\\s*$", message = "type must be multiple_choice or true_false") String type,
            @RequestParam(required = false) @Pattern(regexp = "(?i)^\\s*(easy|medium|hard|expert|)\\s*$", message = "difficulty must be easy, medium, hard, or expert") String difficulty,
            @RequestParam(defaultValue = "false") boolean verbose) {
        ApiResults result = adminService.addFromQuizApi(limit, offset, category, type, difficulty, verbose);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/trivia-api/import")
    public ResponseEntity<ApiResults> addFromTriviaApi(
            @RequestParam(defaultValue = "5") @Min(1) @Max(50) int limit,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) @Pattern(regexp = "(?i)^\\s*(easy|medium|hard|)\\s*$", message = "difficulty must be easy, medium, or hard") String difficulty,
            @RequestParam(defaultValue = "false") boolean verbose) {
        ApiResults result = adminService.addFromTriviaApi(limit, category, difficulty, verbose);
        return ResponseEntity.ok(result);
    }

    @PatchMapping("/questions")
    public ResponseEntity<Map<String, Long>> bulkUpdate(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Difficulty difficulty,
            @RequestParam(required = false) QuestionType type,
            @RequestParam(required = false) Source source,
            @RequestBody QuestionPatch patch) {
        return ResponseEntity.ok(adminService.bulkUpdate(category, difficulty, type, source, patch));
    }

    @DeleteMapping("/questions/{id}")
    public ResponseEntity<Void> deleteQuestionById(@PathVariable String id) {
        adminService.deleteQuestionById(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/questions")
    public ResponseEntity<CountResponse> deleteQuestionsByFilters(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Difficulty difficulty,
            @RequestParam(required = false) QuestionType type,
            @RequestParam(required = false) Source source
    ) {
        return ResponseEntity.ok(adminService.deleteByFilters(category, difficulty, type, source));
    }

    @GetMapping("/opentdb/metadata")
    public ResponseEntity<OpenTDBMetadata> getOpenTriviaMetadata() {
        return ResponseEntity.ok(openTDBLoader.getMetadata());
    }

    @GetMapping("/quiz-api/metadata")
    public ResponseEntity<ApiMetadata> getApiMetadata() {
        return ResponseEntity.ok(quizApiLoader.getMetadata());
    }

    @GetMapping("/trivia-api/metadata")
    public ResponseEntity<ApiMetadata> getTriviaApiMetadata() {
        return ResponseEntity.ok(triviaApiLoader.getMetadata());
    }
}
