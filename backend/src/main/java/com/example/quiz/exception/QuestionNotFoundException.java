package com.example.quiz.exception;

public class QuestionNotFoundException extends RuntimeException {
    public QuestionNotFoundException(String id) {
        super("No question exists with id " + id);
    }
}
