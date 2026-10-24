package com.example.quiz.exception;

public class QuizAlreadySubmittedException extends RuntimeException {
    public QuizAlreadySubmittedException(String message) {
        super(message);
    }
}
