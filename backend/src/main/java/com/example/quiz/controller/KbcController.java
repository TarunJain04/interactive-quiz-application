package com.example.quiz.controller;

import com.example.quiz.dto.*;
import com.example.quiz.service.KbcService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/kbc")
@CrossOrigin(origins = "http://localhost:5173")
public class KbcController {
    private final KbcService service;
    public KbcController(KbcService service) { this.service = service; }

    @PostMapping("/start")
    public GameState start() { return service.start(); }

    @GetMapping("/{id}")
    public GameState get(@PathVariable String id) { return service.get(id); }

    @PostMapping("/{id}/answer")
    public AnswerResult answer(@PathVariable String id, @Valid @RequestBody AnswerRequest req) {
        return service.answer(id, req);
    }

    @PostMapping("/{id}/practice-answer")
    public PracticeAnswerResult practiceAnswer(@PathVariable String id, @Valid @RequestBody AnswerRequest req) {
        return service.practiceAnswer(id, req);
    }

    @PostMapping("/{id}/lifeline")
    public LifelineResult lifeline(@PathVariable String id, @Valid @RequestBody LifelineRequest req) {
        return service.lifeline(id, req.type());
    }

    @PostMapping("/{id}/quit")
    public GameState quit(@PathVariable String id) { return service.quit(id); }
}
