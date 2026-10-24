package com.example.quiz.dto;

import com.example.quiz.model.Question;

import java.util.List;

public record ApiResults(int requested, int fetched, int inserted, List<Question> questions) {
}
