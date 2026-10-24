package com.example.quiz.exception;

public class CurrentQuestionMismatchException extends RuntimeException {
    public CurrentQuestionMismatchException() {
        super("Not the current question");
    }
}
