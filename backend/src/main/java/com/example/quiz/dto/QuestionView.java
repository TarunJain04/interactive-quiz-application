package com.example.quiz.dto;

import java.util.List;

public record QuestionView(String id, String question, List<String> choices) {}
