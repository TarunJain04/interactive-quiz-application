package com.example.quiz.exception;

public class GameNotFoundException extends RuntimeException {
    public GameNotFoundException(String id) {
        super("No game exists with id " + id);
    }
}
