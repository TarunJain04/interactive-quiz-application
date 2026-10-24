package com.example.quiz.controller;

import com.example.quiz.dto.*;
import com.example.quiz.model.Difficulty;
import com.example.quiz.model.QuestionType;
import com.example.quiz.model.Source;
import com.example.quiz.service.QuizService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api")
@Validated
public class QuizController {
    private final QuizService quizService;

    public QuizController(QuizService quizService) {
        this.quizService = quizService;
    }

    @GetMapping("/questions/{id}")
    public QuestionResponse getQuestionById(@PathVariable String id) {
        return quizService.getQuestionById(id);
    }

    @GetMapping("/questions")
    public ResponseEntity<Page<QuestionResponse>> getQuestions(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) QuestionType type,
            @RequestParam(required = false) Difficulty difficulty,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy).ascending());
        Page<QuestionResponse> result = quizService.getQuestions(category, type, difficulty, pageable);
        return ResponseEntity.ok(result);
    }

//    @GetMapping("/questions/sample")
//    public ResponseEntity<List<QuestionResponse>> sampleQuestions(
//            @RequestParam(required = false) String category,
//            @RequestParam(required = false) QuestionType type,
//            @RequestParam(required = false) Difficulty difficulty,
//            @RequestParam(defaultValue = "10") @Min(1) @Max(50) int size) {
//        return ResponseEntity.ok(quizService.sampleQuestions(category, type, difficulty, size));
//    }


    @PostMapping("/quiz/{id}/submit")
    public ResponseEntity<QuizResult> getQuizResult(
            @PathVariable String id,
            @RequestBody @Valid QuizSubmission quizSubmission
            ) {
        return ResponseEntity.ok(quizService.getQuizResult(id, quizSubmission));
    }

    @GetMapping("/quiz/start")
    public ResponseEntity<SampleQuiz> startQuiz(
            @RequestParam(required = false) List<String> categories,
            @RequestParam(required = false) List<QuestionType> types,
            @RequestParam(required = false) List<Difficulty> difficulties,
            @RequestParam(defaultValue = "10") @Min(1) @Max(50) int size
    ) {
        return ResponseEntity.ok(quizService.getQuiz(categories, types, difficulties, size));
    }

    @GetMapping("/filters")
    public ResponseEntity<Filters> getFilters() {
        return ResponseEntity.ok(quizService.getFilters());
    }

    @GetMapping("/facets")
    public ResponseEntity<Facets> getFacets() {
        return ResponseEntity.ok(quizService.getFacets());
    }

    @GetMapping("/facets/count")
    public ResponseEntity<CountResponse> countByFilters(
            @RequestParam(required = false) List<String> categories,
            @RequestParam(required = false) List<Difficulty> difficulties,
            @RequestParam(required = false) List<QuestionType> types,
            @RequestParam(required = false) List<Source> sources
    ) {
        return ResponseEntity.ok(quizService.countByFilters(categories, difficulties, types, sources));
    }
}
