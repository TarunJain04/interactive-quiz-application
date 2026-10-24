package com.example.quiz.exception;

public class GameTimedOutException extends RuntimeException {
    public GameTimedOutException() {
        super("Time is up");
    }
}
