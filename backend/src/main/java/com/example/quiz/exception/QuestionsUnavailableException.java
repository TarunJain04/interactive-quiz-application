package com.example.quiz.exception;

public class QuestionsUnavailableException extends RuntimeException {
    public QuestionsUnavailableException() {
        super("No questions available");
    }
}
